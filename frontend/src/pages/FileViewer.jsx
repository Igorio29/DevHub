import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChevronLeft, FileCode2 } from "lucide-react";

export default function FileViewer() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const path = searchParams.get("path");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchFile() {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/projects/${id}/file?path=${path}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json"
                        }
                    }
                );

                if (!res.ok) {
                    throw new Error("Erro ao carregar arquivo.");
                }

                const text = await res.text();
                setContent(text);
            } catch (fetchError) {
                setContent("");
                setError(fetchError.message || "Erro ao carregar arquivo.");
            } finally {
                setLoading(false);
            }
        }

        fetchFile();
    }, [id, path, token]);

    return (
        <div className="page-shell space-y-6">
            <section className="page-header">
                <button
                    type="button"
                    onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                            return;
                        }

                        navigate(`/project/${id}?tab=files`);
                    }}
                    className="mb-4 inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-cyan-300 transition hover:bg-white/[0.08]"
                >
                    <ChevronLeft size={14} />
                    Voltar para arquivos
                </button>

                <span className="page-kicker">Source Viewer</span>
                <div className="flex items-start gap-4">
                    <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                        <FileCode2 size={18} />
                    </span>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-semibold">{path}</h1>
                        <p className="mt-2 text-sm text-white/55">
                            Visualizacao do arquivo com leitura otimizada para codigo e paths longos.
                        </p>
                    </div>
                </div>
            </section>

            <section className="tech-panel overflow-hidden p-4">
                <div className="overflow-auto rounded-2xl border border-white/10 bg-[#0d1117] p-4">
                    {loading && (
                        <div className="space-y-3">
                            {[...Array(8)].map((_, index) => (
                                <div
                                    key={index}
                                    className="h-5 animate-pulse rounded bg-white/10"
                                    style={{ width: `${88 - index * 6}%` }}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <pre className="text-sm whitespace-pre-wrap">
                            <SyntaxHighlighter
                                language="php"
                                style={dracula}
                                showLineNumbers
                                wrapLongLines
                                customStyle={{
                                    background: "transparent",
                                    padding: "0",
                                    margin: 0
                                }}
                                codeTagProps={{
                                    style: {
                                        background: "transparent",
                                        lineHeight: "1.6"
                                    }
                                }}
                            >
                                {content}
                            </SyntaxHighlighter>
                        </pre>
                    )}
                </div>
            </section>
        </div>
    );
}
