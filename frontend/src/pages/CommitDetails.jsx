import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Bot, CalendarDays, LoaderCircle, MessageCircle, MessageSquarePlus, Sparkles, User } from "lucide-react";
import { showError, showSuccess } from "../utils/toast";

function parseFileDiff(diffText) {
    const lines = (diffText || "").split("\n");
    const parsed = [];
    let oldLineNumber = null;
    let newLineNumber = null;

    for (const rawLine of lines) {
        if (rawLine.startsWith("@@")) {
            const match = rawLine.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

            if (match) {
                oldLineNumber = Number(match[1]);
                newLineNumber = Number(match[2]);
            } else {
                oldLineNumber = null;
                newLineNumber = null;
            }

            parsed.push({
                kind: "hunk",
                text: rawLine,
                commentable: false,
                lineNumber: null,
                lineSide: null
            });
            continue;
        }

        if (
            rawLine.startsWith("diff --git") ||
            rawLine.startsWith("index ") ||
            rawLine.startsWith("new file mode") ||
            rawLine.startsWith("deleted file mode") ||
            rawLine.startsWith("--- ") ||
            rawLine.startsWith("+++ ")
        ) {
            parsed.push({
                kind: "meta",
                text: rawLine,
                commentable: false,
                lineNumber: null,
                lineSide: null
            });
            continue;
        }

        if (rawLine.startsWith("+") && !rawLine.startsWith("+++")) {
            parsed.push({
                kind: "add",
                text: rawLine,
                commentable: typeof newLineNumber === "number",
                lineNumber: newLineNumber,
                lineSide: "new"
            });
            if (typeof newLineNumber === "number") {
                newLineNumber += 1;
            }
            continue;
        }

        if (rawLine.startsWith("-") && !rawLine.startsWith("---")) {
            parsed.push({
                kind: "del",
                text: rawLine,
                commentable: typeof oldLineNumber === "number",
                lineNumber: oldLineNumber,
                lineSide: "old"
            });
            if (typeof oldLineNumber === "number") {
                oldLineNumber += 1;
            }
            continue;
        }

        const commentable = typeof newLineNumber === "number";

        parsed.push({
            kind: "context",
            text: rawLine,
            commentable,
            lineNumber: commentable ? newLineNumber : null,
            lineSide: commentable ? "new" : null
        });

        if (typeof oldLineNumber === "number") {
            oldLineNumber += 1;
        }

        if (typeof newLineNumber === "number") {
            newLineNumber += 1;
        }
    }

    return parsed;
}

function lineKey(filePath, lineSide, lineNumber) {
    return `${filePath}::${lineSide}::${lineNumber}`;
}

