import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, GitCommit, GitBranch, User } from "lucide-react";

export default function Commits({ projectId }) {
    const [open, setOpen] = useState(false);
    const [commits, setCommits] = useState([]);
    const token = localStorage.getItem("token");
    const [branch, setBranch] = useState("main");
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits?branch=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then((res) => res.json())
            .then(setCommits)
            .catch(console.error);
    }, [projectId, branch, token]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/branches`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setBranches(data);
                const defaultBranch =
                    data.find((item) => item.name === "main")?.name ||
                    data.find((item) => item.name === "master")?.name ||
                    data[0]?.name;

                if (defaultBranch) {
                    setBranch((prev) => prev || defaultBranch);
                }
            })
            .catch(console.error);
    }, [projectId, token]);

    return (
        <div className="space-y-4">
            <div className="relative w-fit">
                <motion.button
                    onClick={() => setOpen(!open)}
                    whileTap={{ scale: 0.98 }}
                    className="tech-button tech-button-active inline-flex items-center gap-2"
                >
                    <GitBranch size={14} />
                    {branch}
                    <ChevronDown size={14} />
                </motion.button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="tech-panel absolute mt-2 w-44 overflow-hidden z-50"
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
                                    {branch === item.name && (
                                        <span className="text-cyan-300">●</span>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout">
                {commits.map((commit) => (
                    <motion.div
                        key={commit.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="tech-panel-muted p-4"
                    >
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2 text-cyan-300">
                                <GitCommit size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-white">{commit.message}</p>
                                <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
                                    <User size={13} className="text-cyan-300" />
                                    {commit.author_name} · {new Date(commit.committed_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
