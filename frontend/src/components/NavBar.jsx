import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function Navbar({ className }) {
    const { pathname } = useLocation()
    const navigate = useNavigate();
    const [open, setOpen] = useState(false)
    const menuRef = useRef()
    const { user, setUser, fetchUser} = useUser()
    

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const getTitle = () => {
        switch (pathname) {
            case "/dashboard": return "Dashboard"
            case "/projects": return "Projetos"
            case "/commits": return "Commits"
            case "/merge-requests": return "Merge Requests"
            case "/environments": return "Ambientes"
            default: return "DevHub"
        }
    }

    const handleLogout = () => {
        // Limpa o token ou dados de sessão se necessário
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <header className={`
      h-16
      flex items-center justify-between
      px-6

      bg-white/5 backdrop-blur-xl
      border border-white/10
      rounded-2xl

      shadow-[0_0_20px_rgba(59,130,246,0.08)]
      relative
      ${className}
    `}>

            {/* TÍTULO */}
            <h1 className="text-white text-lg font-semibold tracking-wide">
                {getTitle()}
            </h1>

            {/* AÇÕES */}
            <div className="flex items-center gap-3">

                <div className="flex items-center gap-4">

                    {/* STATUS */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Online
                    </div>

                    {/* AVATAR */}
                    <div className="relative " ref={menuRef}>

                        <div
                            onClick={() => setOpen(!open)}
                            className={`cursor-pointer ${open? "bg-[#0a0f1c]" : "bg-[#0b1727]"} py-2 px-3 rounded-full flex items-center gap-2`}
                        >
                            <h1 className="text-white">{user?.name}</h1>
                            {user?.avatar ? (
                                <img
                                    src={user?.avatar}
                                    className="w-9 h-9 rounded-full border border-white/10 object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {user?.name?.[0]}
                                </div>
                            )}
                        </div>

                        {/* MENU */}
                        {open && (
                            <div className="
      absolute right-0 mt-2 w-44
      bg-[#0a0f1c]/90 backdrop-blur-xl
      border border-white/10
      rounded-xl
      shadow-[0_0_20px_rgba(59,130,246,0.15)]
      p-2
      z-[99999]
    ">

                                {/* PROFILE */}
                                <Link
                                    to="/profile"
                                    className="
       w-full text-left px-3 py-2 rounded-lg
    text-sm text-zinc-300
    hover:bg-white/5 hover:text-white w-full text-left px-3 py-2 rounded-lg
    text-sm text-zinc-300
    hover:bg-white/5 hover:text-white
    transition
    block
    transition
      ">
                                    Profile
                                </Link>

                                {/* LOGOUT */}
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("user")
                                        localStorage.removeItem("token")
                                        window.location.href = "/"
                                    }}
                                    className="
          w-full text-left px-3 py-2 rounded-lg
          text-sm text-red-400
          hover:bg-red-500/10
          transition
        "
                                >
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>

                </div>

            </div>
        </header>
    )
}