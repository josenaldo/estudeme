# EstudeMe — Design Document

**Data:** 2026-04-14
**Status:** Draft (em revisão)
**Autor:** Josenaldo de Oliveira Matos Filho

---

## 1. Identidade e Visão

**Nome:** EstudeMe (`estudeme.com` / `estudeme.com.br`)

**Tagline:** "Seu grimório de estudos — organize trilhas, domine conteúdo, meça progresso."

### O que é

Plataforma open-core de estudo autodidata onde o vault Markdown é o formato universal de dados. O estudante é protagonista — ele cria, organiza e estuda seu conteúdo. A ferramenta tira do caminho o trabalho mecânico e dá visibilidade sobre onde ele está e para onde ir.

### Para quem (em ordem de prioridade)

1. **Autodidata** — quer aprender por conta própria, precisa de estrutura e direcionamento
2. **Professor** — quer gerar materiais de estudo para alunos e publicar como site
3. **Especialista/Criador** — autodidata que deu certo, compartilha/vende seus vaults curados

### Princípio Fundacional: Student-First

O produto serve primeiro ao estudante. Criadores de conteúdo são estudantes que deram certo — eles não precisam de ferramentas de autoria separadas porque o vault curado é artefato natural do estudo. O marketplace emerge organicamente: quem estudou bem, já tem conteúdo para compartilhar. Isso resolve o cold start problem e garante legitimidade do conteúdo.

### Modelo Open-Core

- **Aberto:** Core lib + CLI + Skills + Plugin Obsidian
- **Fechado:** App web (SaaS com tiers free/pro/max) + API B2B
- **Vault sempre do usuário:** dados abertos, formato Markdown, portável

### Diferencial vs. o que existe

Plugins Obsidian existentes (obsidian-spaced-repetition, flashcards-obsidian, quiz-generator) fazem coisas isoladas. **Nenhum integra analytics de aprendizado** com **orquestração de estudo** — progresso por trilha, retenção por tópico, recomendação de próximos passos, e principalmente o **Colega CDF**: chat conversacional contextual de estudo que entende o vault e o desempenho do estudante.

---

## 2. Arquitetura

**Abordagem:** Core Lib + múltiplos frontends.

```
┌─────────────────────────────────────────────────┐
│                   Usuário                        │
├──────────┬──────────┬──────────┬────────────────┤
│  Plugin  │   CLI    │  Skills  │  Site/Web      │
│ Obsidian │          │  (.md)   │  (futuro)      │
├──────────┴──────────┴──────────┴────────────────┤
│              Core Lib (TypeScript)               │
│  ┌─────────┬──────────┬─────────┬─────────────┐ │
│  │ Parser  │ Spaced   │ Metrics │ Content     │ │
│  │ Vault   │ Rep(FSRS)│ Engine  │ Generator   │ │
│  └─────────┴──────────┴─────────┴─────────────┘ │
├─────────────────────────────────────────────────┤
│           Vault (Markdown + Frontmatter)         │
└─────────────────────────────────────────────────┘
```

### Camadas

**Core Lib** (TypeScript, agnóstica) — não importa Obsidian. Módulos:
- **Vault Parser** — lê vault, indexa por frontmatter, resolve wikilinks
- **Spaced Repetition Engine** — algoritmo FSRS, agenda de revisão
- **Metrics Engine** — progresso por trilha/módulo, scores, retenção
- **Content Generator** — templates para cards, quizzes, notas (sem IA — IA é do usuário)

**CLI** — primeira classe, não afterthought:
- `estudeme init` — inicializa vault com estrutura e templates
- `estudeme trail list/create/status` — gerencia trilhas
- `estudeme cards generate/review/export` — flashcards
- `estudeme quiz generate/run` — quizzes
- `estudeme metrics show` — dashboard de progresso
- `estudeme site build/publish` — gera site do vault
- `estudeme ingest` — delega para KB se instalado

**Skills** — arquivos `.md` que ensinam agentes (Claude Code, Gemini, Copilot) a usar a CLI.

**Plugin Obsidian** — frontend visual, chama core lib diretamente.

