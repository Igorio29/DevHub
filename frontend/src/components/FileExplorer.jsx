import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function FileExplorer({ projectId }) {
    const [files, setFiles] = useState([])
    const [path, setPath] = useState("")
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const [activeFile, setActiveFile] = useState(null)


    async function fetchFiles(currentPath = "") {
        const res = await fetch(
            `http://localhost:8000/api/projects/${projectId}/files?path=${currentPath}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        }
        )
        const data = await res.json()
        setFiles(data)
    }


    useEffect(() => {
        fetchFiles()
    }, [])

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="gap-4 mt-6">

            {/* FILE LIST */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h2 className="text-sm text-white/60 mb-3">Arquivos</h2>

                {path && (
                    <button
                        onClick={() => {
                            const newPath = path.split("/").slice(0, -1).join("/")
                            setPath(newPath)
                            fetchFiles(newPath)
                        }}
                        className="text-xs text-blue-400 mb-2"
                    >
                        ← Voltar
                    </button>
                )}

                <ul className="space-y-2 text-sm">
                    {files.map(file => (
                        <motion.li
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"

                            key={file.id}
                            onClick={() => {
                                if (file.type === "tree") {
                                    setPath(file.path)
                                    fetchFiles(file.path)
                                } else {
                                    if (file.type === "blob") {
                                        setActiveFile(file.path)
                                        navigate(`/project/${projectId}/file?path=${file.path}`)
                                    }
                                }
                            }}
                        >
                            {file.type === "tree" ? "📁" : "📄"} {file.name}
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    )
}