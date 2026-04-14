import { Outlet } from "react-router-dom";
import Sidebar from "../../components/SideBar";
import Navbar from "../../components/NavBar";
import { ToastContainer } from "react-toastify";
import { useState } from "react";


export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <div className="flex min-h-screen bg-[#0b1727]">

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 h-screen p-4 z-[3] flex flex-col gap-4">
                {/* Adicione um z-index maior aqui para garantir que o dropdown flutue sobre o main */}
                <Navbar setSidebarOpen={setSidebarOpen} />
                <main className="relative z-10 flex-1 bg-[#172332] border border-white/10 rounded-2xl text-white p-6 overflow-auto">
                    <div className="">
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