# Blueprint de Workflows RD Station por Tier do Quiz

**Status:** Pedro/operação Jofi vai configurar no painel RD. Os 8 custom fields (`cf_quiz_*`, `cf_pet_*`) já estão criados — esses workflows os consomem.

**Goal:** Cada lead que sai do quiz cai numa jornada de email/automação adequada ao seu tier. Sem isso, leads chegam no RD mas não acionam nenhum email — desperdício de pipeline.

---

## Setup base (faça PRIMEIRO, antes dos workflows)

### Listas dinâmicas a criar (4)

Painel RD → **Listas** → **Nova lista** → **Lista dinâmica**

| Nome da lista | Condição |
|---------------|----------|
| **Quiz Jofi — Lead Quente** | Campo personalizado > `cf_quiz_tier` > Igual a > `quente` |
| **Quiz Jofi — Lead Morno** | Campo personalizado > `cf_quiz_tier` > Igual a > `morno` |
| **Quiz Jofi — Lead Frio** | Campo personalizado > `cf_quiz_tier` > Igual a > `frio` |
| **Quiz Jofi — Cliente Jofi (filtro)** | Campo personalizado > `cf_plano_atual` > Igual a > `sim-jofi` |

A lista 4 é um **filtro de exclusão** — leads que já são clientes Jofi não devem receber ofertas dos workflows 1, 2 ou 3. Em cada workflow, adicione condição "**E** NÃO está na lista 'Cliente Jofi (filtro)'".

---

## Workflow 1: Lead QUENTE 🔥

### Goal
Ativar lead pro **Plano Parceiro** (R$ 169,90) via Nicole WhatsApp em **<24h**.

### Trigger
Lead **entra na lista** "Quiz Jofi — Lead Quente"
**E** NÃO está na lista "Cliente Jofi (filtro)"

### Fluxo (6 steps)

#### Step 1 — IMEDIATO: Notificar time
- **Action:** Enviar email/Slack pra `nicole@jofi.pet` (ou time comercial)
- **Subject:** `🔥 LEAD QUENTE: {nome} — gasta R$ {cf_gasto_mensal}/mês — Plano Parceiro`
- **Body:**
  ```
  Lead acabou de fechar o quiz com perfil quente.

  📱 WhatsApp: {mobile_phone}
  📧 Email: {email}
  🐾 Pet: {cf_pet_especie} {cf_pet_idade}
  🩺 Última vet: {cf_pet_ultima_vet}
  💰 Gasto atual: R$ {cf_gasto_mensal}/mês
  📋 Plano atual: {cf_plano_atual}
  📊 Score: {cf_quiz_score}/105
  📍 CEP: {cf_cep}

  Recomendado: Plano Parceiro (R$ 169,90)

  Ação: contatar via WhatsApp em até 30 min (auto-redirect já abriu conversa).

  Link do contato no RD: {link_contato}
  ```

#### Step 2 — IMEDIATO: Tag
- Adicionar tags: `lead-quente`, `aguardando-conversa-nicole`

#### Step 3 — +30 min: Email follow-up se Nicole não tocou
- **Condição:** Se contato AINDA tem tag `aguardando-conversa-nicole`
- **Subject:** `{nome}, ainda dá tempo de falar com a Nicole 🐾`
- **Body:**
  ```
  Oi {nome}!

  Vi que você fez o quiz e teu {cf_pet_especie} {cf_pet_idade}
  precisa do nosso Plano Parceiro.

  A Nicole está no WhatsApp esperando — qualquer dúvida sobre cobertura,
  preço ou ativação, ela responde rapidinho.

  👉 [Falar com Nicole agora] (link WhatsApp pré-preenchido)

  Ou se preferir email, é só responder esse aqui.

  — Time Jofi 💛
  ```