**MCP Server** — expõe tools de estudo para qualquer agente compatível.

**Site/Web** (futuro) — outro frontend, usa core lib ou API.

### Integração com KB (Wendel)

O LLM-knowledge-base (github.com/wendeus0/LLM-knowledge-base) é a engine de ingestão recomendada. MIT, Python, 223 testes, 96% cobertura. Faz: ingest → compile → Q&A → heal/lint. Output é Markdown com wikilinks.

**Integração em 3 níveis:**
1. KB como upstream documentado
2. Skill que orquestra KB + EstudeMe
3. `estudeme ingest` delega para KB se instalado

Sem planos de internalizar ingestão. Futuramente, se outros sistemas surgirem, discutir padrão de interoperabilidade.

---

## 3. Modelo de Dados

**Princípio:** frontmatter como contrato, templates como conveniência. O plugin/CLI encontra conteúdo por metadata, não por localização. O usuário organiza pastas como quiser.

### Tipos Core (MVP)

**Trail (trilha)**
```yaml
---
type: trail
title: "Java Backend"
description: "Do zero ao deploy"
level: intermediate        # beginner | intermediate | advanced
prerequisites: []          # wikilinks para outras trilhas
tags: [java, backend]
status: active             # active | completed | paused
created: 2026-04-14
---
```

**Module (módulo)**
```yaml
---
type: module
title: "Fundamentos Java"
trail: "[[Java Backend]]"
order: 1
status: in-progress
---
```

**Note (nota de estudo)**
```yaml
---
type: note
title: "Tipos Primitivos em Java"
trail: "[[Java Backend]]"
module: "[[01 - Fundamentos Java]]"
difficulty: 1
tags: [java, fundamentos]
---
```

**Card (flashcard)**
```yaml
---
type: card
card-type: basic           # basic | cloze | vocab | scenario | pitfall
trail: "[[Java Backend]]"
module: "[[01 - Fundamentos Java]]"
source: "[[Tipos Primitivos]]"
difficulty: 2
---
## Frente
Qual a diferença entre `int` e `Integer` em Java?

## Verso
`int` é tipo primitivo (stack, sem null). `Integer` é wrapper object (heap, nullable, autoboxing).
```

**Quiz**
```yaml
---
type: quiz
title: "Quiz - Fundamentos Java"
trail: "[[Java Backend]]"
module: "[[01 - Fundamentos Java]]"
questions: 10
passing-score: 70
---
```

**Exam (simulado)**
```yaml
---
type: exam
title: "Simulado - Java SE 21 Certification"
trail: "[[Java Backend]]"
time-limit: 90             # minutos
questions: 50
passing-score: 68
tags: [certificacao, oracle]
---
```

**Resource (referência externa)**
```yaml
---
type: resource
resource-type: video       # video | book | article | course | podcast | paper | repo
title: "Spring Boot Tutorial - Amigoscode"
url: "https://youtube.com/..."
trail: "[[Java Backend]]"
status: watched            # to-consume | in-progress | consumed | watched | read
rating: 4
---
```

**Performance (gerado pelo sistema)**
```yaml
---
type: performance
date: 2026-04-14
trail: "[[Java Backend]]"
module: "[[01 - Fundamentos Java]]"
activity: card-review      # card-review | quiz | exam
---
```

### Catálogo Extensível de Tipos

O sistema de tipos é aberto — frontmatter define o tipo, novos tipos podem ser adicionados sem mudar a arquitetura.

- **Core (MVP):** trail, module, note, card, quiz, exam, performance, resource
- **Notas do usuário:** atomic-note, literature-note, permanent-note, summary, cornell-note, mindmap, moc, glossary, learning-log
- **Revisão:** card, cloze, quiz, feynman-explanation
- **Prática:** exercise, code-kata, project, lab, mock-interview, case-study, challenge
- **Avaliação:** exam, competency-checklist, self-assessment, certificate
- **Planejamento:** trail, sprint, review-template, kanban

### Dois papéis por recurso

1. **Catalogar** (local, grátis) — registrar que o recurso existe, metadata
2. **Processar** (API, pago) — resumo, fichamento, extração de cards, transcrição

