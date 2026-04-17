import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, FileCode2, FolderTree } from "lucide-react";

export default function FileExplorer({ projectId }) {
    const [files, setFiles] = useState([]);
    const [path, setPath] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    async function fetchFiles(currentPath = "") {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/files?path=${currentPath}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
        );
        const data = await res.json();
        setFiles(data);
    }

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="tech-panel p-4"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="page-kicker">Repository Tree</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">Arquivos</h2>
                </div>
                <span className="tech-badge">{files.length} itens</span>
            </div>

            <div className="tech-panel-muted mb-4 p-3 text-xs text-white/55">
                {path || "root/"}
            </div>

            {path && (
                <button
                    onClick={() => {
                        const newPath = path.split("/").slice(0, -1).join("/");
                        setPath(newPath);
                        fetchFiles(newPath);
                    }}
                    className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-cyan-300 transition hover:bg-white/[0.08]"
                >
                    <ChevronLeft size={14} />
                    Voltar
                </button>
            )}

            <ul className="space-y-2 text-sm">
                {files.map((file) => (
                    <motion.li
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3 transition hover:border-cyan-400/15 hover:bg-white/[0.06]"
                        key={file.id}
                        onClick={() => {
                            if (file.type === "tree") {
                                setPath(file.path);
                                fetchFiles(file.path);
                            } else if (file.type === "blob") {
                                navigate(`/project/${projectId}/file?path=${file.path}`);
                            }
                        }}
                    >
                        <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2 text-cyan-300">
                            {file.type === "tree" ? <FolderTree size={15} /> : <FileCode2 size={15} />}
                        </span>

                        <div className="min-w-0">
                            <p className="truncate text-sm text-white">{file.name}</p>
                            <p className="truncate text-xs text-white/40">{file.path}</p>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}
