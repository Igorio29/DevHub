🚀 DevHub

Centralizador inteligente de projetos GitLab — acompanhe tudo em um só lugar, sem dor de cabeça.

📌 Sobre o Projeto

O DevHub é uma aplicação web desenvolvida para reunir, organizar e exibir informações de projetos hospedados no GitLab.

A ideia é simples: parar de ficar pulando entre mil telas e ter uma visão clara do que tá acontecendo nos seus projetos.

🎯 Objetivo

Fornecer um dashboard centralizado com:

Projetos
Commits
Merge Requests
Conflitos
Ambientes de deploy

Tudo isso em uma interface limpa, rápida e funcional.

🧠 Motivação

Quem trabalha com GitLab sabe:

muita informação espalhada
difícil acompanhar tudo
pouca visão geral

O DevHub resolve isso trazendo clareza e controle.

🏗️ Arquitetura

O sistema segue uma arquitetura simples e eficiente:

Frontend (React)
        ↓
Backend (Laravel API)
        ↓
GitLab API
⚙️ Tecnologias
🔹 Frontend
React
Tailwind CSS
Axios / Fetch API
🔹 Backend
Laravel
HTTP Client
🔹 Integração
GitLab REST API (v4)
🔐 Autenticação

O sistema utiliza Personal Access Token do GitLab.

⚠️ Importante:

O token fica apenas no backend
Nunca é exposto no frontend
📦 Funcionalidades
📁 Projetos
Listagem de projetos
Filtro por participação / owner
🧾 Commits
Histórico por projeto
Filtro por autor e data
🔀 Merge Requests
Listagem completa
Status:
Open
Closed
Merged
⚠️ Conflitos
Identificação automática
Destaque visual no dashboard
🌐 Ambientes (Deploy)
Cadastro de ambientes
Acesso rápido via URL
Tipos:
Development
Homologation
Production
📊 Dashboard

O coração do sistema.

Exibe:

Total de projetos
Commits recentes
Merge Requests abertas
Conflitos detectados
Ambientes disponíveis
🚀 Roadmap (MVP)
 Estrutura inicial
 Layout base
 Integração com GitLab
 Listagem de projetos
 Commits
 Merge Requests
 Conflitos
 Ambientes
🔮 Futuro do Projeto
Gráficos analíticos
Ranking de produtividade
Monitoramento de deploy
Integração com pipelines
Assistente inteligente
🧪 Testes

O sistema deve validar:

Respostas da API
Filtros funcionando
Renderização correta
Identificação de conflitos
CRUD de ambientes
⚡ Performance
Cache de requisições
Paginação de dados
Redução de chamadas externas
🛡️ Segurança
Token protegido no backend
Validação de dados
Possível rate limiting
💻 Como rodar o projeto
Backend (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
Frontend (React)
cd frontend
npm install
npm run dev
📌 Status do Projeto

🚧 Em desenvolvimento — evoluindo para um dashboard completo de produtividade

🤝 Contribuição

Se quiser contribuir:

Fork o projeto
Crie uma branch
Faça suas alterações
Abra um PR
📄 Licença

Este projeto está sob a licença MIT.

💬 Considerações finais

O DevHub não é só um painel bonito.

É sobre:

organização
produtividade
controle

E principalmente: parar de perder tempo navegando e começar a enxergar o que realmente importa.