#### Step 4 — +24h: Proposta personalizada
- **Subject:** `{nome}, sua proposta do Plano Parceiro pro {cf_pet_especie}`
- **Body:**
  ```
  Olá {nome}!

  Como você gasta cerca de R$ {cf_gasto_mensal}/mês com seu {cf_pet_especie}
  hoje, o Plano Parceiro faz sentido pra você:

  ✓ Internação 24h + cirurgias inclusas
  ✓ Especialistas (cardio, oftalmo, dermato) sem extra
  ✓ Cobertura imediata em emergências
  ✓ Sem coparticipação
  ✓ R$ 169,90/mês (vs seus R$ {cf_gasto_mensal} atuais com vet)

  👉 [Ativar Plano Parceiro] (link checkout direto)

  — Nicole, especialista Jofi
  ```

#### Step 5 — +3 dias: Última oportunidade (scarcity ético)
- **Subject:** `{nome}, vagas limitadas na sua região`
- **Body:**
  ```
  {nome},

  Na sua região ({cf_cep}), atendemos um número limitado de novos planos
  por mês pra garantir a qualidade do atendimento.

  Restam poucas vagas até {data_+7_dias}.

  Se ainda quiser ativar o Plano Parceiro:
  👉 [Confirmar minha vaga]

  Se mudou de ideia, sem problemas. É só responder "não tenho mais interesse"
  e a gente para de mandar.

  — Time Jofi
  ```

#### Step 6 — +7 dias: Mover pra lista "Quente não-convertido"
- **Action:** Mover lead pra lista "Quentes — reativar em 30d"
- **Goal:** Workflow de re-engajamento daqui 30 dias com nova abordagem (case study, depoimento)

### Métricas de sucesso esperadas

| Métrica | Meta |
|---------|------|
| Open rate (média 6 emails) | >35% |
| Click pro WhatsApp/Checkout | >25% |
| Conversão em plano em 7d | >8% |
| Tempo médio até venda | <48h |

---

## Workflow 2: Lead MORNO 🌻

### Goal
Ativar **Sereninho (R$ 49,90)** como ticket de entrada + nurture pra upgrade Sereno (R$ 79,90).

### Trigger
Lead entra na lista "Quiz Jofi — Lead Morno"
**E** NÃO está em "Cliente Jofi (filtro)"

### Fluxo (6 steps)

#### Step 1 — IMEDIATO: Boas-vindas
- **Subject:** `{nome}, seu plano ideal: Sereno por R$ 79,90`
- **Body:**
  ```
  Oi {nome}! 🐾

  Acabou de fazer o quiz. Pelo perfil do seu {cf_pet_especie},
  recomendamos o Plano Sereno — proteção sem peso no orçamento.

  Compare:

  Você gasta hoje: R$ {cf_gasto_mensal}/mês com vet
  Plano Sereno: R$ 79,90/mês (cobertura ampla)
  Plano Sereninho: R$ 49,90/mês (essenciais)

  👉 [Conhecer o Sereninho — começa por R$ 49,90]

  Ou se quiser entender melhor, responde esse email.

  — Time Jofi 💛
  ```

#### Step 2 — +1 dia: Educação sobre coberturas
- **Subject:** `O que cabe e o que não cabe no Sereninho`
- **Body:** Detalha vacinação, consultas, exames + comparação com Sereno (upsell sutil)

#### Step 3 — +3 dias: Social proof
- **Subject:** `Como o {especie_random} do Rafael economizou R$ 800 com o Sereninho`
- **Body:** Case real (precisa entregar Jofi) — emergência onde plano pagou

#### Step 4 — +5 dias: Oferta entry com urgência leve
- **Subject:** `{nome}, ativa o Sereninho hoje (sem fidelidade)`
- **Body:**
  ```
  Olá {nome}!

  O Sereninho não tem multa de fidelidade — você ativa hoje, testa por 30 dias,
  cancela quando quiser.

  ✓ Consultas inclusas
  ✓ Vacinas essenciais cobertas
  ✓ Exames iniciais sem custo extra
  ✓ R$ 49,90/mês (menos que 1 ração premium)

  👉 [Ativar Sereninho agora] (checkout direto)

  Pronto pra começar a cuidar com tranquilidade?
  ```

#### Step 5 — +7 dias: Quebra de objeção
- **Subject:** `{nome}, ainda em dúvida? Tira com a Nicole agora`
- **Body:** Link WhatsApp pré-preenchido com mensagem rica

#### Step 6 — +14 dias: Mover pra newsletter educacional
- **Action:** Adicionar a lista "Newsletter Jofi — educacional mensal"

