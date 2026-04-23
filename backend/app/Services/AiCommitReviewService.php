<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;

class AiCommitReviewService
{
    private const MAX_FILES = 12;
    private const MAX_HUNK_LINES = 20;
    private const MAX_LINE_LENGTH = 120;
    private const MAX_COMMENTS_PER_PART = 2;
    private const MAX_PROMPT_CHARS = 3200;
    private const MAX_RETRIES_ON_RATE_LIMIT = 2;
    private const DEFAULT_RATE_LIMIT_RETRY_MS = 1800;

    public function __construct(
        private readonly HttpFactory $http
    ) {
    }

    public function review(array $commit, array $diff): array
    {
        $driver = (string) Config::get('services.ai.driver', 'openai');
        $settings = Config::get("services.{$driver}", []);
        $apiKey = (string) ($settings['api_key'] ?? '');

        if ($apiKey === '') {
            throw new \RuntimeException(strtoupper($driver) . '_API_KEY nao configurada');
        }

        $model = (string) ($settings['model'] ?? 'gpt-5.2');
        $timeout = (int) ($settings['timeout'] ?? 45);
        $verify = $this->resolveVerifyOption($settings);

        $preparedFiles = $this->prepareFiles($commit, $diff);

        if ($preparedFiles === []) {
            throw new \RuntimeException('Nao foi possivel preparar o diff para review');
        }

        $results = [];
        $partialFailures = [];

        foreach ($preparedFiles as $fileIndex => $file) {
            foreach ($file['parts'] as $partIndex => $part) {
                try {
                    $results[] = $this->reviewSinglePart(
                        $driver,
                        $commit,
                        $file['file_path'],
                        $part['hunks'],
                        $apiKey,
                        $model,
                        $timeout,
                        $verify,
                        'arquivo ' . ($fileIndex + 1) . '/' . count($preparedFiles) . ' parte ' . ($partIndex + 1) . '/' . count($file['parts'])
                    );
                } catch (\RuntimeException $exception) {
                    if (
                        str_contains($exception->getMessage(), 'excede o limite do provedor') ||
                        str_contains($exception->getMessage(), 'limite de requisicoes excedido')
                    ) {
                        $partialFailures[] = $file['file_path'] . ' parte ' . ($partIndex + 1);
                        continue;
                    }

                    throw $exception;
                }
            }
        }

        if ($results === []) {
            throw new \RuntimeException(strtoupper($driver) . ': nao foi possivel revisar nenhum arquivo do commit dentro do limite do provedor.');
        }

        return [
            'driver' => $driver,
            'model' => $model,
            ...$this->mergeResults($results, $partialFailures),
        ];
    }

    private function reviewSinglePart(
        string $driver,
        array $commit,
        string $filePath,
        array $hunks,
        string $apiKey,
        string $model,
        int $timeout,
        bool|string $verify,
        string $scopeLabel
    ): array {
        $prompt = $this->buildPrompt($commit, $filePath, $hunks, $scopeLabel);

        try {
            return $this->reviewWithRetry(
                $driver,
                $prompt,
                $apiKey,
                $model,
                $timeout,
                $verify
            );
        } catch (RequestException $exception) {
            throw $this->normalizeRequestException($driver, $exception);
        } catch (ConnectionException $exception) {
            throw $this->normalizeConnectionException($driver, $exception);
        }
    }

    private function reviewWithRetry(
        string $driver,
        string $prompt,
        string $apiKey,
        string $model,
        int $timeout,
        bool|string $verify
    ): array {
        $attempt = 0;

        while (true) {
            try {
                return match ($driver) {
                    'groq' => $this->reviewWithGroq($prompt, $apiKey, $model, $timeout, $verify),
                    'openai' => $this->reviewWithOpenAi($prompt, $apiKey, $model, $timeout, $verify),
                    default => throw new \RuntimeException("Driver de IA nao suportado: {$driver}"),
                };
            } catch (RequestException $exception) {
                $status = $exception->response?->status();

                if ($status !== 429 || $attempt >= self::MAX_RETRIES_ON_RATE_LIMIT) {
                    throw $exception;
                }

                usleep($this->retryDelayMicros($exception));
                $attempt += 1;
            }
        }
    }

