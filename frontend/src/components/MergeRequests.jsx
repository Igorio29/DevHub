import { useEffect, useState } from "react";
import { AlertTriangle, GitPullRequestArrow, ShieldAlert, User } from "lucide-react";

export default function MergeRequests({ projectId }) {
    const [mrs, setMrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/merge-requests`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((err) => { throw new Error(err.error || "Erro na API"); });
                }
                return res.json();
            })
            .then((data) => {
                setMrs(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [projectId, token]);

    if (loading) return <div className="text-sm text-white/50">Carregando Merge Requests...</div>;

    if (error) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                Erro: {error}
            </div>
        );
    }

    if (mrs.length === 0) {
        return <div className="text-sm text-white/50">Nenhum Merge Request encontrado.</div>;
    }

    return (
        <div className="space-y-3">
            {mrs.map((mr) => {
                const hasConflict = mr.has_conflicts && mr.state === "opened";

                return (
                    <div
                        key={mr.id}
                        className={`rounded-2xl border p-4 transition ${
                            hasConflict
                                ? "border-red-500/25 bg-red-500/10"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                                <span className={`rounded-xl border p-2 ${hasConflict ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-cyan-400/15 bg-cyan-400/10 text-cyan-300"}`}>
                                    <GitPullRequestArrow size={15} />
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate font-medium text-white">{mr.title}</p>
                                    <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
                                        <User size={13} className="text-cyan-300" />
                                        {mr.author?.name || "Autor desconhecido"}
                                    </p>
                                </div>
                            </div>

                            {hasConflict && (
                                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-red-300">
                                    <ShieldAlert size={12} />
                                    Conflito
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/45">
                            <span className="capitalize">Status: {mr.state}</span>
                            {hasConflict && (
                                <span className="inline-flex items-center gap-1 text-red-300">
                                    <AlertTriangle size={12} />
                                    Atenção necessária
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
