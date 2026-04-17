import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import Sidebar from "../../components/SideBar";
import Navbar from "../../components/NavBar";

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen overflow-hidden bg-transparent">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="z-[3] flex h-screen min-w-0 flex-1 flex-col gap-4 p-4">
                <Navbar setSidebarOpen={setSidebarOpen} />

                <main className="tech-panel relative min-w-0 flex-1 overflow-auto px-1 py-1">
                    <div className="min-w-0 rounded-[22px] border border-white/5 bg-[linear-gradient(180deg,rgba(6,11,23,0.42),rgba(10,18,35,0.18))]">
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
    );
}
