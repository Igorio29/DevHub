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

                            <a
                                href={`${import.meta.env.VITE_API_URL}/api/auth/gitlab/redirect`}
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
                            <a
                                className="w-full flex items-center justify-center gap-3 mt-3 py-3 rounded-lg 
  bg-[#0f1c2e] border border-gray-600
  text-gray-400 font-semibold shadow-lg
  cursor-not-allowed opacity-70"
                            >
                                <img
                                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                                    alt="GitHub"
                                    className="w-5 h-5"
                                />

                                <span>Entrar com GitHub</span>

                                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                    Em breve
                                </span>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </>

    );
}

export default Login;