### Métricas esperadas

| Métrica | Meta |
|---------|------|
| Open rate | >30% |
| Click pro Sereninho/Sereno | >15% |
| Conversão em 14d | >5% |

---

## Workflow 3: Lead FRIO 💙

### Goal
**Educar** + construir relacionamento de longo prazo. Conversão esperada em 3-6 meses, não imediato.

### Trigger
Lead entra em "Quiz Jofi — Lead Frio"
**E** NÃO está em "Cliente Jofi (filtro)"

### Fluxo (5 steps, sem pressão)

#### Step 1 — IMEDIATO: Boas-vindas educacional
- **Subject:** `{nome}, bem-vindo à comunidade Jofi 🐾`
- **Body:**
  ```
  Olá {nome}!

  Que bom te ver por aqui. Pelo perfil do seu {cf_pet_especie} {cf_pet_idade},
  você está num momento bom de cuidado preventivo — sem urgência, mas
  vale começar a estruturar.

  Preparamos um guia gratuito de cuidados essenciais pro seu {cf_pet_especie}:

  👉 [Baixar guia gratuito]

  E semana que vem te mando um conteúdo novo. Sem spam.

  — Time Jofi
  ```

#### Step 2 — +2 dias: Conteúdo prático
- **Subject:** `5 erros comuns que tutores cometem (e como evitar)`
- **Body:** Lista educacional. CTA suave: "Quando quiser, conheça os planos a partir de R$ 49,90"

#### Step 3 — +5 dias: Pensamento estratégico
- **Subject:** `Quando começar a pensar em plano pet?`
- **Body:** Educação sem venda agressiva. CTA: "Refazer o quiz se mudou alguma coisa"

#### Step 4 — +10 dias: Storytelling
- **Subject:** `História: o que aprendi esperando demais pra ter plano`
- **Body:** Case emocional real (precisa entregar Jofi). Tom: aprendizado, não terrorismo.

#### Step 5 — +15 dias: Mover pra newsletter mensal
- **Action:** Adicionar a lista "Newsletter Jofi — educacional mensal"

### Métricas esperadas

| Métrica | Meta |
|---------|------|
| Open rate | >25% |
| Click em conteúdo | >10% |
| Conversão em 6 meses | >3% |

---

## Workflow 4 (BONUS): Cliente Jofi atual

### Goal
**NÃO** enviar workflows 1-3 (já é cliente — ofereceria o que ele já tem) + identificar oportunidades de retenção/upgrade.

### Trigger
Contato entra em "Quiz Jofi — Cliente Jofi (filtro)" (`cf_plano_atual = "sim-jofi"`)

### Fluxo (2 steps)

#### Step 1 — IMEDIATO: Marcar internamente
- Tag: `cliente-jofi-quiz`
- Notificar time de retenção: "Cliente fez o quiz! Pode ser sinal de re-avaliação ou tem dúvidas."

#### Step 2 — +1 dia: Engajamento gentil
- **Subject:** `{nome}, obrigado por fazer o quiz!`
- **Body:**
  ```
  Olá {nome}!

  Vi que você fez nosso quiz. Você já é cliente Jofi — então sabe que
  cuidamos do seu {cf_pet_especie}!

  Tem alguma dúvida sobre seu plano atual? Ou quer entender se vale
  upgrade pra outro nível?

  👉 [Falar com suporte Jofi] (link WhatsApp)

  — Time Jofi
  ```

**IMPORTANTE:** Não inscrever em workflows 1-3 (cliente já paga, oferta seria estranha).

---

## Como criar os workflows no painel RD

### Caminho

```
Painel RD Station Marketing → Automação de Marketing
  → Novo Fluxo de Automação
```

### Configuração de um workflow (genérico)

1. **Trigger (gatilho de entrada):**
   ```
   Quando: Lead entra na lista
   Lista: "Quiz Jofi — Lead Quente"  (escolher conforme workflow)
   ```

2. **Filtro adicional (importante):**
   ```
   E: NÃO está na lista "Quiz Jofi — Cliente Jofi (filtro)"
   ```
   Isso evita que cliente Jofi que respondeu o quiz receba oferta.