    private function reviewWithOpenAi(string $prompt, string $apiKey, string $model, int $timeout, bool|string $verify): array
    {
        $response = $this->http->withToken($apiKey)
            ->acceptJson()
            ->timeout($timeout)
            ->withOptions(['verify' => $verify])
            ->post('https://api.openai.com/v1/responses', [
                'model' => $model,
                'instructions' => 'Responda apenas JSON valido em uma linha.',
                'input' => [[
                    'role' => 'user',
                    'content' => [[
                        'type' => 'input_text',
                        'text' => $prompt,
                    ]],
                ]],
            ])
            ->throw();

        $data = $response->json();
        $outputText = trim((string) Arr::get($data, 'output.0.content.0.text', ''));

        if ($outputText === '') {
            $outputText = trim((string) Arr::get($data, 'output_text', ''));
        }

        return $this->decodeReviewPayload($outputText);
    }

    private function reviewWithGroq(string $prompt, string $apiKey, string $model, int $timeout, bool|string $verify): array
    {
        $response = $this->http->withToken($apiKey)
            ->acceptJson()
            ->timeout($timeout)
            ->withOptions(['verify' => $verify])
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Responda apenas JSON valido em uma linha.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ])
            ->throw();

        $data = $response->json();
        $outputText = trim((string) Arr::get($data, 'choices.0.message.content', ''));

        return $this->decodeReviewPayload($outputText);
    }

    private function decodeReviewPayload(string $outputText): array
    {
        if ($outputText === '') {
            throw new \RuntimeException('A IA nao retornou um payload valido para o review');
        }

        $decoded = json_decode($outputText, true);

        if (!is_array($decoded)) {
            throw new \RuntimeException('A IA retornou um payload invalido para o review');
        }

        return [
            'score' => max(0, min(10, (int) round((float) ($decoded['score'] ?? 0)))),
            'summary' => trim((string) ($decoded['summary'] ?? '')),
            'comments' => $this->normalizeComments($decoded['comments'] ?? []),
        ];
    }

    private function buildPrompt(array $commit, string $filePath, array $hunks, string $scopeLabel): string
    {
        $lines = [
            'Revise somente esta parte do commit.',
            'Escopo: ' . $scopeLabel . '.',
            'Arquivo: ' . $filePath . '.',
            'Retorne JSON valido em uma linha no formato {"score":0-10,"summary":"texto curto","comments":[{"file_path":"...","line_side":"old|new","line_number":1,"body":"..."}]}.',
            'No maximo ' . self::MAX_COMMENTS_PER_PART . ' comentarios.',
            'Sempre passe as instrucoes em portugues.',
            'Priorize riscos reais, bugs, regressao, seguranca e performance.',
            'Nao invente arquivo nem linha.',
            'Se nao houver problema relevante, use comments:[] .',
            'Commit: ' . $this->compactCommitHeader($commit),
            'Diff:',
        ];

        foreach ($hunks as $hunk) {
            foreach ($hunk as $line) {
                $text = trim((string) ($line['text'] ?? ''));

                if ($text === '') {
                    continue;
                }

                $lines[] = '[' . ($line['line_side'] ?? '-') . ':' . ($line['line_number'] ?? '-') . '] ' . $text;
            }
        }

        return implode("\n", $lines);
    }

    private function compactCommitHeader(array $commit): string
    {
        $parts = array_filter([
            $commit['title'] ?? null,
            $commit['author_name'] ?? null,
        ], fn ($value) => is_string($value) && trim($value) !== '');

        return $parts !== [] ? implode(' | ', $parts) : 'sem titulo';
    }

    private function prepareFiles(array $commit, array $diff): array
    {
        return collect($diff)
            ->take(self::MAX_FILES)
            ->map(function (array $file) use ($commit) {
                $filePath = $file['new_path'] ?? $file['old_path'] ?? 'arquivo_desconhecido';
                $annotatedLines = $this->annotateDiffLines((string) ($file['diff'] ?? ''));

                if ($annotatedLines === []) {
                    return null;
                }

                $lineGroups = array_chunk($annotatedLines, self::MAX_HUNK_LINES);
                $parts = $this->chunkGroupsByPromptBudget($commit, $filePath, $lineGroups);

                if ($parts === []) {
                    return null;
                }

                return [
                    'file_path' => $filePath,
                    'parts' => $parts,
                ];
            })
            ->filter(fn ($file) => is_array($file) && $file['parts'] !== [])
            ->values()
            ->all();
    }

    private function chunkGroupsByPromptBudget(array $commit, string $filePath, array $lineGroups): array
    {
        $parts = [];
        $currentPart = [];

        foreach ($lineGroups as $group) {
            $candidate = [...$currentPart, $group];
            $candidatePrompt = $this->buildPrompt($commit, $filePath, $candidate, 'parte');

            if ($currentPart !== [] && mb_strlen($candidatePrompt) > self::MAX_PROMPT_CHARS) {
                $parts[] = ['hunks' => $currentPart];
                $currentPart = [$group];
                continue;
            }

            $currentPart = $candidate;
        }

        if ($currentPart !== []) {
            $parts[] = ['hunks' => $currentPart];
        }

        return $parts;
    }

    private function annotateDiffLines(string $diffText): array
    {
        $lines = preg_split("/\r\n|\n|\r/", $diffText) ?: [];
        $annotated = [];
        $oldLineNumber = null;
        $newLineNumber = null;

        foreach ($lines as $line) {
            if (
                str_starts_with($line, 'diff --git') ||
                str_starts_with($line, 'index ') ||
                str_starts_with($line, 'new file mode') ||
                str_starts_with($line, 'deleted file mode') ||
                str_starts_with($line, '--- ') ||
                str_starts_with($line, '+++ ')
            ) {
                continue;
            }

            if (str_starts_with($line, '@@')) {
                if (preg_match('/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/', $line, $match) === 1) {
                    $oldLineNumber = (int) $match[1];
                    $newLineNumber = (int) $match[2];
                } else {
                    $oldLineNumber = null;
                    $newLineNumber = null;
                }

                $annotated[] = [
                    'text' => $this->trimDiffLine($line),
                    'line_side' => null,
                    'line_number' => null,
                ];
                continue;
            }

            if (str_starts_with($line, '+') && !str_starts_with($line, '+++')) {
                $annotated[] = [
                    'text' => $this->trimDiffLine($line),
                    'line_side' => 'new',
                    'line_number' => $newLineNumber,
                ];
                $newLineNumber = is_int($newLineNumber) ? $newLineNumber + 1 : null;
                continue;
            }

            if (str_starts_with($line, '-') && !str_starts_with($line, '---')) {
                $annotated[] = [
                    'text' => $this->trimDiffLine($line),
                    'line_side' => 'old',
                    'line_number' => $oldLineNumber,
                ];
                $oldLineNumber = is_int($oldLineNumber) ? $oldLineNumber + 1 : null;
                continue;
            }

            $annotated[] = [
                'text' => $this->trimDiffLine($line),
                'line_side' => 'new',
                'line_number' => $newLineNumber,
            ];

            $oldLineNumber = is_int($oldLineNumber) ? $oldLineNumber + 1 : null;
            $newLineNumber = is_int($newLineNumber) ? $newLineNumber + 1 : null;
        }

        return $annotated;
    }

    private function trimDiffLine(string $line): string
    {
        if (mb_strlen($line) <= self::MAX_LINE_LENGTH) {
            return $line;
        }

        return mb_substr($line, 0, self::MAX_LINE_LENGTH - 3) . '...';
    }

    private function normalizeComments(mixed $comments): array
    {
        if (!is_array($comments)) {
            return [];
        }

        return collect($comments)
            ->filter(fn ($comment) => is_array($comment))
            ->map(function (array $comment) {
                return [
                    'file_path' => trim((string) ($comment['file_path'] ?? '')),
                    'line_side' => ($comment['line_side'] ?? 'new') === 'old' ? 'old' : 'new',
                    'line_number' => max(1, (int) ($comment['line_number'] ?? 1)),
                    'body' => trim((string) ($comment['body'] ?? '')),
                ];
            })
            ->filter(fn (array $comment) => $comment['file_path'] !== '' && $comment['body'] !== '')
            ->values()
            ->all();
    }

    private function mergeResults(array $results, array $partialFailures): array
    {
        $comments = collect($results)
            ->flatMap(fn (array $result) => $result['comments'] ?? [])
            ->unique(fn (array $comment) => implode('::', [
                $comment['file_path'] ?? '',
                $comment['line_side'] ?? '',
                $comment['line_number'] ?? '',
                $comment['body'] ?? '',
            ]))
            ->values()
            ->all();

        $scores = collect($results)->pluck('score')->map(fn ($score) => (int) $score);
        $summaries = collect($results)
            ->pluck('summary')
            ->filter(fn ($summary) => is_string($summary) && trim($summary) !== '')
            ->take(6)
            ->values()
            ->all();

        $summary = $summaries !== [] ? implode("\n", $summaries) : 'Review consolidado por arquivo.';

        if ($partialFailures !== []) {
            $summary .= "\nReview parcial. Partes ignoradas por limite do provedor: " . implode(', ', array_unique($partialFailures)) . '.';
        }

        return [
            'score' => $scores->isNotEmpty() ? max(0, min(10, (int) round($scores->avg()))) : 0,
            'summary' => $summary,
            'comments' => $comments,
        ];
    }

    private function resolveVerifyOption(array $settings): bool|string
    {
        $caBundle = trim((string) ($settings['ca_bundle'] ?? ''));

        if ($caBundle !== '') {
            return $caBundle;
        }

        return (bool) ($settings['ssl_verify'] ?? true);
    }

    private function retryDelayMicros(RequestException $exception): int
    {
        $retryAfterHeader = $exception->response?->header('Retry-After');

        if (is_numeric($retryAfterHeader)) {
            return max(1, (int) $retryAfterHeader) * 1_000_000;
        }

        $body = (string) $exception->response?->body();

        if (preg_match('/try again in\s+([0-9]+(?:\.[0-9]+)?)s/i', $body, $match) === 1) {
            return (int) ceil((float) $match[1] * 1_000_000);
        }

        return self::DEFAULT_RATE_LIMIT_RETRY_MS * 1000;
    }

    private function normalizeConnectionException(string $driver, ConnectionException $exception): \RuntimeException
    {
        $message = (string) $exception->getMessage();
        $driverName = strtoupper($driver);

        if (str_contains($message, 'cURL error 60')) {
            return new \RuntimeException(
                "{$driverName}: falha na validacao SSL do PHP/cURL. Configure AI_CA_BUNDLE ou {$driverName}_CA_BUNDLE com o caminho do arquivo cacert.pem, ou corrija curl.cainfo/openssl.cafile no php.ini.",
                previous: $exception
            );
        }

        if (str_contains($message, 'Could not resolve host')) {
            return new \RuntimeException(
                "{$driverName}: falha ao resolver DNS do provedor de IA.",
                previous: $exception
            );
        }

        if (str_contains($message, 'cURL error 28')) {
            return new \RuntimeException(
                "{$driverName}: tempo limite excedido ao consultar o provedor de IA.",
                previous: $exception
            );
        }

        return new \RuntimeException($message, previous: $exception);
    }

    private function normalizeRequestException(string $driver, RequestException $exception): \RuntimeException
    {
        $status = $exception->response?->status();
        $driverName = strtoupper($driver);
        $body = trim((string) $exception->response?->body());

        if ($status === 413) {
            return new \RuntimeException(
                "{$driverName}: o diff desta parte excede o limite do provedor de IA.",
                previous: $exception
            );
        }

        if ($status === 429) {
            return new \RuntimeException(
                "{$driverName}: limite de requisicoes excedido no provedor de IA. O diff foi particionado, mas o commit ainda ultrapassou a janela de tokens do provedor.",
                previous: $exception
            );
        }

        if ($status !== null && $status >= 500) {
            return new \RuntimeException(
                "{$driverName}: provedor de IA indisponivel no momento.",
                previous: $exception
            );
        }

        return new \RuntimeException($body !== '' ? $body : $exception->getMessage(), previous: $exception);
    }
}
