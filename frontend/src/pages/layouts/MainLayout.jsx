import { Outlet } from "react-router-dom";
import Sidebar from "../../components/SideBar";
import Navbar from "../../components/NavBar";
import { ToastContainer } from "react-toastify";
import { useState } from "react";


export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <div className="flex min-h-screen overflow-hidden bg-[#0b1727]">

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="z-[3] flex h-screen min-w-0 flex-1 flex-col gap-4 p-4">
                {/* Adicione um z-index maior aqui para garantir que o dropdown flutue sobre o main */}
                <Navbar setSidebarOpen={setSidebarOpen} />
                <main className="relative z-10 min-w-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#172332] p-6 text-white">
                    <div className="min-w-0">
                        <ToastContainer
                            position="top-center"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>

    )
};
