import { useEffect, useState } from "react";
import axios from "axios";
import { GitCommit, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function Commits() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token")
    const [filter, setFilter] = useState(() => {
        return localStorage.getItem("projectFilter") || "owned"
    })
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
                `${import.meta.env.VITE_API_URL}/api/projects/${project.project_id}/branches`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
            );

            const branchList = res.data;
            setBranches(branchList);

            // 👇 lógica esperta
            const defaultBranch =
                branchList.find(b => b.name === "main")?.name ||
                branchList.find(b => b.name === "master")?.name ||
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
            .then(res => setProjects(res.data))
            .finally(() => setLoading(false));
    }, [filter]);

    useEffect(() => {
        if (!selectedProject || !selectedBranch) return;

        setLoadingCommits(true);
        console.log(selectedProject.project_id)
        axios
            .get(
                `${import.meta.env.VITE_API_URL}/api/projects/${selectedProject.project_id}/commits?branch=${selectedBranch}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
            )
            .then((res) => setCommits(res.data))
            .finally(() => setLoadingCommits(false));
    }, [selectedBranch, selectedProject]);

    console.log(projects)

    return (
        <div className="p-6 text-white">

            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Últimos Commits</h1>
                <p className="text-white/60 text-sm">
                    Veja o commit mais recente de cada projeto
                </p>
            </div>

            <div className="flex gap-2">
                {["owned", "membership"].map(type => (
                    <button
                        key={type}
                        onClick={() => {
                            setFilter(type);
                            localStorage.setItem("projectFilter", type);
                        }}
                        className={` px-4 py-2 rounded-lg text-sm transition 
        ${filter === type
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        {type === "owned" && "Meus projetos"}
                        {type === "membership" && "Participando"}
                    </button>
                ))}
            </div>


            {/* LOADING */}
            {loading && (
                <div className="grid md:grid-cols-2 mt-4 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl" />
                    ))}
                </div>
            )}

            {/* LISTA */}
            {!loading && (
                <div className="grid md:grid-cols-2 mt-4 lg:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <div
                            key={project.project_id}
                            onClick={() => openProject(project)}
                            className=" h-44 flex flex-col justify-between
    bg-gradient-to-br from-white/5 to-white/10
    backdrop-blur-md
    border border-white/10
    hover:border-blue-500/40
    hover:shadow-lg hover:shadow-blue-500/10
    transition-all duration-300
    rounded-2xl p-4
    relative overflow-hidden
    cursor-pointer"
                        >

                            {/* NOME */}
                            <h2 className="text-lg font-medium mb-2">
                                {project.project_name}
                            </h2>

                            {/* COMMIT */}
                            {project.last_commit ? (
                                <>
                                    <p className="flex  text-sm text-white/80 mb-2 line-clamp-2">
                                        <GitCommit size={16} />
                                        {project.last_commit.message}
                                    </p>

                                    <div className="text-xs text-white/50">
                                        <p className="flex"><User size={18} /> {project.last_commit.author_name}</p>
                                        <p className="flex"><Calendar size={18} /> {new Date(project.last_commit.created_at).toLocaleString()}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-red-400">
                                    Sem commits ainda
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/60 mt-10 backdrop-blur-sm flex items-center justify-center z-50">

                    <div className="w-[700px] max-h-[80vh] overflow-hidden bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl">

                        {/* HEADER */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">
                                {selectedProject.project_name}
                            </h2>

                            <button onClick={() => setModalOpen(false)}>
                                ✖
                            </button>
                        </div>

                        {/* SELECT BRANCH */}
                        <div className="p-4 border-b border-white/10">
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="
                                    bg-[#020617]
                                    cursor-pointer
                                    border border-white/10
                                    rounded-lg
                                    px-3 py-2
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    transition
                                    w-full
                                    hover:bg-[#0f172a]
                                "
                            >
                                {branches.map((branch) => (
                                    <option key={branch.name} value={branch.name}>
                                        🌿 {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* COMMITS */}
                        <div className="p-4 overflow-y-auto max-h-[400px] space-y-3">

                            {loadingCommits && (
                                <p className="text-white/50">Carregando commits...</p>
                            )}

                            {!loadingCommits &&
                                commits.map((commit) => (
                                    <div
                                        onClick={() => navigate(`/projects/${selectedProject.project_id}/commits/${commit.id}`)}
                                        key={commit.id}
                                        className="bg-white/5 p-3 hover:bg-[#0f172a] cursor-pointer rounded-lg border border-white/10"
                                    >
                                        <p className="text-sm font-medium">
                                            {commit.message}
                                        </p>

                                        <div className="text-xs text-white/50 mt-1">
                                            👤 {commit.author_name} •{" "}
                                            {new Date(commit.created_at).toLocaleString()}
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