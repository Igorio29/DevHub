import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"



export default function Commits({ projectId }) {

    const [open, setOpen] = useState(false)
    const [commits, setCommits] = useState([])
    const token = localStorage.getItem("token")
    const [branch, setBranch] = useState("main")
    const [branches, setBranches] = useState([])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits?branch=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then(res => res.json())
            .then(setCommits)
    }, [projectId, branch])

    useEffect(() => {
        // 🔥 COMMITS
        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/commits?branch=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then(res => res.json())
            .then(setCommits)
            .catch(console.error)

        // 🔥 BRANCHES
        fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/branches`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then(res => res.json())
            .then(setBranches)

    }, [projectId, token])


    return (
        <div className="space-y-3">
            <div className="relative w-fit">

                {/* BOTÃO */}
                <motion.button
                    onClick={() => setOpen(!open)}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 transition"
                >
                    🌿 {branch}
                </motion.button>

                {/* DROPDOWN */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute mt-2 w-40 bg-[#0b1727] border border-white/10 rounded-lg shadow-lg z-50"
                        >
                            {branches.map(b => (
                                <div
                                    key={b.name}
                                    onClick={() => {
                                        setBranch(b.name)
                                        setOpen(false)
                                    }}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-white/10 transition flex items-center justify-between"
                                >
                                    {b.name}

                                    {branch === b.name && (
                                        <span className="text-blue-400">●</span>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
            <AnimatePresence mode="popLayout">
                {commits.map(commit => (
                    <motion.div
                        key={commit.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/5 border border-white/10 p-3 rounded-lg"
                    >
                        <p className="text-sm">{commit.message}</p>
                        <p className="text-xs text-white/50">
                            {commit.author_name} • {new Date(commit.committed_date).toLocaleDateString()}
                        </p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}