3. **Adicionar passos:**
   - "Enviar email" (escolhe template ou cria inline)
   - "Esperar" (definir tempo)
   - "Aplicar tag"
   - "Mover de lista"
   - Etc.

4. **Ativar** quando estiver pronto.

### Templates de email

Pra cada workflow, crie templates reutilizáveis em **RD → Email Marketing → Templates** com os placeholders:

| Placeholder | Resolve pra |
|-------------|------------|
| `{nome}` | Primeiro nome (RD trata automático) |
| `{cf_pet_especie}` | "cao" / "gato" / "outro" |
| `{cf_pet_idade}` | "filhote" / "adulto" / "idoso" |
| `{cf_pet_ultima_vet}` | "menos-1-mes" / etc |
| `{cf_gasto_mensal}` | Número (R$/mês) |
| `{cf_quiz_tier}` | "quente" / "morno" / "frio" |
| `{cf_quiz_score}` | Número 0-105 |
| `{cf_cep}` | "00000-000" ou vazio |
| `{cf_plano_atual}` | "nao" / "sim-outro" / "sim-jofi" |

Sugestão de UX no email: traduzir slugs pra labels humanos via condicionais do RD (se `cf_pet_especie = "cao"` → escrever "cãozinho" no texto).

---

## Checklist de implementação

### Fase 1 — Setup base (30 min)
- [ ] Criar lista dinâmica "Quiz Jofi — Lead Quente"
- [ ] Criar lista dinâmica "Quiz Jofi — Lead Morno"
- [ ] Criar lista dinâmica "Quiz Jofi — Lead Frio"
- [ ] Criar lista dinâmica "Quiz Jofi — Cliente Jofi (filtro)"

### Fase 2 — Templates (1h)
- [ ] Criar 6 templates de email Workflow 1 (Quente)
- [ ] Criar 5 templates Workflow 2 (Morno)
- [ ] Criar 5 templates Workflow 3 (Frio)
- [ ] Criar 1 template Workflow 4 (Cliente)
- [ ] Revisão de copy com Nicole/marketing

### Fase 3 — Fluxos (1h)
- [ ] Configurar Workflow 1 (Quente) — 6 steps
- [ ] Configurar Workflow 2 (Morno) — 6 steps
- [ ] Configurar Workflow 3 (Frio) — 5 steps
- [ ] Configurar Workflow 4 (Cliente) — 2 steps
- [ ] Adicionar filtro de exclusão (NÃO cliente Jofi) em 1, 2, 3
- [ ] Deixar todos os 4 **PAUSADOS** inicialmente

### Fase 4 — Validação (1h)
- [ ] Fazer 1 lead teste de cada tier (3 leads: quente/morno/frio)
- [ ] Verificar em 30 min se receberam o email correto
- [ ] Verificar tags aplicadas
- [ ] Validar que cliente Jofi NÃO recebe workflow 1/2/3
- [ ] **ATIVAR** workflows após validação

### Fase 5 — Monitoramento (semanal)
- [ ] Acompanhar open rate de cada workflow
- [ ] Acompanhar click rate
- [ ] Identificar emails com baixa performance e iterar
- [ ] Ajustar timing se necessário (ex: 30 min é cedo? +30 min é tarde?)

---

## Otimizações futuras (após 60 dias rodando)

1. **Threshold dinâmico:** se distribuição ficar muito morno (>70%), considerar baixar threshold de quente de 70 pra 65.
2. **A/B test cadência:** workflows mais curtos (3 emails) vs longos (6 emails)
3. **Lookalike audience:** após 100+ conversões, criar lookalike no Meta usando lista de "Quentes convertidos"
4. **Predictive scoring:** RD tem feature de score preditivo — habilitar e comparar com nosso `cf_quiz_score`

---

## Referências

- Doc RD workflows: https://ajuda.rdstation.com/s/article/Como-criar-um-Fluxo-de-Automacao
- Listas dinâmicas: https://ajuda.rdstation.com/s/article/Como-criar-uma-lista-din-mica
- Templates de email: https://ajuda.rdstation.com/s/article/Como-criar-template-de-email