### Princípios do Modelo

1. **Frontmatter como contrato** — o `type` define o que o sistema espera encontrar
2. **Wikilinks para relações** — trail→module→note→card, tudo via `[[links]]`
3. **Extensível** — novos types adicionados sem mudar arquitetura
4. **Validável** — `estudeme validate` aponta frontmatter incompleto
5. **Gerado e editável** — performance gerado pelo sistema, mas legível. Cards podem ser gerados por IA mas editados pelo usuário.

---

## 4. Fases de Entrega

Cada fase entrega algo **usável e completo por si só**.

### Fase 0 — Fundação (Core Lib + CLI)

Monorepo `estudeme` com core lib e CLI funcionais. Vault codex como cobaia.

- `estudeme init` — vault com templates e frontmatter padrão
- `estudeme validate` — frontmatter, links quebrados, tipos
- `estudeme trail list/status` — trilhas e progresso
- `estudeme cards list/export` — lista cards, exporta `.apkg` (absorve arcana)
- `estudeme metrics show` — dashboard no terminal

**Critério:** você usa com seu vault. Skills funcionam com agentes.

### Fase 1 — Skills + IA do Usuário

Skills que permitem agentes operar o sistema.

- `estudeme-trail`, `estudeme-cards`, `estudeme-quiz`, `estudeme-ingest`
- Todas chamam a CLI por baixo

**Critério:** estudante instala CLI + skills, conversa com Claude/Gemini, agente faz tudo.

### Fase 2 — Revisão Espaçada + Quizzes Interativos

Engine FSRS na core lib + comandos interativos na CLI.

- `estudeme review` — sessão de revisão de cards no terminal
- `estudeme quiz run` — quiz interativo no terminal
- Engine FSRS atualiza frontmatter dos cards
- Performance registrada como notas tipo `performance`
- Métricas de retenção e recomendações

**Critério:** ciclo completo de estudo via terminal/agente.

### Fase 3 — Plugin Obsidian

Plugin que traz tudo para dentro do Obsidian com interface visual.

- 5 views: Painel CDF, Trail Map, Card Review, Quiz Runner, Dashboard
- MCP Server para integração com agentes externos
- Publicação no marketplace do Obsidian

**Critério:** plugin no marketplace, primeira visibilidade ampla.

### Fase 4 — Gerador de Site

`estudeme site build/publish` — gera site estático com Quartz/Astro.

- Renderiza trilhas como roadmaps visuais interativos
- Cards e quizzes funcionam no browser
- Deploy automático no GitHub Pages
- Templates para diferentes perfis (estudante, professor, certificação)

**Critério:** professores publicam material para alunos. codex-technomanticus-site é substituído por isso.

### Fase 5 — Marketplace + API (SaaS)

Plataforma web para compartilhar/vender vaults + API de serviços.

- **Marketplace:** browse, import com um clique, rating, reviews
- **Tiers:** Free (1 trilha) / Pro (2-10) / Max (10+, compartilhamento, import)
- **Pro:** acesso ao Colega CDF com nossa API (OpenRouter por trás)
- **API B2B:** ingestão, resumos, fichamentos, avaliação de respostas abertas
- **Mobile web:** revisão de cards e quizzes no browser mobile

**Critério:** primeiro usuário pagante.

---

## 5. Stack Técnica

### Estrutura do Monorepo

```
estudeme/
├── packages/
│   ├── core/              ← Core Lib (TS, zero deps de Obsidian)
│   │   └── src/
│   │       ├── parser/    ← lê vault, indexa frontmatter
│   │       ├── spaced/    ← engine FSRS
│   │       ├── metrics/   ← progresso, retenção, recomendações
│   │       ├── content/   ← templates, geração
│   │       ├── export/    ← .apkg, JSON, CSV
│   │       └── types/     ← schemas, validação
│   ├── cli/               ← CLI (usa core)
│   │   └── src/commands/  ← init, trail, cards, quiz, review, metrics, ingest, site, validate
│   └── obsidian-plugin/   ← Plugin Obsidian (usa core)
│       └── src/
│           ├── views/     ← Painel CDF, Trail Map, Cards, Quiz, Dashboard
│           └── commands/  ← command palette
├── skills/                ← Skills para agentes
├── templates/             ← Templates Obsidian (Templater-compatible)
├── docs/                  ← Specs, ADRs, guides
├── turbo.json
├── package.json           ← workspace root
└── tsconfig.base.json
```

