import { Outlet } from "react-router-dom";
import Sidebar from "../../components/SideBar";
import Navbar from "../../components/NavBar";


export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-[#0a0f1c]">
            <Sidebar />

            <div className="flex-1 p-4 flex flex-col gap-4">
                <Navbar />
                <main className="flex-1 bg-zinc-900 text-white p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
};