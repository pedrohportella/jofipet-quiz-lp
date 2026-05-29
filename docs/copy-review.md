# Revisão Completa de Copy — Jofi Quiz LP

**Objetivo:** revisar TODA a copy (texto visível ao usuário) das 2 estruturas. Cada string tem:
- 📍 **path** (arquivo:linha aproximada)
- 📝 **Copy atual**
- ✏️ **Sugestão de mudança** (campo pra você preencher)
- 🏷️ **Status**: ⚠️ placeholder · 🟡 revisar tom · ✅ aprovado · 🔵 já bom

**Como usar:** revisa cada seção. Onde quiser mudar, escreve o novo texto na coluna ✏️. Depois manda o doc inteiro ou áreas específicas pra mim que eu aplico em batch.

---

## 🗺️ Estrutura

- [Sprint 1 — Conteúdo crítico (4 planos, testemunhos, FAQ)](#sprint-1)
- [Sprint 2 — Hero + first impression (LP, /oferta hero, modal)](#sprint-2)
- [Sprint 3 — Funil quiz (perguntas, captura, result)](#sprint-3)
- [Sprint 4 — LP /oferta body (Problem, Solution, MidCta, FinalCta, Guarantee)](#sprint-4)
- [Sprint 5 — Mensagens WhatsApp (3 templates)](#sprint-5)
- [Sprint 6 — Refinamentos (helpers, vídeo, footer)](#sprint-6)
- [Sprint 7 — SEO Metadata](#sprint-7)

---

## SPRINT 1 — Conteúdo Crítico {#sprint-1}

### 1.1 — Os 4 Planos (`src/lib/plans/catalog.ts`)

Cada plano tem: `name`, `tagline`, `priceLabel`, `bullets` (3-7), `waitingDays`, `targetPersona`, `emoji`.
⚠️ **Bullets atuais são placeholders genéricos de pet insurance — precisam ser substituídos pelos bullets REAIS Jofi.**

#### 1.1.1 — Plano Sereninho 💙

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| **name** | `Sereninho` | |
| **tagline** | `Essencial` | |
| **priceLabel** | `R$ 49,90/mês` | |
| **targetPersona** | `Pra quem quer começar a cuidar com tranquilidade` | |
| **waitingDays** | `30` | |
| **bullet 1** ⚠️ | `2 consultas/ano com vet credenciado` | |
| **bullet 2** ⚠️ | `Vacinação essencial (V8/V10 + antirrábica)` | |
| **bullet 3** ⚠️ | `Exames laboratoriais básicos (hemograma, urinálise)` | |
| **bullet 4** ⚠️ | `Orientação veterinária 24h via WhatsApp` | |
| **bullet 5** ⚠️ | `Sem fidelidade — cancele quando quiser` | |

#### 1.1.2 — Plano Sereno 🌻

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| **name** | `Sereno` | |
| **tagline** | `Cuidado preventivo` | |
| **priceLabel** | `R$ 79,90/mês` | |
| **targetPersona** | `Pra quem quer prevenção sem peso no bolso` | |
| **waitingDays** | `30` | |
| **bullet 1** ⚠️ | `Consultas ilimitadas com vet credenciado` | |
| **bullet 2** ⚠️ | `Vacinação completa (V8/V10/V12 + antirrábica + gripe canina)` | |
| **bullet 3** ⚠️ | `Exames laboratoriais completos` | |
| **bullet 4** ⚠️ | `Exames de imagem básicos (raio-X, ultrassom)` | |
| **bullet 5** ⚠️ | `Atendimento de emergência 24h` | |
| **bullet 6** ⚠️ | `Sem coparticipação` | |

#### 1.1.3 — Plano Parceiro 🔥 (Mais Escolhido)

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| **name** | `Parceiro` | |
| **tagline** | `Proteção completa` | |
| **priceLabel** | `R$ 169,90/mês` | |
| **targetPersona** | `Pro tutor protetor que quer cobertura ampla` | |
| **waitingDays** | `60` | |
| **bullet 1** | `Tudo do Sereno +` | |
| **bullet 2** ⚠️ | `Internação 24h em rede credenciada` | |
| **bullet 3** ⚠️ | `Cirurgias eletivas + emergenciais` | |
| **bullet 4** ⚠️ | `Especialistas inclusos (cardio, derma, oftalmo, ortopedia)` | |
| **bullet 5** ⚠️ | `Carência reduzida pra emergências` | |
| **bullet 6** ⚠️ | `Sem coparticipação · Sem limite anual` | |

#### 1.1.4 — Plano Melhor Amigo 👑 (Premium)

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| **name** | `Melhor Amigo` | |
| **tagline** | `Cuidado premium` | |
| **priceLabel** | `R$ 269/mês` | |
| **targetPersona** | `Pro tutor que não quer poupar no cuidado` | |
| **waitingDays** | `90` | |
| **bullet 1** | `Tudo do Parceiro +` | |
| **bullet 2** ⚠️ | `Cirurgias complexas (ortopédicas, oncológicas)` | |
| **bullet 3** ⚠️ | `Quimioterapia + radioterapia` | |
| **bullet 4** ⚠️ | `Fisioterapia + acupuntura veterinária` | |
| **bullet 5** ⚠️ | `Reembolso de despesas externas até R$ 5.000/ano` | |
| **bullet 6** ⚠️ | `Atendimento prioritário VIP` | |

---

### 1.2 — Testemunhos (`src/components/oferta/Testimonials.tsx`)

⚠️ **3 testemunhos placeholders — substituir por reais com autorização LGPD.**

Section header:
- **Kicker:** `Tutores Jofi`
- **Headline:** `+500 famílias já cuidam **com a Jofi.**`

| # | Campo | Copy atual | Sugestão Pedro/Jofi |
|---|-------|-----------|---------------------|
| **T1** | nome | `Camila R.` | |
| | cidade | `Recife/PE` | |
| | plan | `Plano Sereno` | |
| | rating | 5 estrelas | |
| | body ⚠️ | `Tinha medo de assinar plano pet porque achei que era pegadinha. O time da Jofi me explicou tudo no WhatsApp em 10 minutos. Já usei pra 2 emergências do Théo. Vale cada centavo.` | |
| **T2** | nome | `Roberto M.` | |
| | cidade | `Salvador/BA` | |
| | plan | `Plano Parceiro` | |
| | rating | 5 estrelas | |
| | body ⚠️ | `Minha cachorra idosa começou a precisar de muito vet. Sem o Parceiro eu já teria gastado uns 8 mil só esse ano. Com o plano, pago R$ 169,90/mês e durmo tranquilo.` | |
| **T3** | nome | `Ana C.` | |
| | cidade | `São Paulo/SP` | |
| | plan | `Sereninho` | |
| | rating | 5 estrelas | |
| | body ⚠️ | `Adotei a Luna filhote e queria proteção sem gastar fortuna. O Sereninho cobre vacina, consulta e exame. Atendimento humano demais — recomendo de olhos fechados.` | |

---

### 1.3 — FAQ (`src/components/oferta/FAQ.tsx`)

🟡 **7 respostas plausíveis — revisar com operação Jofi.**

Section header:
- **Kicker:** `Tira a dúvida`
- **Headline:** `Perguntas frequentes`
- **Closing:** `Não achou sua pergunta? **Nosso time responde no WhatsApp.**`

| # | Pergunta | Resposta atual | Sugestão Pedro/Jofi |
|---|----------|---------------|---------------------|
| **Q1** 🟡 | `O que a Jofi cobre exatamente?` | `Depende do plano. Sereninho cobre consultas, vacinas e exames essenciais. Sereno adiciona exames de imagem e atendimento 24h. Parceiro inclui internação, cirurgias e especialistas. Melhor Amigo é a cobertura máxima — desde tratamento oncológico até fisioterapia. Nosso time te ajuda a escolher o que faz sentido pro seu pet.` | |
| **Q2** 🟡 | `Qual o tempo de carência?` | `A carência varia por plano: Sereninho e Sereno têm 30 dias, Parceiro 60 dias, Melhor Amigo 90 dias. Pra emergências há condições especiais — pergunte ao nosso time no WhatsApp.` | |
| **Q3** 🟡 | `Posso cancelar quando quiser?` | `Sim. Nenhum plano Jofi tem fidelidade. Você cancela a qualquer momento pelo WhatsApp do nosso time ou pelo email de contato. Sem multa, sem burocracia.` | |
| **Q4** 🟡 | `Onde encontro vets parceiros Jofi?` | `Temos rede credenciada nas principais cidades do Brasil. Quando você assina, nosso time te envia o mapa de vets parceiros perto do seu CEP. Se sua região ainda não tem rede, oferecemos reembolso em vets de sua escolha (consulte condições no plano Melhor Amigo).` | |
| **Q5** 🟡 | `Meu pet é idoso — aceito mesmo assim?` | `Sim! A Jofi aceita pets de qualquer idade. Pets idosos geralmente entram no Plano Parceiro ou Melhor Amigo (cobertura mais ampla pra demandas que vêm com a idade). A consulta inicial é gratuita pra avaliar o estado de saúde.` | |
| **Q6** 🟡 | `A Jofi atende gatos também?` | `Sim. Todos os planos cobrem cães e gatos. Algumas espécies exóticas (aves, répteis, roedores) ainda não — estamos expandindo. Pergunta pro nosso time se seu caso entra na cobertura.` | |
| **Q7** 🟡 | `Como funciona o pagamento?` | `Mensal via cartão de crédito, débito recorrente ou Pix. Sem taxa de adesão, sem entrada. Você só paga a mensalidade do plano escolhido.` | |

---

## SPRINT 2 — Hero + First Impression {#sprint-2}

### 2.1 — LP `/` Hero (`src/app/page.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Logo | `JOFI` (Anton bold) | |
| Kicker | `Plano de saúde pet` | |
| **Headline H1** | `Cuidar hoje.` `Proteger sempre.` (segunda linha em accent laranja) | |
| Subhead | `Em **~90 segundos**, a gente identifica o plano ideal pro seu pequeno 🐾` | |
| Social proof badge (HomeSocialProof) | `🐾 **+{X} tutores** fizeram o quiz hoje` (dinâmico — usa count real do KV) | |
| **CTA principal** | `Descobrir meu plano ideal →` | |
| Trust microcopy | `Sem cadastro pra começar · 100% gratuito` | |

### 2.2 — LP `/oferta` Hero (`src/components/oferta/Hero.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Logo | `JOFI` | |
| Kicker | `Plano de saúde pet` | |
| **Headline H1** | `Cuidar do seu pet` `**do jeito certo.**` (segunda linha accent laranja) | |
| Subhead | `Planos pet a partir de **R$ 49,90/mês**. Atendimento humano, cobertura ampla e zero burocracia. Mais de 500 tutores já cuidam com a Jofi 🐾` | |
| **CTA principal** | `Falar com nosso time no WhatsApp 🐾` | |
| CTA secundário | `Conhecer os planos ↓` | |
| Trust bullets | `⭐ +500 tutores · Atendimento 24h · LGPD compliant` | |

### 2.3 — Modal de Captura (`src/components/oferta/OfertaCaptureModal.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Header com plano | `Quer saber sobre o Plano {nome}?` (dinâmico) | |
| Header sem plano | `Vamos conversar?` | |
| Sub com plano | `Conta seus dados e nosso time te explica tudo sobre o {nome} no WhatsApp.` | |
| Sub sem plano | `Conta seus dados e nosso time te atende no WhatsApp em minutos.` | |
| Label Nome | `Nome` | |
| Placeholder Nome | `Seu nome` | |
| Label WhatsApp | `WhatsApp` | |
| Placeholder WhatsApp | `(00) 00000-0000` | |
| Label Email | `Email (opcional)` | |
| Placeholder Email | `seu@email.com` | |
| **Botão submit** | `Continuar no WhatsApp 🐾` | |
| Loading state | `Enviando…` | |
| Trust microcopy | `🔒 Seus dados ficam protegidos · Só te chamamos sobre o plano` | |

---

## SPRINT 3 — Funil Quiz {#sprint-3}

### 3.1 — As 8 perguntas do quiz (`config/quiz.json`)

| # | Pergunta atual | Emoji | Opções | Sugestão Pedro/Jofi |
|---|---------------|-------|--------|---------------------|
| Q1 | `Você tem pet?` (eliminatória) | 🐾 | `Sim, tenho!` / `Ainda não tenho` | |
| Q2 | `Qual a espécie do seu pequeno?` | 🐶 | `Cão 🐶` / `Gato 🐱` / `Outro 🐾` | |
| Q3 | `Qual a idade do seu pet?` | 🎂 | `Filhote (até 1 ano) 🐣` / `Adulto (1-7 anos) 🐕` / `Idoso (7+ anos) 👴` | |
| Q4 | `Quando foi a última ida ao vet?` | 🩺 | `Há menos de 1 mês` / `De 1 a 6 meses` / `Mais de 6 meses` / `Nunca levei` | |
| Q5 | `Quanto você gasta por mês com seu pet hoje?` | 💰 | Slider R$ 0-500 | |
| Q6 | `O que mais te preocupa hoje?` | 💭 | `Saúde e imprevistos 🩺` / `Custo das consultas 💰` / `Rotina de cuidado 📅` / `Está tudo ok ✨` | |
| Q7 | `Você tem plano pet hoje?` | 📋 | `Não tenho` / `Tenho de outra empresa` / `Já sou cliente Jofi` | |
| Q8 | `Qual seu CEP? (pra ver vets perto)` | 📍 | text input opcional | |

### 3.2 — Captura

#### 3.2.1 — Header captura (`captura-client.tsx`)
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji header | 🎉 | |
| **Headline H1** | `Quase lá!` | |
| Link rodapé | `← Revisar minhas respostas` | |

#### 3.2.2 — TierPreview (`src/components/capture/TierPreview.tsx`)
**3 variantes por tier:**

| Tier | Emoji | Kicker | Headline | Subhead | Bullet | Sugestão Pedro/Jofi |
|------|:--:|--------|----------|---------|--------|---------------------|
| 🔥 Quente | 🔥 | `Você é um tutor protetor` | `Plano Parceiro` | `Proteção completa pro seu companheiro de toda hora.` | `Internação 24h + cirurgias + especialistas inclusos` | |
| 🌻 Morno | 🌻 | `Você é um tutor consciente` | `Plano Sereno` | `Cuidado preventivo pra ter tranquilidade no dia a dia.` | `Vacinação completa + consultas 24h + exames laboratoriais` | |
| 💙 Frio | 💙 | `Você é um tutor cuidadoso` | `Plano Sereninho` | `O essencial pra começar a cuidar do seu pet com carinho.` | `Consultas + vacinas essenciais + exames iniciais` | |

Microcopy footer (todos os tiers):
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| `Conta seus dados e nosso time te atende no WhatsApp 🐾` | |

#### 3.2.3 — Form captura (`CaptureForm.tsx`)
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Label Nome | `Como podemos te chamar?` | |
| Placeholder Nome | `Seu nome` | |
| Label WhatsApp | `WhatsApp` | |
| Placeholder WhatsApp | `(00) 00000-0000` | |
| Label Email | `Email (opcional)` | |
| Placeholder Email | `seu@email.com` | |
| **Botão (com WhatsApp setado)** | `Falar com nosso time no WhatsApp 🐾` | |
| Botão (fallback sem WA) | `Ver meu plano ideal →` | |
| Loading state | `Liberando seu plano…` | |
| Trust microcopy | `🔒 Seus dados ficam protegidos · Só te chamamos sobre o resultado` | |
| Error fallback | `Algo deu errado. Tenta de novo?` | |

#### 3.2.4 — Overlay redirect (`CaptureForm.tsx`)
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji animado | 🐾 | |
| Headline (com nome) | `Ótimo, {primeiroNome}! Te conectando com nosso time…` | |
| Headline (sem nome) | `Ótimo! Te conectando com nosso time…` | |
| Subhead | `O WhatsApp vai abrir em segundos. Pode deixar — já vai com seu perfil do quiz preenchido 💛` | |
| Fallback microcopy | `Não abriu? Verifique se o WhatsApp está instalado.` | |

#### 3.2.5 — LGPD Consent (`LgpdConsent.tsx`)
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| `Concordo em receber contato da Jofi sobre o resultado do quiz e ofertas relacionadas. Posso cancelar quando quiser.` | |
| Link | `Política de privacidade` (vai pra `/privacidade`) | |

### 3.3 — Result Pages (legacy fallback — quase não usados desde redirect WhatsApp direto)

#### 3.3.1 — Headlines/Subheads por tier (`src/lib/quiz/result-template.ts`)
| Tier | Headline | Subhead (com `{vars}`) | Sugestão |
|------|----------|------------------------|----------|
| 🔥 quente | `Seu pet precisa do plano completo` | `{primeiroNome}, seu {especie} {idade} se beneficia do Parceiro Jofi — cobertura ampla pra {preocupacao}.` | |
| 🌻 morno | `Comece com o Sereninho` | `{primeiroNome}, o Sereno cobre {preocupacao} com tranquilidade e cabe no bolso.` | |
| 💙 frio | `Toma um café com a gente` | `{primeiroNome}, montamos conteúdo pra você cuidar melhor do seu {especie} 🐾` | |

#### 3.3.2 — Bullets dinâmicos por tier
| Tier | Bullet 1 | Bullet 2 (com `{idade}` ou `{gastoMensal}`) | Bullet 3 | Sugestão |
|------|----------|---------------------------------------------|----------|----------|
| 🔥 quente | `Internação 24h + cirurgias + especialistas inclusos` | `Cobertura imediata pro seu pet {idade}, com carências reduzidas no plano anual` | `Sem coparticipação — você paga só a mensalidade` | |
| 🌻 morno | `Vacinação completa + consultas 24h + exames laboratoriais` | `A partir de R$ 79,90/mês — mais barato que sua despesa de {gastoMensal}` | `Cobertura sem coparticipação na rede Jofi` | |
| 💙 frio | `Conteúdo sobre vacinação, alimentação e check-ups essenciais` | `Quando quiser, conheça os planos a partir de R$ 49,90` | `Sem spam — só dicas úteis pro seu {especie}` | |

#### 3.3.3 — Components do Result (CTAs, Cards)

**AttendantCard:**
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| `Time Jofi` | |
| `Especialistas pet · responde em minutos` | |
| Avatar | Ícone PawPrint | |

**WhatsappCta:**
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| `Falar com nosso time no WhatsApp 🐾` | |
| Após click | `Te esperamos na conversa 🐾` | |
| Sem número | `WhatsApp em configuração — em breve te conectamos com a Jofi.` | |

**WhatsappAutoRedirect (banner verde):**
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| Emoji header | 👋 | |
| Headline | `Nosso time tá te esperando no WhatsApp` | |
| Subhead | `Te conectando em **{X}s** — você pode cancelar a qualquer momento.` | |
| Botão principal | `Falar agora →` | |
| Botão cancelar | `Cancelar` | |

**SaveForLaterCta:**
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| Texto | `Salvar resultado pra depois →` | |
| Após clique | `Resultado enviado ✓` | |

**NewsletterCta:**
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| Label default | `Receber dicas por email` | |
| Label ResultWarm | `Ou receba dicas por email` | |
| Label ResultHot | `Ou prefere receber uma proposta por email?` | |
| Label ResultCold | `Receber o guia completo da Jofi` | |
| Label Obrigado-sem-pet | `Receber dicas pra quando tiver um pet` | |
| Button | `Enviar` | |
| Loading | `...` | |
| Success | `Pronto! Em breve você recebe nossas dicas 🐾` | |
| Error | `Algo deu errado. Tenta de novo?` | |

**SereninhoCta:**
| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| Botão | `Conhecer o Sereninho · R$ 49,90 →` | |
| Sem URL | `Checkout em configuração — em breve.` | |

**ResultHot:**
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji | 🔥 | |
| Kicker | `Perfil quente` | |
| Border-top section | `Quer tirar dúvidas sobre o plano sem compromisso?` (ResultCold) | |

**ResultWarm:**
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji | 🌻 | |
| Kicker | `Perfil morno` | |

**ResultCold:**
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji | 💙 | |
| Kicker | `Perfil informativo` | |

### 3.4 — Obrigado Sem Pet (`obrigado-sem-pet/page.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji | 🌟 | |
| **Headline H1** | `Poxa, a Jofi é pra quem tem pet. 🐾` | |
| Subhead | `Mas quem sabe você não conhece alguém que curtiria saber disso?` | |
| Botão Share | `Compartilhar com um amigo 💛` | |
| Texto share | `Descobri um quiz que me ajudaria a escolher um plano pet — dá uma olhada!` | |
| Link voltar | `Voltar ao início` | |
| Divider text | `Pensa em ter um pet em breve? A gente te avisa quando estiver pronto 🐾` | |

---

## SPRINT 4 — LP /oferta Body {#sprint-4}

### 4.1 — Problem (`src/components/oferta/Problem.tsx`)

Section header:
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Kicker | `Você já passou por isso?` | |
| Headline | `Cuidar de pet sem plano` `**é estressante e caro.**` | |
| Closing | `A Jofi existe pra você nunca mais passar por isso. **Plano completo** a partir de **R$ 49,90/mês**.` | |

Os 3 cards:
| # | Ícone | Title | Body | Sugestão Pedro/Jofi |
|---|:--:|-------|------|---------------------|
| C1 | AlertCircle | `Pet com problema fora de hora` | `Madrugada, fim de semana, emergência — vet de plantão cobra fortuna e nem sempre tá disponível.` | |
| C2 | Wallet | `Conta de vet inesperada` | `Aquela consulta de rotina vira R$ 1.500 quando o vet pede 3 exames. Vacina sozinha já passa de R$ 200.` | |
| C3 | Clock | `Esperar pra resolver` | `Sem plano, você adia. E o pet sofre. Quando vai ao vet, o problema cresceu — custa mais e dói mais.` | |

### 4.2 — Solution (`src/components/oferta/Solution.tsx`)

Section header:
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Kicker | `A solução Jofi` | |
| Headline | `Tudo que seu pet precisa,` `**cabendo no seu bolso.**` | |

Os 3 benefícios:
| # | Ícone | Title | Body | Sugestão Pedro/Jofi |
|---|:--:|-------|------|---------------------|
| B1 | ShieldCheck | `Cobertura ampla, zero pegadinha` | `Consultas, vacinação, exames, emergências e cirurgias. Sem coparticipação, sem limite escondido.` | |
| B2 | MessageCircle | `Atendimento humano 24h` | `Nosso time tira suas dúvidas no WhatsApp, qualquer hora. Sem chatbot, sem URA.` | |
| B3 | Stethoscope | `Rede credenciada de confiança` | `Vets parceiros selecionados pela Jofi. Você não precisa ficar caçando profissional bom — já indicamos.` | |

### 4.3 — VideoSection (`VideoSection.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Kicker | `Conheça a Jofi` | |
| Headline | `Veja em 30 segundos` | |
| Botão play (com vídeo) | `Conhecer a Jofi (30s)` | |
| Placeholder (sem vídeo) | `Vídeo institucional em breve 🐾` | |
| Microcopy placeholder | `Placeholder · Vídeo institucional a ser disponibilizado pela equipe Jofi` | |

### 4.4 — PlanComparison header (`PlanComparison.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Kicker | `Planos Jofi` | |
| Headline | `Escolha o ideal pro` `**seu pequeno.**` | |
| Subhead | `Todos os planos incluem orientação 24h via WhatsApp e cobertura nacional na rede Jofi. Sem fidelidade, sem letra miúda.` | |
| Badge popular | `⭐ Mais escolhido` | |
| Botão card | `Quero o {nome do plano} →` | |
| Aviso final | `⚠️ Valores e coberturas sujeitos a confirmação Jofi antes da contratação.` | |
| Microcopy plan card | `Carência: {X} dias · sem fidelidade` | |

### 4.5 — MidCta (`MidCta.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| **Headline** | `Não sabe qual plano escolher?` | |
| Subhead | `Nosso time te ajuda em 5 minutos. Sem compromisso, sem venda agressiva — só uma conversa pra entender o que faz sentido pro seu pet.` | |
| **Botão** | `Conversar com nosso time agora 🐾` | |
| Trust microcopy | `Resposta em minutos · Atendimento 24h` | |

### 4.6 — Guarantee (`Guarantee.tsx`)

Os 3 trust signals:
| # | Title | Body | Sugestão Pedro/Jofi |
|---|-------|------|---------------------|
| S1 | `30 dias pra cancelar` | `Sem multa, sem letra miúda. Testou e não rolou? É só avisar.` | |
| S2 | `+500 tutores Jofi` | `Comunidade ativa que cuida do pet com a gente desde 2024.` | |
| S3 | `LGPD compliant` | `Seus dados ficam protegidos. Nunca compartilhamos com terceiros.` | |

### 4.7 — FinalCta (`FinalCta.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji | 🐾 | |
| **Headline** | `Pronto pra cuidar` `**do jeito certo?**` (segunda linha accent laranja) | |
| Subhead | `Nosso time tá esperando você no WhatsApp pra explicar tudo e ajudar a escolher o plano ideal pro seu pet. Sem compromisso. 💛` | |
| **Botão** | `Falar com nosso time agora 🐾` | |
| Trust microcopy | `Atendimento humano · Resposta em minutos · Sem fidelidade` | |

### 4.8 — Footer + Sticky

**Footer (`Footer.tsx`):**
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Tagline | `Planos de saúde pet com atendimento humano. Cuidar é amar.` | |
| Link 1 | `Fazer o quiz` | |
| Link 2 | `Site institucional` | |
| Link 3 | `Política de privacidade` | |
| Legal 1 | `© {ano} Jofi Pet · Plano de saúde pet · **CNPJ a confirmar**` | |
| Legal 2 | `Esta página é uma oferta promocional. Valores e coberturas estão sujeitos à aprovação e confirmação Jofi.` | |

**StickyWhatsapp:**
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Botão | `Falar agora` | |
| Aria-label | `Falar com nosso time no WhatsApp` | |

---

## SPRINT 5 — Mensagens WhatsApp {#sprint-5}

Localização: `src/lib/tracking/whatsapp.ts` — `buildWhatsappMessage()`.

⚠️ **Estas são as mensagens que o tutor envia pro time Jofi ao clicar nos CTAs.** Importante porque é a **primeira interação** que o time vê quando abre a conversa.

### 5.1 — Variante 1: Lead vem da LP /oferta clicando num plano

Template:
```
Oi, Jofi! Aqui é {nome} 🐾
Vi o **Plano {nome do plano}** ({preço}) na página de ofertas
e quero saber mais sobre essa cobertura.
Pode me explicar como funciona? 💛
```

| Linha | Sugestão Pedro/Jofi |
|-------|---------------------|
| Greeting | |
| Linha 2 | |
| Linha 3 | |
| CTA fechamento | |

### 5.2 — Variante 2: Lead vem do quiz com tier definido

3 tons por tier:

**Comum a todos:**
```
Oi, Jofi! Aqui é {nome} 🐾

Fiz o quiz no site e meu {especie} {idade} foi avaliado.
Gasto hoje cerca de R$ {gasto}/mês com ele.
Última visita ao vet: {ultima_vet_label}.
```

**Closing por tier:**
| Tier | Closing atual | Sugestão Pedro/Jofi |
|------|---------------|---------------------|
| 🔥 Quente | `O resultado indicou o Plano Parceiro (a partir de R$ 169,90). Queria entender melhor pra ativar logo! 💛` | |
| 🌻 Morno | `O resultado indicou o Plano Sereno (a partir de R$ 79,90). Posso saber mais como funciona? 💛` | |
| 💙 Frio | `O resultado indicou o Plano Sereninho (a partir de R$ 49,90). Gostaria de tirar algumas dúvidas. 💛` | |

### 5.3 — Variante 3: Fallback genérico (sem tier, sem plano)

```
Oi, Jofi! 🐾
Vi a Jofi no site e quero saber mais sobre os planos.
Pode me ajudar? 💛
```

| Linha | Sugestão Pedro/Jofi |
|-------|---------------------|
| Greeting | |
| Linha 2 | |
| CTA fechamento | |

### 5.4 — Mensagem do SaveForLaterCta

Template:
```
Oi {primeiroNome}! Aqui está o resultado do seu quiz Jofi 🐾

Seu perfil: {TIER_UPPERCASE}

Quando estiver pronto, é só responder essa mensagem 💛
```

| Linha | Sugestão Pedro/Jofi |
|-------|---------------------|
| Greeting | |
| Resumo perfil | |
| CTA fechamento | |

---

## SPRINT 6 — Refinamentos {#sprint-6}

### 6.1 — Quiz helpers (`QuizQuestionHelper.tsx`)

Aparece em CEP e gasto-mensal. Botão expansível.

| Pergunta | Helper text | Sugestão Pedro/Jofi |
|----------|------------|---------------------|
| cep | `A gente usa o CEP só pra mostrar vets parceiros perto de você. Não é obrigatório — pode pular se preferir.` | |
| gasto-mensal | `Saber seu gasto atual ajuda a recomendar um plano que cabe no seu orçamento. Não compartilhamos com ninguém.` | |
| Botão expansão | `Por que perguntamos isso?` | |

### 6.2 — Social proof badges

**HomeSocialProof (na LP `/`):**
| Loading | Placeholder | Sugestão Pedro/Jofi |
|---------|-------------|---------------------|
| `Comunidade Jofi 🐾` | `🐾 +{X} tutores fizeram o quiz hoje` | |

**SocialProofBadge (dentro do quiz):**
| Texto | Sugestão Pedro/Jofi |
|-------|---------------------|
| `{X} tutores fizeram o quiz hoje` | |

### 6.3 — ResumeQuizBanner

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Emoji | 👋 | |
| **Headline** | `Você começou um quiz` | |
| Subhead | `{X} de {Y} respondidas · Continuar →` | |
| Aria-label | `Continuar quiz iniciado` | |
| Botão X aria-label | `Fechar aviso` | |

### 6.4 — Quiz Progress copy (`QuizStep.tsx`)

Encouragement dinâmico:
| Step range | Copy atual | Sugestão Pedro/Jofi |
|-----------|-----------|---------------------|
| Step 1 | `Vamos lá!` | |
| Step 25-50% | `Boa, continua` | |
| Step 50-75% | `Você está indo bem` | |
| Step 75-99% | `Quase lá!` | |
| Step última | `Última! 🎉` | |
| Step 0-25% | `Começando` | |
| Subhead progress | `Pergunta {X} de {Y}` | |

### 6.5 — Quiz Scale (`QuizScaleInput.tsx`)

| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Hint (antes de tocar) | `👆 Arraste pra ajustar o valor` | |

### 6.6 — Quiz Text Input (placeholder genérico)

CEP question:
| Elemento | Copy atual | Sugestão Pedro/Jofi |
|----------|-----------|---------------------|
| Placeholder | `00000-000` | |
| Botão skip | `Pular essa pergunta` | |

### 6.7 — Botão "Próxima" (Multi/Scale/Text)

| Copy atual | Sugestão Pedro/Jofi |
|-----------|---------------------|
| `Próxima →` | |

---

## SPRINT 7 — SEO Metadata {#sprint-7}

### 7.1 — LP `/` (`src/app/layout.tsx`)

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| Title default | `Jofi Pet Quiz — Descubra o plano ideal pro seu pet` | |
| Title template | `%s · Jofi Pet` | |
| Description | `Em ~90 segundos, descubra qual plano de saúde pet ideal pro seu pequeno. Quiz personalizado da Jofi com recomendação na hora 🐾` | |
| Keywords | `plano de saúde pet, plano pet, jofi, jofi pet, pet care, seguro pet, plano veterinário, saúde do pet, cuidados pet` | |
| OG title | `Jofi Pet Quiz — Descubra o plano ideal pro seu pet` | |
| OG description | `Em ~90 segundos, descubra qual plano de saúde pet é ideal pro seu pequeno 🐾` | |
| Twitter title | `Jofi Pet Quiz — Descubra o plano ideal pro seu pet` | |
| Twitter description | `Em ~90 segundos, descubra qual plano de saúde pet é ideal pro seu pequeno 🐾` | |

### 7.2 — LP `/oferta` (`src/app/oferta/page.tsx`)

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| Title | `Plano de saúde pet a partir de R$ 49,90/mês` (vira `... · Jofi Pet`) | |
| Description | `Cuidado completo pro seu pet: consultas, vacinas, exames, emergências e cirurgias. Atendimento humano 24h via WhatsApp. Sem fidelidade. Comece hoje 🐾` | |
| OG title | `Jofi Pet — Planos a partir de R$ 49,90/mês` | |
| OG description | `Cuidado completo + atendimento humano 24h via WhatsApp. Sem fidelidade. 🐾` | |
| Twitter title | `Jofi Pet — Planos a partir de R$ 49,90/mês` | |
| Twitter description | `Cuidado completo + atendimento humano 24h. Sem fidelidade.` | |

### 7.3 — Pages internas (noindex)

| Path | Title atual | Sugestão Pedro/Jofi |
|------|-------------|---------------------|
| `/captura` | `Quase lá!` (vira `Quase lá! · Jofi Pet`) | |
| `/resultado/[tier]` | `Seu resultado` (vira `Seu resultado · Jofi Pet`) | |
| `/obrigado-sem-pet` | `Obrigada` (vira `Obrigada · Jofi Pet`) | |

### 7.4 — OG Images (programáticas)

**OG Image LP `/`:**
| Layer | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| Kicker | `Plano de saúde pet` | |
| Logo | `JOFI` (gigante) | |
| Headline | `Cuidar hoje.` `Proteger sempre.` (linha 2 amarelo) | |
| Badge bottom | `🐾 Descubra seu plano ideal em ~90s` | |

**OG Image LP `/oferta`:**
| Layer | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| Kicker | `Plano de saúde pet` | |
| Logo | `JOFI` (gigante) | |
| Headline | `A partir de` `R$ 49,90/mês` (linha 2 gigante) | |
| Badge bottom | `🐾 Atendimento humano 24h · Sem fidelidade` | |

### 7.5 — JSON-LD Schema.org

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| Organization name | `Jofi Pet` | |
| Organization description | `Planos de saúde pet acessíveis para tutores que cuidam de seus pequenos com carinho.` | |
| Organization sameAs | `https://www.instagram.com/jofi.pet/` | |
| WebSite name | `Jofi Pet Quiz` | |
| WebSite description | `Quiz interativo Jofi pra descobrir o plano de saúde pet ideal em ~90 segundos.` | |

### 7.6 — Manifest PWA

| Campo | Copy atual | Sugestão Pedro/Jofi |
|-------|-----------|---------------------|
| name | `Jofi Pet Quiz` | |
| short_name | `Jofi Quiz` | |
| description | `Descubra qual plano de saúde pet é ideal pro seu pequeno em ~90 segundos.` | |

---

## 📊 Estatísticas

- **Sprint 1:** 5 áreas (Planos + Testemunhos + FAQ) · ~75 strings críticas
- **Sprint 2:** 3 áreas (Hero + Hero /oferta + Modal) · ~25 strings
- **Sprint 3:** Funil quiz completo · ~100 strings
- **Sprint 4:** LP /oferta body · ~50 strings
- **Sprint 5:** Mensagens WhatsApp · ~15 strings (mas crítica)
- **Sprint 6:** Refinamentos · ~20 strings
- **Sprint 7:** SEO + Metadata · ~40 strings

**Total: ~325 strings de copy** em 18 áreas distintas.

---

## 🎯 Como prosseguir

1. **Revisão offline:** abre esse arquivo, anota mudanças na coluna "Sugestão Pedro/Jofi" de cada tabela
2. **Compartilhar com Nicole/equipe:** esse doc é o ponto único de verdade pra revisão de copy
3. **Manda pra mim:** quando terminar (ou parcial — pode mandar 1 sprint por vez), eu aplico todas as mudanças em batch nos arquivos certos
4. **Validação:** após aplicar, eu rodo `tsc + vitest + build` e commito com mensagem específica de "copy review"

**Quer começar pela revisão inline aqui no chat?** Manda: `revisar sprint 1` (ou qualquer outro). Eu apresento a copy específica e você muda direto.
