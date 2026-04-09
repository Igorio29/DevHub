import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpa o token ou dados de sessão se necessário
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#050a14] text-white font-sans">
      {/* Navbar Superior */}
      <nav className="bg-[#0f1c2e] border-b border-white/5 p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          DevHub Admin
        </h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition text-sm font-medium"
        >
          Sair
        </button>
      </nav>

      {/* Conteúdo Principal */}
      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold">Bem-vindo de volta!</h2>
          <p className="text-gray-400">Aqui está o resumo do seu projeto hoje.</p>
        </header>

        {/* Cards de Estatística */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0f1c2e] p-6 rounded-2xl border border-white/5 shadow-xl">
            <p className="text-gray-400 text-sm">Usuários Ativos</p>
            <h3 className="text-2xl font-bold mt-1">1,284</h3>
            <span className="text-green-500 text-xs">+12% desde ontem</span>
          </div>
          
          <div className="bg-[#0f1c2e] p-6 rounded-2xl border border-white/5 shadow-xl">
            <p className="text-gray-400 text-sm">Requisições API</p>
            <h3 className="text-2xl font-bold mt-1">45.2k</h3>
            <span className="text-blue-500 text-xs">Estável</span>
          </div>

          <div className="bg-[#0f1c2e] p-6 rounded-2xl border border-white/5 shadow-xl">
            <p className="text-gray-400 text-sm">Tempo de Resposta</p>
            <h3 className="text-2xl font-bold mt-1">120ms</h3>
            <span className="text-green-500 text-xs">Excelente</span>
          </div>
        </div>

        {/* Placeholder para Conteúdo */}
        <div className="bg-[#0f1c2e] h-64 rounded-2xl border border-white/5 flex items-center justify-center border-dashed border-2">
          <p className="text-gray-500">Gráficos e tabelas aparecerão aqui...</p>
        </div>
      </main>
    </div>
  );
}