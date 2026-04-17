import { useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useEffect, useState } from "react";

export default function CommitDetails() {
    const { projectId, sha } = useParams();

    const [diff, setDiff] = useState([]);
    const [commit, setCommit] = useState(null);

    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token")



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
        <div className="p-6">

            {/* HEADER */}
            <div className="mb-6 border-b border-white/10 pb-4">
                <h1 className="text-lg font-bold text-white">
                    {commit?.message}
                </h1>

                <div className="text-sm text-white/60 mt-2 flex gap-4 flex-wrap">
                    <span>👤 {commit?.author_name}</span>

                    {commit?.created_at && (
                        <span>📅 {new Date(commit.created_at).toLocaleString()}</span>
                    )}

                    <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">
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

            {/* FILES */}
            {diff.map((file, index) => (
                <div
                    key={index}
                    className="mb-6 border border-white/10 rounded-xl overflow-hidden"
                >

                    {/* HEADER DO ARQUIVO */}
                    <div className="bg-white/5 px-4 py-2 text-sm font-medium flex justify-between">
                        <span>{file.new_path}</span>
                        <span className="text-white/40 text-xs">
                            +{file.diff.match(/\+/g)?.length || 0} / -{file.diff.match(/\-/g)?.length || 0}
                        </span>
                    </div>

                    {/* DIFF */}
                    <div className="bg-[#020617] p-4 font-mono text-sm overflow-x-auto">

                        {file.diff.split("\n").map((line, i) => {
                            let bg = "";

                            if (line.startsWith("+")) bg = "bg-green-500/10";
                            if (line.startsWith("-")) bg = "bg-red-500/10";

                            return (
                                <div key={i} className={bg}>
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={dracula}
                                        customStyle={{
                                            background: "transparent",
                                            margin: 0,
                                            padding: "2px 8px"
                                        }}
                                        codeTagProps={{
                                            style: { background: "transparent" }
                                        }}
                                    >
                                        {line}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        })}

                    </div>
                </div>
            ))}
        </div>
    );
}