import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileCode2 } from "lucide-react";

export default function FileViewer() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const token = localStorage.getItem("token");
    const path = searchParams.get("path");
    const [content, setContent] = useState("");

    useEffect(() => {
        async function fetchFile() {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${id}/file?path=${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const text = await res.text();
            setContent(text);
        }

        fetchFile();
    }, [id, path, token]);

    return (
        <div className="page-shell space-y-6">
            <section className="page-header">
                <span className="page-kicker">Source Viewer</span>
                <div className="flex items-start gap-4">
                    <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                        <FileCode2 size={18} />
                    </span>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-semibold">{path}</h1>
                        <p className="mt-2 text-sm text-white/55">
                            Visualização do arquivo com leitura otimizada para código e paths longos.
                        </p>
                    </div>
                </div>
            </section>

            <section className="tech-panel overflow-hidden p-4">
                <div className="overflow-auto rounded-2xl border border-white/10 bg-[#0d1117] p-4">
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
                </div>
            </section>
        </div>
    );
}
