import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, Shield, Users } from "lucide-react";
import Commits from "../components/Commits";
import MergeRequests from "../components/MergeRequests";
import FileExplorer from "../components/FileExplorer";

export default function ProjectDetails() {
    const { id } = useParams();
    const [tab, setTab] = useState("commits");
    const token = localStorage.getItem("token");
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [totalCommits, setTotalCommits] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const projectRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });
            const projectData = await projectRes.json();

            const membersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/members`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });
            if (!membersRes.ok) {
                console.error("Erro ao buscar membros");
                return;
            }

            const membersData = await membersRes.json();
            const commitsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/commits`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });
            const commitsData = await commitsRes.json();

            setProject(projectData);
            setMembers(membersData);
            setTotalCommits(commitsData.length);
        }

        fetchData();
    }, [id, token]);

    if (!project) return <p className="page-shell animate-pulse text-gray-500">Carregando...</p>;

    const cleanMembers = Array.isArray(members)
        ? members.filter((m) =>
            m.state === "active" &&
            m.access_level >= 10 &&
            !m.bot &&
            m.name !== "Ghost User"
        )
        : [];

    const owner = cleanMembers.find((m) => m.access_level === 50);

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="page-shell space-y-6"
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="page-header"
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-cyan-400/10">
                        {project.avatar_url ? (
                            <img
                                src={project.avatar_url}
                                alt="avatar"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FolderGit2 size={36} className="text-cyan-300" />
                        )}
                    </div>

                    <div className="flex-1">
                        <span className="page-kicker">Project Node</span>
                        <h1 className="mt-2 text-3xl font-bold">{project.name}</h1>
                        <p className="mt-3 max-w-3xl text-sm text-white/60">
                            {project.description || "Sem descrição"}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-4">
                            <div className="tech-panel-muted flex items-center gap-3 px-4 py-3">
                                <Shield size={16} className="text-cyan-300" />
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Owner</p>
                                    <p className="text-sm text-white">{owner?.name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="tech-panel-muted flex items-center gap-3 px-4 py-3">
                                <Users size={16} className="text-cyan-300" />
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Participantes</p>
                                    <p className="text-sm text-white">{members.length}</p>
                                </div>
                            </div>

                            <div className="tech-panel-muted flex items-center gap-3 px-4 py-3">
                                <FolderGit2 size={16} className="text-cyan-300" />
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Commits</p>
                                    <p className="text-sm text-white">{totalCommits}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex -space-x-2">
                            {cleanMembers.slice(0, 5).map((member) => (
                                <img
                                    key={member.id}
                                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`}
                                    title={member.name}
                                    className="h-9 w-9 rounded-full border-2 border-[#081122] object-cover"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <FileExplorer projectId={id} />
                </div>

                <div className="space-y-4 lg:col-span-8">
                    <div className="tech-panel flex flex-wrap gap-3 p-3">
                        {["commits", "mr"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`tech-button ${tab === t ? "tech-button-active" : ""}`}
                            >
                                {t === "commits" ? "Commits" : "Merge Requests"}
                            </button>
                        ))}
                    </div>

                    <div className="tech-panel p-4">
                        <AnimatePresence mode="wait">
                            {tab === "commits" && (
                                <motion.div
                                    key="commits"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Commits projectId={id} />
                                </motion.div>
                            )}

                            {tab === "mr" && (
                                <motion.div
                                    key="mr"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MergeRequests projectId={id} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
