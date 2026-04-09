import { useState } from "react"
import ParticlesBackground from "./components/ParticlesBackground"
import LogoDevHub from "./components/LogoDevHub"

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()
      console.log(data)

      if (!response.ok) {
        alert(data.message || "Erro no login")
        return
      }

      // 🔥 salva token (ESSENCIAL)
      localStorage.setItem("token", data.token)

      alert("Login feito com sucesso 😎")
      
    } catch (error) {
      console.error(error)
      alert("Erro ao conectar com o servidor")
    }
  }

  return (
    <div className="relative h-screen">
      <ParticlesBackground />

      <div className="relative z-10 flex items-center justify-center h-screen">
        <div className="bg-[#0f1c2e]/80 backdrop-blur-md p-9 rounded-2xl w-[350px] shadow-2xl border border-white/5">

          <h1 className="flex justify-center mb-8">
            <LogoDevHub className="scale-125" />
          </h1>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 bg-[#0b1727] text-white rounded-lg outline-none 
              border border-white/5 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
              transition
              placeholder:text-gray-500
              hover:border-white/10"
              placeholder="seuemail@email.com"
            />
          </div>

          <div className="mt-3">
            <label className="text-gray-300 text-sm">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 bg-[#0b1727] text-white rounded-lg outline-none 
              border border-white/5 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
              transition
              placeholder:text-gray-500
              hover:border-white/10"
              placeholder="Insira sua senha"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg 
            shadow-lg hover:shadow-blue-500/5 hover:shadow-xl 
            hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Entrar
          </button>

        </div>
      </div>
    </div>
  )
}

export default App