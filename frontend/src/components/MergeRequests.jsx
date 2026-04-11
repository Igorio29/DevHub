import { useEffect, useState } from "react"
import { data } from "react-router-dom"

export default function MergeRequests({ projectId }) {
    const [mrs, setMrs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const token = localStorage.getItem("token")

    useEffect(() => {
        setLoading(true)
        setError(null)

        fetch(`http://localhost:8000/api/projects/${projectId}/merge-requests`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || "Erro na API") })
                }
                return res.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setMrs(data)
                } else {
                    console.error("Dado inválido da API:", data)
                    setMrs([])
                }
            })
            .catch(err => {
                console.error(err)
                setError(err.message)
            })
            .finally(() => setLoading(false))
    }, [projectId, token])

    if (loading) return <div className="text-white/50 text-sm">Carregando Merge Requests...</div>

    if (error) return (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
            Erro: {error}
        </div>
    )

    if (mrs.length === 0) return <div className="text-white/50 text-sm">Nenhum Merge Request encontrado.</div>

    console.log(mrs)

    return (

        mrs.map(mr => {
            const hasConflict = mr.has_conflicts && mr.state === "opened"

            return (
                <div
                    key={mr.id}
                    className={`p-3 rounded-lg border transition mb-3
        ${hasConflict
                            ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                >
                    <div className="flex justify-between items-center">
                        <p className="font-medium">{mr.title}</p>

                        {hasConflict && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                ⚠ Conflito
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-white/50 mt-1">
                        Status: <span className="capitalize">{mr.state}</span> • Criado por: {mr.author?.name}
                    </p>
                </div>
            )
        })
    )
}
