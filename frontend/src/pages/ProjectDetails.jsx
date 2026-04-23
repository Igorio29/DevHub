import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    FolderGit2,
    GitCommit,
    MessageSquareText,
    Shield,
    Star,
    Users
} from "lucide-react";
import Commits from "../components/Commits";
import MergeRequests from "../components/MergeRequests";
import FileExplorer from "../components/FileExplorer";

const TAB_ITEMS = [
    { key: "summary", label: "Resumo" },
    { key: "files", label: "Arquivos" },
    { key: "commits", label: "Commits" },
    { key: "merge-requests", label: "Merge Requests" },
    { key: "ranking", label: "Ranking" },
    { key: "comments", label: "Comentários" }
];

function SummaryTab({ members, owner, totalCommits }) {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.7fr)]">
            <section className="tech-panel p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="page-kicker">Project Summary</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">Visão geral</h2>
                    </div>
                    <span className="tech-badge">Ativo</span>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <article className="tech-panel-muted p-4">
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-cyan-300" />
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Owner</p>
                                <p className="mt-1 text-sm text-white">{owner?.name || "N/A"}</p>
                            </div>
                        </div>
                    </article>

                    <article className="tech-panel-muted p-4">
                        <div className="flex items-center gap-3">
                            <Users size={16} className="text-cyan-300" />
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Participantes</p>
                                <p className="mt-1 text-sm text-white">{members.length}</p>
                            </div>
                        </div>
                    </article>

                    <article className="tech-panel-muted p-4">
                        <div className="flex items-center gap-3">
                            <GitCommit size={16} className="text-cyan-300" />
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Commits</p>
                                <p className="mt-1 text-sm text-white">{totalCommits}</p>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <section className="tech-panel p-5 sm:p-6">
                <p className="page-kicker">Team Access</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-white">Equipe visível</h2>
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">
                        {members.length} membros
                    </span>
                </div>

                {members.length > 0 ? (
                    <div className="mt-5 space-y-3">
                        {members.slice(0, 6).map((member) => (
                            <div key={member.id} className="tech-panel-muted flex items-center gap-3 p-3">
                                <img
                                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`}
                                    alt={member.name}
                                    className="h-11 w-11 rounded-full border border-white/10 object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">{member.name}</p>
                                    <p className="truncate text-xs text-white/45">
                                        {member.username ? `@${member.username}` : "Membro do projeto"}
                                    </p>
                                </div>
                                <span className="ml-auto text-xs uppercase tracking-[0.18em] text-white/35">
                                    {member.access_level}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="tech-panel-muted mt-5 p-4 text-sm text-white/55">
                        Nenhum participante elegível encontrado.
                    </div>
                )}
            </section>
        </div>
    );
}

function PlaceholderTab({ title, description, icon: Icon }) {
    return (
        <section className="tech-panel p-6 sm:p-8">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <span className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-4 text-cyan-300">
                    <Icon size={24} />
                </span>
                <p className="page-kicker mt-5">Coming Next</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm text-white/55">{description}</p>
            </div>
        </section>
    );
}

export default function ProjectDetails() {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const token = localStorage.getItem("token");
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [totalCommits, setTotalCommits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const activeTab = useMemo(() => {
        const requestedTab = searchParams.get("tab");
        const isValidTab = TAB_ITEMS.some((item) => item.key === requestedTab);
        return isValidTab ? requestedTab : "summary";
    }, [searchParams]);

    useEffect(() => {
        if (searchParams.get("tab") !== activeTab) {
            setSearchParams({ tab: activeTab }, { replace: true });
        }
    }, [activeTab, searchParams, setSearchParams]);

    useEffect(() => {
        let ignore = false;

        async function fetchData() {
            setLoading(true);
            setError(null);

            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            };

            try {
                const [projectRes, membersRes, commitsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/members`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/commits`, { headers })
                ]);

                if (!projectRes.ok) {
                    throw new Error("Erro ao carregar os dados do projeto.");
                }

                const projectData = await projectRes.json();
                const membersData = membersRes.ok ? await membersRes.json() : [];
                const commitsData = commitsRes.ok ? await commitsRes.json() : [];

                if (ignore) {
                    return;
                }

                setProject(projectData);
                setMembers(Array.isArray(membersData) ? membersData : []);
                setTotalCommits(Array.isArray(commitsData) ? commitsData.length : 0);
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError.message || "Erro ao carregar o projeto.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            ignore = true;
        };
    }, [id, token]);

    const cleanMembers = useMemo(() => {
        if (!Array.isArray(members)) {
            return [];
        }

        return members.filter((member) =>
            member.state === "active" &&
            member.access_level >= 10 &&
            !member.bot &&
            member.name !== "Ghost User"
        );
    }, [members]);

    const owner = cleanMembers.find((member) => member.access_level === 50);

    const tabContent = {
        summary: <SummaryTab members={cleanMembers} owner={owner} totalCommits={totalCommits} />,
        files: <FileExplorer projectId={id} />,
        commits: <Commits projectId={id} />,
        "merge-requests": <MergeRequests projectId={id} />,
        ranking: (
            <PlaceholderTab
                title="Ranking dos developers"
                description="Esta aba vai consolidar os destaques da equipe, atividade e critérios de desempenho do projeto."
                icon={Star}
            />
        ),
        comments: (
            <PlaceholderTab
                title="Comentários dos developers"
                description="Esta área vai reunir feedbacks, observações e colaboração contextual da equipe dentro do projeto."
                icon={MessageSquareText}
            />
        )
    };

    if (loading) {
        return <p className="page-shell animate-pulse text-gray-500">Carregando projeto...</p>;
    }

    if (error) {
        return (
            <div className="page-shell">
                <div className="tech-panel p-6 text-sm text-red-300">{error}</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="page-shell">
                <div className="tech-panel p-6 text-sm text-white/55">Projeto não encontrado.</div>
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="page-shell space-y-5"
        >
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="page-header overflow-hidden"
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-cyan-400/10">
                        {project.avatar_url ? (
                            <img
                                src={project.avatar_url}
                                alt={`${project.name} avatar`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FolderGit2 size={32} className="text-cyan-300" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <span className="page-kicker">Project Node</span>
                                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{project.name}</h1>
                                <p className="mt-3 max-w-3xl text-sm text-white/60">
                                    {project.description || "Sem descrição"}
                                </p>
                            </div>

                            <span className="tech-badge w-fit">
                                {TAB_ITEMS.find((item) => item.key === activeTab)?.label}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.section>

            <nav className="project-tabs-nav">
                <div className="project-tabs-scroll">
                    {TAB_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setSearchParams({ tab: item.key })}
                            className={`project-tab ${activeTab === item.key ? "project-tab-active" : ""}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            <section className="min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {tabContent[activeTab]}
                    </motion.div>
                </AnimatePresence>
            </section>
        </motion.div>
    );
}
