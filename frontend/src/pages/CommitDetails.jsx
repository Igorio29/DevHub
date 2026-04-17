import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CalendarDays, MessageSquarePlus, User } from "lucide-react";

export default function CommitDetails() {
    const { projectId, sha } = useParams();

    const [diff, setDiff] = useState([]);
    const [commit, setCommit] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchDiff();
        fetchCommit();
    }, []);

    const fetchDiff = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}/diff`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });
            const data = await res.json();

            setDiff(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCommit = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits/${sha}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const data = await res.json();
            setCommit(data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="mx-auto w-full max-w-full space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_30px_rgba(59,130,246,0.04)]">
                <h1 className="text-lg font-bold text-white">
                    {commit?.message}
                </h1>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/60">
                    <span className="inline-flex items-center gap-2">
                        <User size={14} className="text-white/40" />
                        {commit?.author_name}
                    </span>

                    {commit?.created_at && (
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays size={14} className="text-white/40" />
                            {new Date(commit.created_at).toLocaleString()}
                        </span>
                    )}

                    <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-xs text-white/80">
                        {sha.substring(0, 7)}
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

            {diff.map((file, index) => (
                <div
                    key={index}
                    className="max-w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_24px_rgba(15,23,42,0.24)]"
                >
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-sm font-medium">
                        <span className="min-w-0 truncate text-white/90">
                            {file.new_path}
                        </span>

                        <span className="shrink-0 text-xs text-white/40">
                            +{file.diff.match(/\+/g)?.length || 0} / -{file.diff.match(/\-/g)?.length || 0}
                        </span>
                    </div>

                    <div className="max-w-full overflow-x-auto bg-[#020617] p-3 font-mono text-sm">
                        {file.diff.split("\n").map((line, i) => {
                            let bg = "";

                            if (line.startsWith("+")) bg = "bg-green-500/10";
                            if (line.startsWith("-")) bg = "bg-red-500/10";

                            return (
                                <div
                                    key={i}
                                    className={`group flex min-w-max items-start gap-2 rounded-lg ${bg}`}
                                >
                                    <div className="flex-1">
                                        <SyntaxHighlighter
                                            language="javascript"
                                            style={dracula}
                                            customStyle={{
                                                background: "transparent",
                                                margin: 0,
                                                padding: "2px 8px",
                                                minWidth: "max-content"
                                            }}
                                            codeTagProps={{
                                                style: {
                                                    background: "transparent"
                                                }
                                            }}
                                        >
                                            {line}
                                        </SyntaxHighlighter>
                                    </div>

                                    <button
                                        type="button"
                                        aria-label={`Comentar linha ${i + 1}`}
                                        className="
                                            mt-1 mr-2 shrink-0 rounded-md border border-white/10 bg-white/5 p-1.5
                                            text-white/40 opacity-0 transition-all duration-200
                                            group-hover:opacity-100 hover:bg-white/10 hover:text-white
                                        "
                                    >
                                        <MessageSquarePlus size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
