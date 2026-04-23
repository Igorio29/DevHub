import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, FileCode2, FolderTree } from "lucide-react";

export default function FileExplorer({ projectId }) {
    const [files, setFiles] = useState([]);
    const [path, setPath] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    async function fetchFiles(currentPath = "") {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/files?path=${currentPath}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Erro ao carregar os arquivos do repositório.");
            }

            const data = await res.json();
            setFiles(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            setFiles([]);
            setError(fetchError.message || "Erro ao carregar os arquivos do repositório.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPath("");
        fetchFiles();
    }, [projectId]);

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

            {loading && (
                <div className="mb-4 space-y-3">
                    <div className="tech-panel-muted flex items-center justify-between px-4 py-3 text-sm text-white/60">
                        <span>Carregando estrutura do repositório...</span>
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
                    </div>

                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="tech-panel-muted flex items-center gap-3 px-3 py-3"
                        >
                            <div className="h-9 w-9 animate-pulse rounded-xl bg-white/10" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div
                                    className="h-3 animate-pulse rounded bg-white/10"
                                    style={{ width: `${72 - index * 8}%` }}
                                />
                                <div
                                    className="h-3 animate-pulse rounded bg-white/5"
                                    style={{ width: `${54 - index * 6}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

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

            {!loading && !error && files.length === 0 && (
                <div className="tech-panel-muted p-4 text-sm text-white/55">
                    Nenhum item encontrado neste caminho.
                </div>
            )}

            <ul className={`space-y-2 text-sm transition-opacity duration-200 ${loading ? "opacity-70" : "opacity-100"}`}>
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
