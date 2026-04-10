import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    FolderGit2,
    GitCommit,
    GitPullRequest,
    Server,
    ChevronLeft,
    ChevronRight
} from "lucide-react"

import LogoDevHub, { LogoSimples } from "./LogoDevHub"

export default function Sidebar() {
    const { pathname } = useLocation()
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar")
        return saved === "true"
    })

    useEffect(() => {
        localStorage.setItem("sidebar", collapsed)
    }, [collapsed])

    const menu = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Projetos", path: "/projects", icon: FolderGit2 },
        { name: "Commits", path: "/commits", icon: GitCommit },
        { name: "Merge Requests", path: "/merge-requests", icon: GitPullRequest },
        { name: "Ambientes", path: "/environments", icon: Server },
    ]

    return (
        <aside className={`
      relative
      h-[calc(100vh-2rem)]
      m-4
      p-4
      flex flex-col
      transition-all duration-300

      ${collapsed ? "w-20" : "w-64"}

      bg-white/5 backdrop-blur-xl
      border border-white/10
      rounded-2xl
      shadow-[0_0_30px_rgba(59,130,246,0.08)]
    `}>

            {/* BOTÃO RETRÁTIL */}
            <div className="flex justify-left mb-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="
  p-2 rounded-lg
  bg-gradient-to-br from-blue-500/10 to-cyan-400/10
  hover:shadow-[0_0_10px_rgba(59,130,246,0.4)]
  transition
"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-zinc-300"
                    >
                        {/* barra lateral */}
                        <rect x="1" y="4" width="5" height="16" rx="2" />

                        {collapsed ? (
                            <polyline points="10 7 15 12 10 17" />
                        ) : (
                            <polyline points="14 7 9 12 14 17" />
                        )}
                    </svg>
                </button>
            </div>


            <div className={`mb-8 flex ${collapsed ? "justify-center" : "ml-3 justify-start"}`}>
                {collapsed ? (
                    <LogoSimples className="scale-110" />
                ) : (
                    <LogoDevHub className="scale-110" collapsed={collapsed} />
                )}
            </div>

            {/* MENU */}
            <nav className="flex flex-col gap-2">
                {menu.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-3 px-3 py-2 rounded-xl
                transition-all duration-300 group

                ${collapsed ? "justify-center" : ""}

                ${isActive
                                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-400/20 text-white shadow-lg shadow-blue-500/10 border border-blue-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }
              `}
                        >
                            <Icon
                                size={18}
                                className={`
                  transition-all
                  ${isActive
                                        ? "text-blue-400 drop-shadow-[0_0_6px_#3b82f6]"
                                        : "group-hover:text-white"
                                    }
                `}
                            />

                            {!collapsed && (
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* FOOTER */}
            {
                !collapsed && (
                    <div className="mt-auto pt-6 border-t border-white/10 text-xs text-zinc-500 text-center">
                        By: FarTech
                    </div>
                )
            }
        </aside >
    )
}