### Escolhas Técnicas

| Decisão | Escolha | Por quê |
|---------|---------|---------|
| Linguagem | TypeScript | Plugin Obsidian é TS obrigatório |
| Monorepo | Turborepo | Simples, rápido, caching |
| Bundler core/cli | tsup | Build rápido, ESM + CJS |
| Bundler plugin | esbuild | Padrão para plugins Obsidian |
| Testes | Vitest | Rápido, ESM nativo |
| CLI framework | Commander.js | Leve, maduro |
| FSRS | ts-fsrs | FSRS-5 em TypeScript |
| Export Anki | genanki-js (avaliar) | Gerar .apkg sem Python |
| Lint | ESLint + Prettier | Padrão |
| CI | GitHub Actions | Lint, test, build em PRs |

### Integrações Externas

| Ferramenta | Relação |
|------------|---------|
| KB (Wendel) | Engine de ingestão (CLI delega) |
| Obsidian | Plataforma do plugin |
| Quartz/Astro | Gerador de site (Fase 4) |
| Anki | Export de cards |
| OpenRouter | Backend de IA do Pro (Fase 5) |

### O que NÃO está na stack (intencionalmente)

- Banco de dados — tudo é Markdown + frontmatter
- IA embutida — IA é do usuário (via agente/skills) ou do Pro (OpenRouter)
- Framework web — só na Fase 5

---

## 6. UX / Visual do Plugin

### Princípio: Editor Sagrado, CDF como Ponto Único

O plugin **não** interfere no editor do Obsidian. Toda interação é pelo painel lateral.

- Painel escondido → Obsidian puro
- Painel aberto → estudando com o CDF
- Seleção de texto → menu contextual (única exceção, ação voluntária)
- Modo Estudo = conversa natural entre colegas no painel lateral

### Posicionamento: Colega CDF, não Copilot

Copilot ajuda a *fazer*. Colega CDF ajuda a *entender*. O estudante não quer um robô — quer um colega que estudou mais que ele.

### Views

**1. Painel CDF (sidebar direita) — ponto único**

Sempre visível. Contextual. Muda conforme o que está aberto:
- Nota aberta → contexto da nota, cards relacionados, ações, chat
- Card aberto → revisar, editar, ver fonte
- Trilha aberta → progresso, recomendações
- Sem nada aberto → home do estudante (cards de hoje, streak, próximos passos)

Estrutura:
- 📊 Hoje (cards vencidos, streak, atalho para revisar)
- 📋 Trilha ativa (barra de progresso, próximo passo)
- 💬 Chat com o CDF (perguntas bidirecionais)
- ⚡ Ações contextuais (gerar cards, criar quiz, etc.)
- 🔗 Relacionados (notas próximas, anterior/próximo)

**2. Trail Map (tab no editor)**

Visualização de grafo da trilha (inspirada no roadmap.sh). Nós com cores por status (✅ completo, 🔄 em progresso, ⬚ não iniciado). Clicar abre o módulo.

**3. Card Review (tab/modal)**

Interface minimalista: pergunta → flip → avaliar (1-4 = De novo / Difícil / Bom / Fácil). Atalhos de teclado.

**4. Quiz Runner (tab/modal)**

Quiz interativo: pergunta + opções → confirmar → feedback imediato → próxima. Timer opcional para simulados.

**5. Dashboard (tab)**

Visão geral: streaks, trilhas em andamento, retenção dos últimos 30 dias, recomendações, atividade recente.

### Modo Estudo

Quando ativo, o CDF percebe a nota aberta e faz perguntas no painel lateral, como um colega genuíno:

> CDF: "Opa, vi que você tá lendo sobre primitivos. Bora ver se tá fixando? Quantos tipos primitivos Java tem?"

