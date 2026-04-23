import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, GitBranch, GitCommit, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Commits({ projectId }) {
    const [open, setOpen] = useState(false);
    const [commits, setCommits] = useState([]);
    const token = localStorage.getItem("token");
    const [branch, setBranch] = useState("");
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setOpen(false);
        setBranch("");
        setError(null);

        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/branches`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Erro ao carregar branches.");
                }

                return res.json();
            })
            .then((data) => {
                const branchList = Array.isArray(data) ? data : [];
                setBranches(branchList);

                const defaultBranch =
                    branchList.find((item) => item.name === "main")?.name ||
                    branchList.find((item) => item.name === "master")?.name ||
                    branchList[0]?.name ||
                    "";

                setBranch(defaultBranch);
            })
            .catch((fetchError) => {
                setBranches([]);
                setLoading(false);
                setError(fetchError.message || "Erro ao carregar branches.");
            });
    }, [projectId, token]);

    useEffect(() => {
        if (!branch) {
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits?branch=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Erro ao carregar commits.");
                }

                return res.json();
            })
            .then((data) => {
                setCommits(Array.isArray(data) ? data : []);
            })
            .catch((fetchError) => {
                setCommits([]);
                setError(fetchError.message || "Erro ao carregar commits.");
            })
            .finally(() => setLoading(false));
    }, [projectId, branch, token]);

    return (
        <div className="space-y-4">
            <div className="relative w-fit">
                <motion.button
                    onClick={() => setOpen(!open)}
                    whileTap={{ scale: 0.98 }}
                    className="tech-button tech-button-active inline-flex items-center gap-2"
                >
                    <GitBranch size={14} />
                    {branch || "Selecionar branch"}
                    <ChevronDown size={14} />
                </motion.button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="tech-panel absolute z-50 mt-2 w-44 overflow-hidden"
                        >
                            {branches.map((item) => (
                                <div
                                    key={item.name}
                                    onClick={() => {
                                        setBranch(item.name);
                                        setOpen(false);
                                    }}
                                    className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-white/5"
                                >
                                    {item.name}
                                    {branch === item.name && <span className="text-cyan-300">•</span>}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {loading && (
                <div className="tech-panel-muted p-4 text-sm text-white/55">
                    Carregando commits...
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {!loading && !error && commits.length === 0 && (
                <div className="tech-panel-muted p-4 text-sm text-white/55">
                    Nenhum commit encontrado para esta branch.
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {commits.map((commit) => (
                    <motion.div
                        key={commit.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => navigate(`/projects/${projectId}/commits/${commit.id}`)}
                        className="tech-panel-muted cursor-pointer p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.06]"
                    >
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2 text-cyan-300">
                                <GitCommit size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-white">{commit.message}</p>
                                <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
                                    <User size={13} className="text-cyan-300" />
                                    {commit.author_name} • {new Date(commit.committed_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
