import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula  } from "react-syntax-highlighter/dist/esm/styles/prism"

export default function FileViewer() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const token = localStorage.getItem("token")
    
    const path = searchParams.get("path")

    const [content, setContent] = useState("")

    useEffect(() => {
        async function fetchFile() {
            const res = await fetch(
                `http://localhost:8000/api/projects/${id}/file?path=${path}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
            )

            const text = await res.text()
            setContent(text)
        }

        fetchFile()
    }, [id, path])

    return (
        <div className="p-6 text-white space-y-4">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">{path}</h1>
            </div>

            {/* CODE */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                    <SyntaxHighlighter
                        language="php"
                        style={dracula}
                        showLineNumbers
                        wrapLongLines
                        customStyle={{
                            background: "transparent",
                            padding: "0",
                            margin: 0
                        }}
                        codeTagProps={{
                            style: {
                                background: "transparent",
                                lineHeight: "1.6"
                            }
                        }}
                    >
                        {content}
                    </SyntaxHighlighter>
                </pre>
            </div>
        </div>
    )
}