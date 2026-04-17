import { Link, useLocation } from "react-router-dom";
import { Menu, PanelTop, UserCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function Navbar({ className, setSidebarOpen }) {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const menuRef = useRef();
    const { user } = useUser();

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTitle = () => {
        switch (pathname) {
            case "/dashboard": return "Dashboard";
            case "/projects": return "Projetos";
            case "/commits": return "Commits";
            case "/merge-requests": return "Merge Requests";
            case "/environments": return "Ambientes";
            default: return "DevHub";
        }
    };

    return (
        <header
            className={`tech-panel relative z-50 flex h-16 items-center justify-between px-3 sm:h-20 sm:px-5 ${className || ""}`}
        >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/15 md:hidden"
                >
                    <Menu size={18} />
                </button>

                <div className="min-w-0">
                    <p className="page-kicker hidden sm:block">System View</p>
                    <h1 className="truncate text-base font-semibold tracking-[0.02em] text-white sm:text-xl">
                        {getTitle()}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-2 transition hover:bg-white/[0.08] sm:gap-3 sm:px-3"
                    >
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                className="h-10 w-10 rounded-2xl border border-white/10 object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
                                <UserCircle2 size={20} />
                            </div>
                        )}

                        <div className="hidden text-left sm:block">
                            <p className="max-w-40 truncate text-sm font-medium text-white">
                                {user?.name || "Usuário"}
                            </p>
                        </div>
                    </button>

                    {open && (
                        <div className="tech-panel absolute right-0 mt-3 w-40 p-2 z-[99999] sm:w-48">
                            <Link
                                to="/profile"
                                className="block rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Perfil
                            </Link>

                            <button
                                onClick={() => {
                                    localStorage.removeItem("user");
                                    localStorage.removeItem("token");
                                    window.location.href = "/";
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