Aceita respostas abertas (avaliadas por IA) e múltipla escolha. Registra desempenho silenciosamente. O estudante também faz perguntas — bidirecional.

### Mobile (Obsidian Mobile)

Mesmas views, layout adaptado:
- Painel CDF → full-screen com swipe
- Card Review → swipe left/right para avaliar
- Quiz → botões touch-friendly
- Trail Map → lista com indicadores (não grafo completo)
- Dashboard → cards empilhados verticalmente

### Integração de IA (3 níveis)

1. **Free local** — usuário usa sua própria IA (API key OpenAI/Anthropic, Ollama local, agente CLI como Claude Code)
2. **MCP Server** — qualquer agente compatível com MCP pode usar tools de estudo
3. **Pro** — Colega CDF com nossa API (OpenRouter por trás), sem configuração, contexto integrado

---

## 7. Riscos e Mitigações

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|:------------:|:-------:|-----------|
| 1 | Dependência do Obsidian | Baixa | Alto | Core lib separada — frontends substituíveis |
| 2 | Escopo vs. equipe (1 pessoa, 6 fases) | Alta | Alto | Fases incrementais, cada uma é produto completo |
| 3 | Custo de IA para o usuário | Média | Médio | IA opcional, modelos locais, Pro com preço fixo |
| 4 | Cold start do marketplace | Média | Médio | Marketplace só na Fase 5; vaults próprios como semente |
| 5 | "Mais um plugin de flashcard" | Média | Alto | Posicionamento: plataforma de estudo, não plugin de cards |
| 6 | Performance com vaults grandes | Baixa | Médio | Cache, índice lazy, precedente do Dataview |
| 7 | Obsidian Mobile limitado | Média | Médio | Teste early, site (Fase 4) como fallback mobile |

### Detalhes-chave

**Risco 2 (escopo):** Não é pra entregar tudo. É pra entregar a Fase 0 e ver o que acontece. Cada fase pode ser ponto final viável.

**Risco 5 (posicionamento):** O diferencial não são os flashcards — é o **Colega CDF + analytics + orquestração**. Nenhum plugin existente combina chat conversacional contextual de estudo, métricas de retenção por trilha/módulo, e caminho para marketplace.

---

## 8. Relação com Repos Existentes

Os 3 repos atuais são sementes da ideia, não o produto final:

- **codex-technomanticus** → primeiro vault de exemplo / proof of concept
- **codex-technomanticus-site** → prova que publicação de vault como site funciona; será substituído pelo gerador da Fase 4
- **codex-technomanticus-arcana** → prova que geração de cards funciona; existe como repo separado para compartilhar `.apkg` via GitHub releases. No futuro, export `.apkg` será feature do plugin

---

## 9. Próximos Passos

1. Aprovar este design
2. Escrever plano de implementação detalhado da **Fase 0** (writing-plans skill)
3. Iniciar implementação da Fase 0 no repo `estudeme`
4. Validar com o vault codex-technomanticus

---

## Apêndice A — Inspirações e Referências

- **Karpathy's memory/second brain** — ingestão inteligente, /raw folder, "humano cura, máquina faz o resto"
- **graphify** (safishamsi) — knowledge graph de qualquer pasta, 71.5x menos tokens
- **MemPalace** (Milla Jovovich) — memória verbatim com ChromaDB, arquitetura palace
- **LLM-knowledge-base** (Wendel) — engine de ingestão, parceiro direto
- **flashcards-obsidian** (reuseman) — integração Anki, MIT
- **obsidian-spaced-repetition** — mais maduro, FSRS
- **Quiz Generator** — IA-powered quizzes
- **roadmap.sh** — roadmaps visuais, tracking por clique, dois eixos (papel + skill)
- **Copilot for Obsidian** / **BMO Chatbot** — chat sidebar como referência de UX

## Apêndice B — Origem da Ideia

Surgiu de conversa no grupo RESPEITOSO TECH (2026-04-13). Múltiplas pessoas convergindo para a mesma necessidade por caminhos diferentes — sinal de validação real de mercado.

## Apêndice C — Status

Fase de brainstorming/ideação concluída. Aguardando aprovação para iniciar plano de implementação da Fase 0.
