import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import LogoDevHub from "../components/LogoDevHub";
import { login } from "../services/Auth";
import { toast } from "react-toastify";
import { showError, showSuccess } from "../utils/toast";
import { Helmet } from "react-helmet";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Debug: Monitora mudanças no loading
    useEffect(() => {
        console.log("Estado 'loading' mudou para:", loading);
    }, [loading]);

    const handleLogin = async (e) => {
        // 1. Evita o refresh se for um form
        if (e) e.preventDefault();

        console.log("1. Iniciando no componente... (loading original:", loading, ")");

        // 2. Ativa o loading
        setLoading(true);
        console.log("2. Loading set to true");

        try {
            // 3. O SEGREDO: Força um delay (500ms) 
            // Isso dá tempo ao React para renderizar e ao usuário para ver o estado "Entrando..."
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log("3. Chamando o serviço de Auth...");
            const response = await login(email, password);

            console.log("4. Sucesso! Navegando...");

            navigate("/dashboard", {
                state: { success: "Login realizado com sucesso 🔥" }
            });

        } catch (error) {
            console.error("Erro capturado no componente:", error.message);
            console.log("Disparando toast.error...");
            // Só desativamos o loading aqui se der erro
            showError("Credenciais Invalidas");
            setLoading(false);
        }
    };

    return (
        <>
            <>
                <Helmet>
                    <title>Login - DevHub</title>
                </Helmet>
            </>
        // overflow-hidden evita scroll causado pelas partículas
            <div className="relative h-screen w-full bg-[#050a14] overflow-hidden">

                {/* CAMADA 0: Partículas 
        pointer-events-none é CRUCIAL para que o clique passe pelas partículas e chegue no botão
      */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <ParticlesBackground />
                </div>

                {/* CAMADA 1: Formulário (Centralizado) */}
                <div className="relative z-10 flex items-center justify-center h-full">
                    <form
                        onSubmit={handleLogin}
                        className="bg-[#0f1c2e]/80 backdrop-blur-md p-9 rounded-2xl w-[350px] shadow-2xl border border-white/5 mx-4"
                    >
                        <div className="flex justify-center mb-8">
                            <LogoDevHub className="scale-125" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-300 text-sm block mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-[#0b1727] text-white rounded-lg outline-none 
                border border-white/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                transition placeholder:text-gray-500"
                                    placeholder="seuemail@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-gray-300 text-sm block mb-1">Senha</label>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 bg-[#0b1727] text-white rounded-lg outline-none 
                border border-white/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                transition placeholder:text-gray-500"
                                    placeholder="Insira sua senha"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-4 py-3 rounded-lg text-white font-bold transition-all
                ${loading
                                        ? "bg-blue-800 opacity-70 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Entrando...
                                    </span>
                                ) : "Entrar"}
                            </button>
                            <a
                                href="http://localhost:8000/api/auth/gitlab/redirect"
                                className="w-full flex items-center justify-center gap-3 mt-4 py-3 rounded-lg 
  bg-[#0f1c2e] hover:bg-[#e85c1c] transition-all 
  border border-[#e85c1c]
  text-white font-semibold shadow-lg
  cursor-pointer"
                            >
                                <img
                                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg"
                                    alt="GitLab"
                                    className="w-5 h-5"
                                />

                                Entrar com GitLab
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </>

    );
}

export default Login;