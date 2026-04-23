import { AlertTriangle, Bot, FolderGit2, GitCommit, GitPullRequestArrow, LineChart, MessageSquareText, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useUser } from "../context/UserContext";

function formatDateTime(value) {
  if (!value) {
    return "Sem data";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Sem data";
  }
}

function severityStyles(severity) {
  if (severity === "high") {
    return "border-red-500/20 bg-red-500/10 text-red-200";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

export default function Dashboard() {
  const { user } = useUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/dashboard");

        if (active) {
          setDashboard(response.data);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.response?.data?.error || "Erro ao carregar dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  const overviewCards = useMemo(() => {
    const overview = dashboard?.overview || {};
    const health = dashboard?.health || {};

    return [
      {
        icon: FolderGit2,
        title: "Projetos monitorados",
        value: overview.projects_monitored ?? 0,
        description: "Repositorios visiveis no workspace do GitLab.",
      },
      {
        icon: GitCommit,
        title: "Commits recentes",
        value: overview.recent_commits ?? 0,
        description: "Projetos com atividade recente na janela atual.",
      },
      {
        icon: GitPullRequestArrow,
        title: "MRs abertas",
        value: overview.opened_merge_requests ?? 0,
        description: "Merge requests abertas nos projetos observados.",
      },
      {
        icon: ShieldCheck,
        title: "Score medio",
        value: health.average_score ?? "-",
        description: "Media dos commits revisados por IA nos ultimos dias.",
      },
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div className="page-shell space-y-6">
        <section className="page-header">
          <span className="page-kicker">Command Center</span>
          <div className="space-y-3">
            <div className="h-10 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <article key={index} className="tech-panel h-40 animate-pulse p-5" />
          ))}
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="tech-panel p-6 text-sm text-red-300">{error}</div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const health = dashboard?.health || {};
  const topProjects = dashboard?.top_projects || [];
  const ownedOpenMerges = dashboard?.owned_open_merges || [];
  const recentActivity = dashboard?.recent_activity || [];
  const reviewInsights = dashboard?.review_insights || {};
  const attentionItems = dashboard?.attention_items || [];

  return (
    <div className="page-shell space-y-6">
      <section className="page-header">
        <span className="page-kicker">Command Center</span>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h1 className="page-title">
              {user?.name ? `${user.name}, ` : ""}
              leitura executiva do workspace com foco em saude, atividade e risco.
            </h1>
            <p className="page-subtitle">
              Janela atual de {dashboard?.window_days ?? 7} dias, combinando GitLab ao vivo com reviews e comentarios persistidos no DevHub.
            </p>
          </div>

          <div className="tech-panel-muted flex min-w-[260px] flex-col gap-2 p-4">
            <span className="page-kicker">Gerado em</span>
            <span className="text-2xl font-bold text-white">{formatDateTime(dashboard?.generated_at)}</span>
            <span className="text-sm text-white/60">
              {overview.reviews_generated ?? 0} reviews geradas na janela atual.
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map(({ icon: Icon, title, value, description }) => (
          <article key={title} className="tech-panel p-5">
            <div className="mb-6 flex items-start justify-between">
              <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                <Icon size={18} />
              </span>
              <span className="tech-badge">Live</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-white/45">{title}</p>
              <h2 className="text-3xl font-bold">{value}</h2>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-red-500/20 bg-[linear-gradient(135deg,rgba(127,29,29,0.38),rgba(69,10,10,0.78))] p-5 shadow-[0_18px_70px_rgba(69,10,10,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-red-100">
              <AlertTriangle size={12} />
              Owner queue
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Merges abertos que sao problema seu resolver
            </h2>
            <p className="mt-3 text-sm text-red-100/75">
              Esta fila mostra apenas merge requests abertas em projetos onde voce e owner. Se voce e so dev, isso nao entra aqui.
            </p>
          </div>

          <div className="rounded-2xl border border-red-400/15 bg-black/20 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-red-100/60">Abertas agora</p>
            <p className="mt-1 text-3xl font-bold text-white">{ownedOpenMerges.length}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {ownedOpenMerges.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-red-50/75">
              Nenhuma merge request aberta em projetos sob sua responsabilidade direta.
            </div>
          )}

          {ownedOpenMerges.map((merge, index) => (
            <Link
              key={`${merge.project_id}-${index}`}
              to={merge.route}
              className={`block rounded-2xl border p-4 transition hover:brightness-110 ${
                merge.has_conflicts
                  ? "border-red-300/25 bg-red-500/15"
                  : "border-amber-300/20 bg-amber-500/10"
              }`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">{merge.project_name}</p>
                  <h3 className="mt-2 text-base font-semibold text-white">{merge.title}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Autor: {merge.author_name} • Atualizada em {formatDateTime(merge.updated_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {merge.has_conflicts && (
                    <span className="rounded-full border border-red-300/20 bg-red-500/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-red-100">
                      Com conflito
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">
                    Abrir fila
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <article className="tech-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="page-kicker">Health</span>
              <h2 className="mt-2 text-xl font-semibold">Saude do workspace</h2>
            </div>
            <span className="tech-badge">Hybrid</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="tech-panel-muted p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">Commits com score baixo</p>
              <p className="mt-2 text-3xl font-bold text-white">{health.low_score_commits ?? 0}</p>
              <p className="mt-2 text-sm text-white/60">Commits avaliados com score menor ou igual a 5.</p>
            </div>

            <div className="tech-panel-muted p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">Comentarios manuais</p>
              <p className="mt-2 text-3xl font-bold text-white">{health.manual_comments ?? 0}</p>
              <p className="mt-2 text-sm text-white/60">Intervencoes humanas registradas na janela atual.</p>
            </div>

            <div className="tech-panel-muted p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">Comentarios da IA</p>
              <p className="mt-2 text-3xl font-bold text-white">{health.ai_comments ?? 0}</p>
              <p className="mt-2 text-sm text-white/60">Sugestoes automaticas persistidas pelo fluxo de review.</p>
            </div>

            <div className="tech-panel-muted p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">Modelo mais usado</p>
              <p className="mt-2 text-xl font-bold text-white">{reviewInsights.top_model || "Sem dados"}</p>
              <p className="mt-2 text-sm text-white/60">
                {reviewInsights.reviewed_commits ?? 0} commits revisados na janela atual.
              </p>
            </div>
          </div>
        </article>

        <article className="tech-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="page-kicker">Insights</span>
              <h2 className="mt-2 text-xl font-semibold">Qualidade e cobertura</h2>
            </div>
            <span className="tech-badge">Review</span>
          </div>

          <div className="space-y-4">
            <div className="tech-panel-muted flex items-center justify-between p-4">
              <span className="text-sm text-white/60">Reviews geradas</span>
              <span className="font-mono text-sm text-cyan-300">{overview.reviews_generated ?? 0}</span>
            </div>
            <div className="tech-panel-muted flex items-center justify-between p-4">
              <span className="text-sm text-white/60">Score medio</span>
              <span className="font-mono text-sm text-cyan-300">{reviewInsights.average_score ?? "-"}</span>
            </div>
            <div className="tech-panel-muted flex items-center justify-between p-4">
              <span className="text-sm text-white/60">Menor score</span>
              <span className="font-mono text-sm text-cyan-300">{reviewInsights.lowest_score ?? "-"}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
        <article className="tech-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="page-kicker">Projects</span>
              <h2 className="mt-2 text-xl font-semibold">Projetos mais ativos</h2>
            </div>
            <span className="tech-badge">Top 5</span>
          </div>

          <div className="space-y-3">
            {topProjects.length === 0 && (
              <div className="tech-panel-muted p-4 text-sm text-white/60">
                Nenhum projeto com atividade recente.
              </div>
            )}

            {topProjects.map((project) => (
              <Link
                key={project.project_id}
                to={project.route}
                className="tech-panel-muted block p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{project.project_name}</p>
                    <p className="mt-2 truncate text-xs text-white/45">
                      {project.recent_commit_author || project.owner_name || "Sem owner"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">
                      {project.recent_commits_count > 0
                        ? `${project.recent_commits_count} commits na janela atual.`
                        : (project.recent_commit_message || "Sem commits recentes")}
                    </p>
                  </div>
                  <span className="tech-badge">{project.recent_commits_count} commits</span>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="tech-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="page-kicker">Activity</span>
              <h2 className="mt-2 text-xl font-semibold">Atividade recente</h2>
            </div>
            <span className="tech-badge">Live + DB</span>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <div className="tech-panel-muted p-4 text-sm text-white/60">
                Nenhuma atividade recente encontrada.
              </div>
            )}

            {recentActivity.map((item, index) => (
              <Link
                key={`${item.type}-${index}`}
                to={item.route}
                className="tech-panel-muted block p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2 text-cyan-300">
                    {item.type === "review" ? <Bot size={15} /> : <GitCommit size={15} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">{item.subtitle}</p>
                    <p className="mt-2 text-xs text-white/45">
                      {item.meta} • {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="tech-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="page-kicker">Attention</span>
              <h2 className="mt-2 text-xl font-semibold">Itens de atencao</h2>
            </div>
            <span className="tech-badge">Risk</span>
          </div>

          <div className="space-y-3">
            {attentionItems.length === 0 && (
              <div className="tech-panel-muted p-4 text-sm text-white/60">
                Nenhum risco relevante detectado agora.
              </div>
            )}

            {attentionItems.map((item, index) => (
              <Link
                key={`${item.type}-${index}`}
                to={item.route}
                className={`block rounded-2xl border p-4 transition hover:brightness-110 ${severityStyles(item.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm opacity-90">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="tech-panel p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
              <LineChart size={18} />
            </span>
            <div>
              <p className="page-kicker">Coverage</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Visao consolidada</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60">
            O dashboard combina atividade do GitLab com revisoes persistidas no DevHub para priorizar onde agir.
          </p>
        </article>

        <article className="tech-panel p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
              <Bot size={18} />
            </span>
            <div>
              <p className="page-kicker">AI Layer</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Review como sinal</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Scores, resumos e comentarios da IA entram como indicadores de qualidade, nao apenas como historico de commit.
          </p>
        </article>

        <article className="tech-panel p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
              <MessageSquareText size={18} />
            </span>
            <div>
              <p className="page-kicker">Collaboration</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Colaboracao registrada</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Comentarios manuais e automatizados ajudam a medir cobertura de revisao e profundidade da colaboracao tecnica.
          </p>
        </article>
      </section>
    </div>
  );
}
