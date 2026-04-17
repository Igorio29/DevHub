import { GitPullRequestArrow, Workflow } from "lucide-react";

export default function MergeRequest() {
    return (
        <div className="page-shell space-y-6">
            <section className="page-header">
                <span className="page-kicker">Merge Flow</span>
                <h1 className="page-title">Merge Requests</h1>
                <p className="page-subtitle">
                    A camada visual desta área já foi alinhada ao restante do sistema e está pronta para receber uma listagem dedicada.
                </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                <article className="tech-panel p-6">
                    <div className="mb-4 inline-flex rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                        <GitPullRequestArrow size={18} />
                    </div>
                    <h2 className="text-xl font-semibold">Estrutura pronta</h2>
                    <p className="mt-3 text-sm text-white/60">
                        A área agora segue a mesma linguagem visual do DevHub: painéis técnicos, contraste elevado e leitura mais limpa.
                    </p>
                </article>

                <article className="tech-panel p-6">
                    <div className="mb-4 inline-flex rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                        <Workflow size={18} />
                    </div>
                    <h2 className="text-xl font-semibold">Próximo passo</h2>
                    <p className="mt-3 text-sm text-white/60">
                        Se você quiser, eu posso transformar esta rota numa tela completa com filtros, status, autores e ações de merge.
                    </p>
                </article>
            </section>
        </div>
    );
}
