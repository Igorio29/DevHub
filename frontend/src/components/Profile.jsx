import { useEffect, useState } from "react"
import { useUser } from "../context/UserContext"
import api from "../services/api"
import { showError, showSuccess } from "../utils/toast"

export default function Profile() {

    const { user, setUser, fetchUser, loading: userLoading } = useUser()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        avatar: ""
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                avatar: user.avatar || ""
            })
        }
    }, [user])

    if (userLoading || !user) {
        return <div className="text-white p-6">Carregando...</div>
    }

    function handleChange(e) {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            console.log(formData)

            await api.put("/user", formData)

            await fetchUser()

            showSuccess( "Alterado com sucesso");

            } catch (err) {
            showError("Erro ao atualizar")
        }

        setLoading(false)
    }
    return (
        <div className="p-6 max-w-xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">Meu Perfil</h1>
                <p className="text-sm text-zinc-400">
                    Atualize suas informações pessoais
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="
      space-y-6
      bg-zinc-900/80 backdrop-blur
      p-6 rounded-2xl
      border border-zinc-800
      shadow-xl
    "
            >

                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">

                    <div className="relative group">
                        <img
                            src={formData.avatar}
                            alt="avatar"
                            className="
            w-24 h-24 rounded-full object-cover
            border-2 border-zinc-700
            transition
            group-hover:scale-105
          "
                        />

                        {/* Glow sutil */}
                        <div className="
          absolute inset-0 rounded-full
          bg-blue-500/10 opacity-0
          group-hover:opacity-100
          transition
        " />
                    </div>

                    <input
                        type="text"
                        name="avatar"
                        placeholder="URL do avatar"
                        value={formData.avatar || ""}
                        onChange={handleChange}
                        className="
          w-full px-3 py-2 rounded-lg
          bg-zinc-800 text-white
          border border-zinc-700
          placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition
        "
                    />
                </div>

                {/* Nome */}
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                        Nome
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        className="
          w-full px-3 py-2 rounded-lg
          bg-zinc-800 text-white
          border border-zinc-700
          placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition
        "
                    />
                </div>

                {/* Divider */}
                <div className="h-px bg-zinc-800" />

                {/* Botão */}
                <button
                    type="submit"
                    disabled={loading}
                    className="
        w-full py-2.5 rounded-lg
        bg-blue-600 hover:bg-blue-700
        text-white font-medium
        transition
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
                >
                    {loading ? "Salvando..." : "Salvar alterações"}
                </button>

            </form>
        </div>
    )
}