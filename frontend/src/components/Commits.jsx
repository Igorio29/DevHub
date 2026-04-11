import { useEffect, useState } from "react"



export default function Commits({ projectId }) {
    const [commits, setCommits] = useState([])
    const token = localStorage.getItem("token")
    const [branch, setBranch] = useState("main")
    const [branches, setBranches] = useState([])

    useEffect(() => {
    fetch(`http://localhost:8000/api/projects/${projectId}/commits?branch=${branch}`, {
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
        fetch(`http://localhost:8000/api/projects/${projectId}/commits?branch=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
            .then(res => res.json())
            .then(setCommits)
            .catch(console.error)

        // 🔥 BRANCHES
        fetch(`http://localhost:8000/api/projects/${projectId}/branches`, {
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
            <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-white/10 border border-white/20 p-2 rounded"
            >
                {branches.map(b => (
                    <option
                    className="bg-[#0b1727]"
                    key={b.name} value={b.name}>
                        {b.name}
                    </option>
                ))}
            </select>
            {commits.map(commit => (
                <div
                    key={commit.id}
                    className="bg-white/5 border border-white/10 p-3 rounded-lg"
                >
                    <p className="text-sm">{commit.message}</p>
                    <p className="text-xs text-white/50">
                        {commit.author_name} • {new Date(commit.committed_date).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    )
}