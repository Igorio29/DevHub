import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Commits from "../components/Commits"
import MergeRequests from "../components/MergeRequests"
import FileExplorer from "../components/FileExplorer"
import { motion, AnimatePresence } from "framer-motion"


export default function ProjectDetails() {
    const { id } = useParams()
    const [tab, setTab] = useState("commits")
    const token = localStorage.getItem("token")
    const [project, setProject] = useState(null)
    const [members, setMembers] = useState([])
    const [totalCommits, setTotalCommits] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const projectRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            })
            const projectData = await projectRes.json()
            console.log(projectData)

            const membersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/members`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            })
            if (!membersRes.ok) {
                console.error("Erro ao buscar membros")
                return
            }


            const membersData = await membersRes.json()
            const commitsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/commits`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            })
            const commitsData = await commitsRes.json()

            setProject(projectData)
            setMembers(membersData)
            setTotalCommits(commitsData.length)
        }

        fetchData()
    }, [id])

    if (!project) return <p>Carregando...</p>

    const cleanMembers = Array.isArray(members)
        ? members.filter(m =>
            m.state === "active" &&
            m.access_level >= 10 &&
            !m.bot &&
            m.name !== "Ghost User"
        )
        : []

    const owner = cleanMembers.find(m => m.access_level === 50)

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }} className="p-6 text-white space-y-6">

            {/* HEADER COMPLETO */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-4"
            >

                {/* FOTO DO PROJETO */}
                <img
                    src={project.avatar_url || "/default-project.png"}
                    alt="avatar"
                    className="w-32 h-32 rounded-lg object-cover"
                />

                <div className="flex-1">

                    {/* NOME + DESCRIÇÃO */}
                    <h1 className="text-xl font-semibold">
                        {project.name}
                    </h1>

                    <p className="text-white/60 text-sm mt-1">
                        {project.description || "Sem descrição"}
                    </p>

                    {/* INFO GRID */}
                    <div className="flex flex-wrap gap-6 mt-4 text-sm text-white/70">

                        {/* OWNER */}
                        <div>
                            <span className="text-white/50">Owner:</span>{" "}
                            {owner?.name || "N/A"}
                        </div>

                        {/* PARTICIPANTES */}
                        <div className="flex items-center gap-2">
                            <span className="text-white/50">Participantes:</span>

                            <div className="flex -space-x-2">
                                {cleanMembers.slice(0, 3).map(member => (
                                    <img
                                        key={member.id}
                                        src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`}
                                        title={member.name}
                                        className="w-7 h-7 rounded-full border border-gray-800 hover:scale-110 transition"
                                    />
                                ))}
                            </div>

                            <span className="text-white/50">
                                +{members.length}
                            </span>
                        </div>

                        {/* TOTAL DE COMMITS */}
                        <div>
                            <span className="text-white/50">Commits:</span>{" "}
                            {totalCommits}
                        </div>

                    </div>
                </div>
            </motion.div>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4" >
                    <FileExplorer projectId={id} />
                </div>
                <div className="col-span-8 space-y-4">
                    {/* TABS */}
                    <div className="flex gap-4 border-b border-white/10 pb-2">
                        {["commits", "mr"].map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`pb-2 text-sm transition ${tab === t
                                    ? "text-blue-400 border-b-2 border-blue-400"
                                    : "text-white/60 hover:text-white"
                                    }`}
                            >
                                {t === "commits" && "Commits"}
                                {t === "mr" && "Merge Requests"}
                            </button>
                        ))}
                        {/* CONTEÚDO */}
                    </div>
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

        </motion.div>
    )
}