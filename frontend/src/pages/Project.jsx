import { useEffect, useState } from "react"
import { getProjects } from "../services/projectServices"
import { useNavigate } from "react-router-dom"

export default function Project() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(() => {
        return localStorage.getItem("projectFilter") || "owned"
    })

    useEffect(() => {
        localStorage.setItem("projectFilter", filter)
    }, [filter])


    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true)

        getProjects(token, filter)
            .then(data => {
                setProjects(data) // 🔥 substitui tudo
            })
            .catch(console.error)
            .finally(() => setLoading(false))

    }, [filter])

    if (loading) {
        return (
            <div className="p-6 text-gray-500 animate-pulse">
                Carregando projetos...
            </div>
        )
    }

    if (!Array.isArray(projects)) {
        return (
            <div className="p-6 text-red-500">
                Erro ao carregar projetos
            </div>
        )
    }
    return (
        <div className="p-6 space-y-6 text-white">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold">
                    Projetos
                </h1>
                <p className="text-white/60">
                    Seus projetos no GitLab
                </p>
            </div>
            <div className="flex gap-2">
                {["owned", "membership"].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
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

            {/* CARD RESUMO */}
            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 flex justify-between items-center">
                <span className="text-white/70">Total de projetos</span>
                <span className="text-xl font-bold text-blue-400">
                    {projects.length}
                </span>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {projects.map(project => (
                    <div onClick={() => navigate(`/project/${project.id}`)}
                        key={project.id}
                        className="cursor-pointer bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 space-y-3 hover:bg-white/10 transition"
                    >

                        {/* HEADER */}
                        <div className="flex items-center gap-3">
                            {project.avatar_url ? (
                                <img
                                    src={project.avatar_url}
                                    className="w-12 h-12 rounded"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center rounded font-bold">
                                    {project.name?.charAt(0)}
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold">
                                    {project.name}
                                </h3>
                                <p className="text-xs text-white/50">
                                    {project.visibility}
                                </p>
                            </div>
                        </div>

                        {/* DESCRIÇÃO */}
                        <p className="text-sm text-white/70">
                            {project.description || "Sem descrição"}
                        </p>

                        {/* FOOTER */}
                        <div className="flex justify-between text-xs text-white/50">
                            <span>Última atividade</span>
                            <span>
                                {new Date(project.last_activity_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* BOTÃO */}

                    </div>
                ))}

            </div>
        </div>
    )
}