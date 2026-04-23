import { useEffect, useState } from "react";
import { FolderGit2, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../services/projectServices";

export default function Project() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(() => {
        return localStorage.getItem("projectFilter") || "owned";
    });

    useEffect(() => {
        localStorage.setItem("projectFilter", filter);
    }, [filter]);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);

        getProjects(token, filter)
            .then((data) => {
                setProjects(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter, token]);

    if (loading) {
        return (
            <div className="page-shell">
                <div className="tech-panel p-6 text-white/50 animate-pulse">
                    Carregando projetos...
                </div>
            </div>
        );
    }

    if (!Array.isArray(projects)) {
        return (
            <div className="page-shell">
                <div className="tech-panel p-6 text-red-400">
                    Erro ao carregar projetos.
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell space-y-6">
            <section className="page-header">
                <span className="page-kicker">Projects Matrix</span>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="page-title">Projetos conectados ao ecossistema do DevHub</h1>
                    </div>

                    <div className="tech-panel-muted flex items-center gap-3 px-4 py-3">
                        <Sparkles size={18} className="text-cyan-300" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Projects Loaded</p>
                            <p className="text-lg font-semibold">{projects.length}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex flex-wrap gap-3">
                {["owned", "membership"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`tech-button ${filter === type ? "tech-button-active" : ""}`}
                    >
                        {type === "owned" ? "Meus projetos" : "Participando"}
                    </button>
                ))}
            </section>

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                    <article
                        onClick={() => navigate(`/project/${project.id}`)}
                        key={project.id}
                        className="tech-panel group cursor-pointer p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                {project.avatar_url ? (
                                    <img
                                        src={project.avatar_url}
                                        className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
                                        {project.name?.charAt(0)}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold text-white">{project.name}</h3>
                                    <p className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                                        <Lock size={12} />
                                        {project.visibility}
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                                GitLab
                            </span>
                        </div>

                        <p className="min-h-16 text-sm leading-6 text-white/65">
                            {project.description || "Sem descrição cadastrada para este projeto."}
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/45">
                            <span className="inline-flex items-center gap-2">
                                <FolderGit2 size={14} className="text-cyan-300" />
                                Última atividade
                            </span>
                            <span className="font-mono text-white/75">
                                {new Date(project.last_activity_at).toLocaleDateString()}
                            </span>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}
