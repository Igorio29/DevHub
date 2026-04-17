import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FolderGit2,
    GitCommit,
    GitPullRequest,
    Server
} from "lucide-react";

import LogoDevHub, { LogoSimples } from "./LogoDevHub";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("sidebar", collapsed);
    }, [collapsed]);

    const menu = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Projetos", path: "/projects", icon: FolderGit2 },
        { name: "Commits", path: "/commits", icon: GitCommit },
        { name: "Merge Requests", path: "/merge-requests", icon: GitPullRequest },
        { name: "Ambientes", path: "/environments", icon: Server }
    ];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#01040d]/65 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 z-50 m-0 flex h-[calc(100vh-2rem)] flex-col p-4 transition-all duration-300 ease-in-out
                    md:relative md:m-4
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    ${collapsed ? "w-24" : "w-72"}
                    tech-panel
                `}
            >
                <header className="border-b border-white/10 pb-4">
                    <div className={`relative flex h-11 items-center ${collapsed ? "justify-center" : ""}`}>
                        <div
                            className={`
                                absolute transition-all duration-300
                                ${collapsed ? "translate-x-2 scale-90 opacity-0" : "translate-x-0 scale-100 opacity-100"}
                            `}
                        >
                            <LogoDevHub />
                        </div>

                        <div
                            className={`
                                absolute transition-all duration-300
                                ${collapsed ? "left-1/2 -translate-x-1/2 scale-100 opacity-100" : "-translate-x-2 scale-90 opacity-0"}
                            `}
                        >
                            <LogoSimples />
                        </div>
                    </div>
                </header>


                <nav className="mt-6 flex flex-1 flex-col gap-2">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    group flex items-center rounded-2xl px-3 py-3 transition-all duration-300
                                    ${collapsed ? "justify-center" : "gap-3"}
                                    ${isActive
                                        ? "border border-cyan-400/20 bg-cyan-400/10 text-white shadow-[0_12px_30px_rgba(34,211,238,0.12)]"
                                        : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"}
                                `}
                            >
                                <Icon
                                    size={20}
                                    className={`${isActive ? "text-cyan-300" : "text-zinc-500 transition group-hover:text-white"}`}
                                />

                                <span
                                    className={`
                                        whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out
                                        ${collapsed
                                            ? "max-w-0 -translate-x-2 overflow-hidden opacity-0"
                                            : "max-w-[200px] translate-x-0 opacity-100"}
                                    `}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={`mb-6 flex ${collapsed ? "justify-center" : "justify-end"}`}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="
                            absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2
                            items-center justify-center rounded-full border border-white/10
                            bg-[#0c1527] text-zinc-300 shadow-[0_10px_30px_rgba(2,6,23,0.35)]
                            transition hover:scale-105 hover:bg-white/[0.08] md:flex
                        "
                    >
                        {collapsed ? ">" : "<"}
                    </button>
                </div>

                {!collapsed && (
                    <div className="mt-auto border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
                        © Z-Tech - Direitos Reservados

                    </div>
                )}
            </aside>
        </>
    );
}