export default function CommitDetails() {
    const { projectId, sha } = useParams();

    const [diff, setDiff] = useState([]);
    const [commit, setCommit] = useState(null);
    const [comments, setComments] = useState([]);
    const [review, setReview] = useState(null);
    const [canComment, setCanComment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [commentSubmitError, setCommentSubmitError] = useState("");
    const [commentBody, setCommentBody] = useState("");
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [generatingReview, setGeneratingReview] = useState(false);
    const [commentsWarning, setCommentsWarning] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        let isActive = true;

        async function fetchCommitDetails() {
            setLoading(true);
            setError("");

            try {
                const [diffRes, commitRes] = await Promise.all([
                    fetch(
                        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}/diff`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json"
                            }
                        }
                    ),
                    fetch(
                        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json"
                            }
                        }
                    )
                ]);

                const diffErrorData = !diffRes.ok ? await diffRes.json().catch(() => null) : null;
                const commitErrorData = !commitRes.ok ? await commitRes.json().catch(() => null) : null;

                if (!diffRes.ok) {
                    throw new Error(diffErrorData?.error || "Erro ao buscar diff do commit");
                }

                if (!commitRes.ok) {
                    throw new Error(commitErrorData?.error || "Erro ao buscar commit");
                }

                const [diffData, commitData] = await Promise.all([
                    diffRes.json(),
                    commitRes.json()
                ]);

                if (!isActive) {
                    return;
                }

                setDiff(Array.isArray(diffData) ? diffData : []);
                setCommit(commitData);
            } catch (err) {
                console.error(err);

                if (isActive) {
                    setError(err instanceof Error ? err.message : "Erro ao carregar commit");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        fetchCommitDetails();

        return () => {
            isActive = false;
        };
    }, [projectId, sha, token]);

    useEffect(() => {
        setSelectedTarget(null);
        setCommentBody("");
        setCommentSubmitError("");
    }, [projectId, sha]);

    useEffect(() => {
        let isActive = true;

        async function fetchComments() {
            try {
                setCommentsWarning("");

                const [commentsRes, permissionRes] = await Promise.all([
                    fetch(
                        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}/comments`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json"
                            }
                        }
                    ),
                    fetch(
                        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}/comments/permission`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json"
                            }
                        }
                    )
                ]);

                if (!isActive) {
                    return;
                }

                if (permissionRes.ok) {
                    const permissionData = await permissionRes.json();
                    setCanComment(Boolean(permissionData.can_comment));
                    if (permissionData.permission_error) {
                        setCommentsWarning(permissionData.permission_error);
                    }
                } else {
                    setCanComment(false);
                }

                const commentsErrorData = !commentsRes.ok ? await commentsRes.json().catch(() => null) : null;

                if (!commentsRes.ok) {
                    throw new Error(commentsErrorData?.error || "Erro ao carregar comentarios");
                }

                const commentsData = await commentsRes.json();

                if (typeof commentsData.can_comment === "boolean") {
                    setCanComment(commentsData.can_comment);
                }

                setComments(Array.isArray(commentsData.comments) ? commentsData.comments : []);
                setReview(commentsData.review || null);
                setCommentsWarning(
                    commentsData.review_warning ||
                    commentsData.permission_error ||
                    ""
                );
            } catch (err) {
                console.error(err);

                if (isActive) {
                    setComments([]);
                    setReview(null);
                    setCanComment(false);
                    setCommentsWarning(err instanceof Error ? err.message : "Erro ao carregar comentarios");
                }
            }
        }

        fetchComments();

        return () => {
            isActive = false;
        };
    }, [projectId, sha, token]);

    const parsedDiff = useMemo(() => {
        return diff.map((file) => {
            const filePath = file.new_path || file.old_path || "Arquivo sem nome";

            return {
                ...file,
                filePath,
                lines: parseFileDiff(file.diff || "")
            };
        });
    }, [diff]);

    const commentsByLine = useMemo(() => {
        return comments.reduce((acc, comment) => {
            const key = lineKey(comment.file_path, comment.line_side, comment.line_number);

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key].push(comment);
            return acc;
        }, {});
    }, [comments]);

    const handleSelectLine = (filePath, line) => {
        if (!canComment || !line.commentable || !line.lineNumber) {
            return;
        }

        setSelectedTarget({
            filePath,
            lineNumber: line.lineNumber,
            lineSide: line.lineSide,
            lineText: line.text
        });
        setCommentBody("");
        setCommentSubmitError("");
    };

    const handleSubmitComment = async (event) => {
        event.preventDefault();

        const body = commentBody.trim();

        if (!body || submittingComment || !canComment || !selectedTarget) {
            return;
        }

        setSubmittingComment(true);
        setCommentSubmitError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}/comments`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        body,
                        file_path: selectedTarget.filePath,
                        line_number: selectedTarget.lineNumber,
                        line_side: selectedTarget.lineSide,
                        line_text: selectedTarget.lineText
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Erro ao enviar comentario");
            }

            setComments((current) => [...current, data]);
            setCommentBody("");
        } catch (err) {
            console.error(err);
            setCommentSubmitError(err instanceof Error ? err.message : "Erro ao enviar comentario");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleGenerateAiReview = async () => {
        if (generatingReview) {
            return;
        }

        setGeneratingReview(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}/comments/ai-review`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Erro ao gerar review com IA");
            }

            setReview(data.review || null);
            if (data.review_warning) {
                showError(data.review_warning);
            }
            setComments((current) => {
                const manualComments = current.filter((comment) => comment.user?.email !== "devhub-ai@local.dev");
                const aiComments = Array.isArray(data.comments) ? data.comments : [];

                return [...manualComments, ...aiComments];
            });

            showSuccess("Review automatico concluido");
        } catch (err) {
            console.error(err);
            showError(err instanceof Error ? err.message : "Erro ao gerar review com IA");
        } finally {
            setGeneratingReview(false);
        }
    };

    if (loading) return <p>Carregando...</p>;

    if (error) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_30px_rgba(59,130,246,0.04)] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            {commit?.message || "Commit details"}
                        </h1>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/60">
                            <span className="inline-flex items-center gap-2">
                                <User size={14} className="text-white/40" />
                                {commit?.author_name || "Autor desconhecido"}
                            </span>

                            {commit?.created_at && (
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays size={14} className="text-white/40" />
                                    {new Date(commit.created_at).toLocaleString()}
                                </span>
                            )}

                            <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-xs text-white/80">
                                {sha?.substring(0, 7) || "-------"}
                            </span>

                            {commit?.stats && (
                                <>
                                    <span className="text-green-400">
                                        +{commit.stats.additions}
                                    </span>
                                    <span className="text-red-400">
                                        -{commit.stats.deletions}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateAiReview}
                        disabled={generatingReview}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {generatingReview ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {generatingReview ? "Analisando commit..." : "Gerar review com IA"}
                    </button>
                </div>
            </div>

            {review && (
                <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 shadow-[0_0_24px_rgba(34,211,238,0.08)] sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100">
                                <Bot size={16} />
                                Review automatico da IA
                            </p>
                            <p className="mt-2 max-w-3xl text-sm text-white/70">
                                {review.summary}
                            </p>
                            {review.model && (
                                <p className="mt-2 text-xs text-white/40">
                                    Modelo: {review.model}
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">
                                Nota do dev
                            </p>
                            <p className="mt-1 text-3xl font-bold text-white">
                                {review.score}
                                <span className="text-base text-white/45">/10</span>
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {commentsWarning && (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                    {commentsWarning}
                </div>
            )}

            {parsedDiff.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                    Nenhuma alteracao encontrada para este commit.
                </div>
            ) : (
                parsedDiff.map((file, index) => {
                    const additions = file.lines.filter((line) => line.kind === "add").length;
                    const deletions = file.lines.filter((line) => line.kind === "del").length;

                    return (
                        <div
                            key={`${file.filePath}-${index}`}
                            className="max-w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_24px_rgba(15,23,42,0.24)]"
                        >
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-3 py-3 text-sm font-medium sm:px-4">
                                <span className="min-w-0 truncate text-white/90">
                                    {file.filePath}
                                </span>

                                <span className="hidden shrink-0 text-xs text-white/40 sm:block">
                                    +{additions} / -{deletions}
                                </span>
                            </div>

                            <div className="max-w-full overflow-x-auto bg-[#020617]">
                                <div className="min-w-max p-3 font-mono text-sm leading-6 text-white/85">
                                    {file.lines.map((line, lineIndex) => {
                                        const locationKey = line.commentable
                                            ? lineKey(file.filePath, line.lineSide, line.lineNumber)
                                            : null;
                                        const lineComments = locationKey ? commentsByLine[locationKey] || [] : [];
                                        const isSelected =
                                            selectedTarget &&
                                            selectedTarget.filePath === file.filePath &&
                                            selectedTarget.lineNumber === line.lineNumber &&
                                            selectedTarget.lineSide === line.lineSide;

                                        const rowClass =
                                            line.kind === "add"
                                                ? "bg-green-500/10 text-green-200"
                                                : line.kind === "del"
                                                    ? "bg-red-500/10 text-red-200"
                                                    : line.kind === "hunk"
                                                        ? "text-cyan-200"
                                                        : line.kind === "meta"
                                                            ? "text-white/45"
                                                            : "";

                                        return (
                                            <div
                                                key={`${file.filePath}-${lineIndex}`}
                                                className="relative"
                                            >
                                                <div
                                                    className={`group flex items-start gap-3 rounded px-2 py-0.5 transition ${
                                                        isSelected ? "ring-1 ring-cyan-400/30 bg-cyan-400/5" : ""
                                                    } ${rowClass}`}
                                                >
                                                    <div className="w-16 shrink-0 select-none text-right text-[11px] text-white/35">
                                                        {line.lineNumber ? String(line.lineNumber).padStart(4, " ") : " "}
                                                    </div>

                                                    <div className="min-w-0 flex-1 whitespace-pre-wrap break-all">
                                                        {line.text || " "}
                                                    </div>

                                                    <div className="mt-0.5 flex shrink-0 items-start gap-2">
                                                        {lineComments.length > 0 && (
                                                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55">
                                                                {lineComments.length}
                                                            </span>
                                                        )}

                                                        {line.commentable && (
                                                            <button
                                                                type="button"
                                                                disabled={!canComment}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleSelectLine(file.filePath, line);
                                                                }}
                                                                aria-label={`Comentar linha ${line.lineNumber} em ${file.filePath}`}
                                                                className={`shrink-0 rounded-md border border-white/10 bg-white/5 p-1.5 text-white/40 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:opacity-100 disabled:cursor-not-allowed disabled:text-white/30 ${
                                                                    isSelected || lineComments.length > 0
                                                                        ? "opacity-100"
                                                                        : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                                                                }`}
                                                            >
                                                                <MessageCircle size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {lineComments.length > 0 && (
                                                    <div className="ml-16 space-y-2 border-l border-white/10 pl-4 pb-3">
                                                        {lineComments.map((comment) => (
                                                            <article
                                                                key={comment.id}
                                                                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                                                            >
                                                                <div className="flex items-center gap-2 text-xs text-white/45">
                                                                    <span className="font-medium text-white/70">
                                                                        {comment.user?.name || "Usuario removido"}
                                                                    </span>
                                                                    <span>
                                                                        {comment.created_at
                                                                            ? new Date(comment.created_at).toLocaleString()
                                                                            : ""}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-2 whitespace-pre-wrap text-white/75">
                                                                    {comment.body}
                                                                </p>
                                                            </article>
                                                        ))}
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div
                                                        className="ml-16 mt-2 rounded-2xl border border-cyan-400/20 bg-[#07101f] p-3"
                                                        onClick={(event) => event.stopPropagation()}
                                                    >
                                                        <textarea
                                                            value={commentBody}
                                                            onChange={(event) => setCommentBody(event.target.value)}
                                                            disabled={!canComment || submittingComment}
                                                            rows={3}
                                                            onClick={(event) => event.stopPropagation()}
                                                            className="w-full rounded-xl border border-white/10 bg-[#07101f] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                                                            placeholder="Escreva um comentario sobre esta linha"
                                                        />

                                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                                            <p className="text-xs text-white/45">
                                                                {canComment
                                                                    ? "Apenas o owner do projeto pode publicar comentarios neste commit."
                                                                    : "Voce pode ler os comentarios, mas nao tem permissao para publicar."}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleSubmitComment(event);
                                                                }}
                                                                onMouseDown={(event) => event.stopPropagation()}
                                                                disabled={!canComment || submittingComment || !commentBody.trim() || !selectedTarget}
                                                                className="tech-button tech-button-active inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <MessageSquarePlus size={14} />
                                                                {submittingComment ? "Enviando..." : "Publicar comentario"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setSelectedTarget(null);
                                                                    setCommentBody("");
                                                                }}
                                                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65 transition hover:bg-white/10 hover:text-white"
                                                            >
                                                                Limpar
                                                            </button>
                                                        </div>

                                                        {commentSubmitError && (
                                                            <p className="mt-2 text-sm text-red-300">{commentSubmitError}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
