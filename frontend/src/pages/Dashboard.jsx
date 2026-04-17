import { Activity, Cpu, GitBranchPlus, ShieldCheck } from "lucide-react";
import { useUser } from "../context/UserContext";

const systemCards = [
  {
    icon: Cpu,
    title: "Core DevOps",
    value: "Ativo",
    description: "Fluxo central pronto para projetos, commits e merge requests."
  },
  {
    icon: GitBranchPlus,
    title: "Integração Git",
    value: "Dual Remote",
    description: "Operação unificada para GitHub e GitLab dentro da mesma interface."
  },
  {
    icon: Activity,
    title: "Rastreamento",
    value: "Live",
    description: "Histórico de commits e diffs acessíveis com leitura rápida."
  },
  {
    icon: ShieldCheck,
    title: "Sessão",
    value: "Segura",
    description: "Contexto autenticado e navegação persistida para o workspace."
  }
];

const pillars = [
  "Painéis translúcidos com hierarquia mais clara para leitura operacional.",
  "Grid técnico no fundo para reforçar linguagem de produto de engenharia.",
  "Contraste mais forte nos estados ativos, hovers e superfícies críticas."
];

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="page-shell space-y-6">
      <section className="page-header">
        <span className="page-kicker">Command Center</span>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h1 className="page-title">
              Infra de código com presença mais técnica e leitura mais rápida.
            </h1>
            <p className="page-subtitle">
              {user?.name ? `${user.name}, ` : ""}
              o DevHub agora parte de uma base visual mais orientada a operação:
              superfícies densas, brilho controlado, tipografia mais firme e foco em navegação de engenharia.
            </p>
          </div>

          <div className="tech-panel-muted flex min-w-[260px] flex-col gap-2 p-4">
            <span className="page-kicker">Workspace</span>
            <span className="text-2xl font-bold text-white">DevHub Control Layer</span>
            <span className="text-sm text-white/60">
              Central para projetos, histórico de mudanças e revisão contextual.
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {systemCards.map(({ icon: Icon, title, value, description }) => (
          <article key={title} className="tech-panel p-5">
            <div className="mb-6 flex items-start justify-between">
              <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                <Icon size={18} />
              </span>
              <span className="tech-badge">Online</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-white/45">{title}</p>
              <h2 className="text-2xl font-bold">{value}</h2>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="tech-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="page-kicker">Visual Direction</span>
              <h2 className="mt-2 text-xl font-semibold">Nova linguagem do produto</h2>
            </div>
            <span className="tech-badge">UI Refresh</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((item) => (
              <div key={item} className="tech-panel-muted min-h-32 p-4 text-sm text-white/70">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="tech-panel p-6">
          <span className="page-kicker">Status</span>
          <h2 className="mt-2 text-xl font-semibold">Leitura operacional</h2>
          <div className="mt-6 space-y-4">
            <div className="tech-panel-muted flex items-center justify-between p-4">
              <span className="text-sm text-white/60">Navegação lateral</span>
              <span className="font-mono text-sm text-cyan-300">Stabilized</span>
            </div>
            <div className="tech-panel-muted flex items-center justify-between p-4">
              <span className="text-sm text-white/60">Estrutura principal</span>
              <span className="font-mono text-sm text-cyan-300">Responsive</span>
            </div>
            <div className="tech-panel-muted flex items-center justify-between p-4">
              <span className="text-sm text-white/60">Superfícies e cards</span>
              <span className="font-mono text-sm text-cyan-300">Unified</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
