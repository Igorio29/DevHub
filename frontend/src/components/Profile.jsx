import { useEffect, useState } from "react";
import { ImagePlus, Save, UserRound } from "lucide-react";
import { useUser } from "../context/UserContext";
import api from "../services/api";
import { showError, showSuccess } from "../utils/toast";

export default function Profile() {
    const { user, fetchUser, loading: userLoading } = useUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        avatar: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                avatar: user.avatar || ""
            });
        }
    }, [user]);

    if (userLoading || !user) {
        return <div className="page-shell text-white">Carregando...</div>;
    }

    function handleChange(e) {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put("/user", formData);
            await fetchUser();
            showSuccess("Alterado com sucesso");
        } catch (err) {
            showError("Erro ao atualizar");
        }

        setLoading(false);
    }

    return (
        <div className="page-shell mx-auto max-w-3xl space-y-6">
            <section className="page-header">
                <span className="page-kicker">Identity Settings</span>
                <h1 className="page-title">Meu perfil</h1>
                <p className="page-subtitle">
                    Atualize os dados da sua identidade visual dentro do DevHub.
                </p>
            </section>

            <form onSubmit={handleSubmit} className="tech-panel space-y-6 p-6">
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="tech-panel-muted flex flex-col items-center gap-4 p-5">
                        <div className="group relative">
                            {formData.avatar ? (
                                <img
                                    src={formData.avatar}
                                    alt="avatar"
                                    className="h-28 w-28 rounded-3xl border border-white/10 object-cover transition group-hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
                                    <UserRound size={28} />
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-medium text-white">{formData.name || "Usuário"}</p>
                            <p className="text-xs text-white/45">Preview do perfil</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
                                URL do avatar
                            </label>
                            <div className="relative">
                                <ImagePlus size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
                                <input
                                    type="text"
                                    name="avatar"
                                    placeholder="https://..."
                                    value={formData.avatar || ""}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-[#07101f] py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:border-cyan-400/35 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">
                                Nome
                            </label>
                            <div className="relative">
                                <UserRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-[#07101f] py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:border-cyan-400/35 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-white/10 pt-5">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save size={16} />
                        {loading ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </form>
        </div>
    );
}
