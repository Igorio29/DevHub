import { useState } from "react"
import { useParams } from "react-router-dom"
import Commits from "../components/Commits"
import MergeRequests from "../components/MergeRequests"


export default function ProjectDetails() {
    const { id } = useParams()
    const [ tab, setTab ] = useState("commits")

    return (
        <div className="p-6 text-white space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold">Projeto</h1>
                <p className="text-white/60">Detalhes do projeto</p>
            </div>

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
            </div>

            {/* CONTEÚDO */}
            <div>
                {tab === "commits" && <Commits projectId={id} />}
                {tab === "mr" && <MergeRequests projectId={id} />}
            </div>

        </div>
    )
};