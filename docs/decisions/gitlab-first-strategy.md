# Decisao Arquitetural: GitLab First, GitHub Depois

- Status: Aceito
- Data: 2026-04-22

## Contexto

O DevHub hoje esta fortemente acoplado ao GitLab em pontos centrais do produto:

- autenticacao OAuth
- modelo de usuario
- controllers de projetos, commits, arquivos e merge requests
- regras de permissao
- fluxo de review com IA

Adicionar suporte completo a GitHub agora ampliaria o escopo para autenticacao, arquitetura multi-provider, compatibilidade de dados e ajustes de UX antes de o fluxo principal do produto estar concluido.

## Decisao

O projeto vai seguir uma estrategia `GitLab first`:

- concluir primeiro o produto inteiro com GitLab
- evitar novos acoplamentos desnecessarios ao GitLab quando isso nao atrasar a entrega
- planejar a integracao GitHub apenas depois de o produto GitLab estar funcionalmente completo

## Consequencias

- a prioridade do roadmap fica em fechar features, UX e estabilidade do fluxo GitLab
- a integracao GitHub deixa de ser prioridade imediata e passa a ser uma fase posterior
- a abstracao multi-provider sera introduzida no momento certo, em vez de interromper a entrega atual

## Proximos passos

- concluir o backlog principal do produto com GitLab
- identificar os pontos de maior acoplamento para futura extracao
- planejar a camada de provider quando GitHub entrar oficialmente no escopo
