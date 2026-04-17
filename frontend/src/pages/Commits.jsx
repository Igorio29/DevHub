import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, ChevronDown, GitCommit, Layers3, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Commits() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [filter, setFilter] = useState(() => {
        return localStorage.getItem("projectFilter") || "owned";
    });
    const [selectedProject, setSelectedProject] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("main");
    const [commits, setCommits] = useState([]);
    const [loadingCommits, setLoadingCommits] = useState(false);

    const navigate = useNavigate();

    const openProject = async (project) => {
        setSelectedProject(project);
        setModalOpen(true);

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/projects/${project.project_id}/branches`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            const branchList = res.data;
            setBranches(branchList);

            const defaultBranch =
                branchList.find((b) => b.name === "main")?.name ||
                branchList.find((b) => b.name === "master")?.name ||
                branchList[0]?.name;

            setSelectedBranch(defaultBranch);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setLoading(true);

        axios
            .get(`${import.meta.env.VITE_API_URL}/api/last-commits?type=${filter}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            })
            .then((res) => setProjects(res.data))
            .finally(() => setLoading(false));
    }, [filter, token]);

    useEffect(() => {
        if (!selectedProject || !selectedBranch) return;

        setLoadingCommits(true);
        axios
            .get(
                `${import.meta.env.VITE_API_URL}/api/projects/${selectedProject.project_id}/commits?branch=${selectedBranch}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            .then((res) => setCommits(res.data))
            .finally(() => setLoadingCommits(false));
    }, [selectedBranch, selectedProject, token]);

    return (
        <div className="page-shell space-y-6">
            <section className="page-header">
                <span className="page-kicker">Commits Feed</span>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="page-title">Últimos commits por projeto</h1>
                        <p className="page-subtitle mt-2">
                            Painel com destaque para mudanças recentes, autoria e acesso rápido ao histórico completo por branch.
                        </p>
                    </div>

                    <div className="tech-panel-muted flex items-center gap-3 px-4 py-3">
                        <Layers3 size={18} className="text-cyan-300" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Visible Streams</p>
                            <p className="text-lg font-semibold">{projects.length}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex flex-wrap gap-3">
                {["owned", "membership"].map((type) => (
                    <button
                        key={type}
                        onClick={() => {
                            setFilter(type);
                            localStorage.setItem("projectFilter", type);
                        }}
                        className={`tech-button ${filter === type ? "tech-button-active" : ""}`}
                    >
                        {type === "owned" ? "Meus projetos" : "Participando"}
                    </button>
                ))}
            </section>

            {loading && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="tech-panel h-44 animate-pulse p-4" />
                    ))}
                </div>
            )}

            {!loading && (
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => (
                        <article
                            key={project.project_id}
                            onClick={() => openProject(project)}
                            className="tech-panel group relative flex h-52 cursor-pointer flex-col justify-between overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
                        >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent opacity-60" />

                            <div>
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <h2 className="line-clamp-2 text-lg font-semibold text-white">
                                        {project.project_name}
                                    </h2>
                                    <span className="tech-badge">Recent</span>
                                </div>

                                {project.last_commit ? (
                                    <>
                                        <p className="mb-3 flex items-start gap-2 text-sm leading-6 text-white/80">
                                            <GitCommit size={16} className="mt-1 shrink-0 text-cyan-300" />
                                            <span className="line-clamp-2">{project.last_commit.message}</span>
                                        </p>

                                        <div className="space-y-2 text-xs text-white/50">
                                            <p className="flex items-center gap-2">
                                                <User size={14} className="text-cyan-300" />
                                                {project.last_commit.author_name}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Calendar size={14} className="text-cyan-300" />
                                                {new Date(project.last_commit.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-red-400">
                                        Sem commits ainda.
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-white/10 pt-4 text-xs uppercase tracking-[0.22em] text-white/35">
                                Abrir histórico completo
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {modalOpen && (
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#01040d]/70 px-4 backdrop-blur-sm"
                >
                    <div className="tech-panel w-full max-w-3xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <p className="page-kicker">Branch Explorer</p>
                                <h2 className="mt-2 text-lg font-semibold">{selectedProject?.project_name}</h2>
                            </div>

                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="border-b border-white/10 px-6 py-5">
                            <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/45">
                                Branch ativa
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full appearance-none rounded-2xl border border-white/10 bg-[#07101f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                >
                                    {branches.map((branch) => (
                                        <option key={branch.name} value={branch.name}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45" />
                            </div>
                        </div>

                        <div className="max-h-[420px] space-y-3 overflow-y-auto px-6 py-5">
                            {loadingCommits && (
                                <p className="text-white/50">Carregando commits...</p>
                            )}

                            {!loadingCommits &&
                                commits.map((commit) => (
                                    <div
                                        onClick={() => navigate(`/projects/${selectedProject.project_id}/commits/${commit.id}`)}
                                        key={commit.id}
                                        className="tech-panel-muted cursor-pointer p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.06]"
                                    >
                                        <p className="text-sm font-medium text-white">
                                            {commit.message}
                                        </p>

                                        <div className="mt-2 text-xs text-white/50">
                                            {commit.author_name} · {new Date(commit.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
