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
      flex
      h-[calc(100vh-2rem)]
      m-4
      p-4
      flex flex-col
      transition-all duration-300 ease-in-out

      ${collapsed ? "w-20" : "w-64"}

      bg-white/5 backdrop-blur-xl
      border border-white/10
      rounded-2xl
      shadow-[0_0_30px_rgba(59,130,246,0.08)]
    `}>
            <header className="  border-b border-white/10">
                <div className="relative mb-4  flex items-center justify-left h-10">

                    {/* LOGO GRANDE */}
                    <div
                        className={`
      absolute transition-all duration-300
      ${collapsed
                                ? "opacity-0 scale-90 translate-x-2"
                                : "opacity-100 scale-100 translate-x-0"}
    `}
                    >
                        <LogoDevHub />
                    </div>

                    {/* LOGO PEQUENA */}
                    <div
                        className={`
      absolute transition-all duration-300
      ${collapsed
                                ? "opacity-100 scale-100 translate-x-0"
                                : "opacity-0 scale-90 -translate-x-2"}
    `}
                    >
                        <LogoSimples />
                    </div>

                </div>

            </header>


            {/* MENU */}
            <nav className="flex mt-4 flex-col gap-2">
                {menu.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center px-3 py-2 rounded-xl
                transition-all duration-300 group

                ${collapsed ? "" : "gap-3"}

                ${isActive
                                    ? " bg-blue-600/20 text-white shadow-lg border border-blue-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }
              `}
                        >
                            <Icon
                                size={20}
                                className={`
                  transition-all
                  ${isActive
                                        ? "text-blue-400 drop-shadow-[0_0_6px_#3b82f6]"
                                        : "group-hover:text-white"
                                    }
                `}
                            />

                            <span
                                className={`
                                    text-sm font-medium whitespace-nowrap
                                    transition-all duration-300 ease-in-out
                                    ${collapsed
                                        ? "opacity-0 -translate-x-2 max-w-0 overflow-hidden"
                                        : "opacity-100 translate-x-0 max-w-[200px]"}
                                `}
                            >
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </nav>
            {/* BOTÃO RETRÁTIL */}
                <div className={`flex  
            ${collapsed ?
                        "justify-center" : "justify-end"} mb-10`}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`
  absolute -right-3 top-[48%]
        flex items-center justify-center
        w-8 h-8
        rounded-full

        bg-white/10 backdrop-blur-md
        border border-white/10

        hover:bg-white/20
        hover:scale-110

        transition-all duration-300
        shadow-md
  ${collapsed ? "justify-center" : ""}
`}
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

            {/* FOOTER */}
            {
                !collapsed && (
                    <div className="mt-auto pt-6 border-t border-white/10 text-xs text-zinc-500 text-center">
                        © Direitos Reservados Z-Tech 
                    </div>
                )
            }
        </aside >
    )
}