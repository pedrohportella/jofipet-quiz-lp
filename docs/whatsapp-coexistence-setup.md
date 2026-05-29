# WhatsApp Cloud API + Coexistência — Setup operacional

**Audiência:** Pedro Portella (gestor) + futuro time DC com acesso ao Business Manager da Jofi.
**Pré-leitura obrigatória:** [docs/architecture.md](architecture.md) seção CRM (Epic 5).

Esta é a configuração **manual** (no painel da Meta, não-código) que precisa rodar **uma vez** antes do CRM ficar 100% funcional. O setup leva ~2-4 horas se a Business Verification já estiver feita; ~1-2 semanas se ainda não.

---

## O que é "Coexistência"

Feature oficial da Meta Cloud API anunciada em 2024. Antes dela, ao migrar um número pra Cloud API, o app WhatsApp Business no celular **parava de funcionar** — todas as mensagens só chegavam via webhook. Quem queria responder pelo celular tinha que escolher: API **ou** app.

Com coexistência, o **mesmo número** funciona em ambos simultaneamente:
- Mensagens recebidas chegam **no app E no webhook**.
- Mensagens enviadas pela API aparecem na thread do app (com ✓✓).
- Mensagens enviadas pelo app **NÃO** aparecem no webhook por padrão — mas a Meta tem flag opcional pra também enviar.
- Sincronização de read receipts em ambos os lados.

**Por que importa pra Jofi:** o número da Jofi já é usado pra suporte/vendas no celular. A operadora não pode "perder" o app. Coexistência permite que o CRM novo só atue em cima dos leads do quiz (disparo automático + acompanhamento) sem tirar nada do que já existe.

---

## Pré-requisitos

Antes de qualquer coisa, confirmar **todos** os itens abaixo. Sem eles, o setup trava em alguma etapa.

- [ ] **Acesso ao Meta Business Manager da Jofi** (não o da DC). Pedro deve estar como Admin.
- [ ] **Business Verification** aprovada (Business Settings → Business Info → Verification status = "Verified"). Sem isso, não consegue gerar System User token permanente.
- [ ] **WhatsApp Business Account (WABA)** existente no Business Manager. Se não existir, criar em Business Settings → Accounts → WhatsApp Accounts → Add.
- [ ] **Número da Jofi** (`+55 800 777 9745`) já registrado no WABA. Confirmar em WhatsApp Manager → Phone numbers.
- [ ] **App WhatsApp Business** instalado no celular da operadora, com chat business já configurado (foto, descrição, horário, catálogo).
- [ ] **Cartão de crédito da Jofi** registrado no Billing do Business (mesmo que use free tier — Meta exige).

---

## Etapa 1 — Criar Meta App (uma vez)

1. Ir em https://developers.facebook.com/apps
2. Create App → Type: **Business** → Next
3. Display name: `Jofi CRM Production` (ou similar). Business Account: selecionar Jofi.
4. App criado → Settings → Basic → copiar **App ID** e revelar **App Secret**.
5. Em "Add products to your app" → adicionar **WhatsApp**. Vai abrir o painel da Cloud API.
6. No painel WhatsApp → API Setup → selecionar o WABA da Jofi + o número da Jofi.

### Variáveis a coletar nesta etapa

| Variável | Onde encontrar |
|---|---|
| `META_APP_SECRET` | App → Settings → Basic → App Secret (revelar e copiar) |
| `META_WABA_ID` | WhatsApp → API Setup → WhatsApp Business Account ID |
| `META_PHONE_NUMBER_ID` | WhatsApp → API Setup → From → escolher número Jofi → Phone number ID |

---

## Etapa 2 — System User Token PERMANENTE

User tokens (gerados pelo seu login pessoal) expiram em 60 dias. Pra produção, precisa System User com token permanente.

1. Business Settings → Users → **System Users** → Add.
2. Nome: `jofi-crm-bot`. Role: **Admin** (ou Employee se quiser limitar).
3. Após criar, clicar em "Add Assets" → WhatsApp Accounts → selecionar o WABA da Jofi → permissões **Full control**.
4. Voltar ao System User → "Generate New Token":
   - Escolher o App criado na Etapa 1
   - Token expiration: **Never**
   - Permissions: marcar `whatsapp_business_management` + `whatsapp_business_messaging`
5. Copiar o token gerado (Meta só mostra **uma vez**).

### Variável a coletar nesta etapa

| Variável | Valor |
|---|---|
| `META_ACCESS_TOKEN_PERMANENT` | Token do System User (NUNCA mais aparece — guardar no 1Password/Vault e no `.env` da Vercel) |

---

## Etapa 3 — Webhook (handshake + assinatura)

A Meta precisa de uma URL pública que responda ao webhook. Em produção a URL é `https://{NEXT_PUBLIC_SITE_URL}/api/whatsapp/webhook`.

1. Em https://developers.facebook.com/apps/{APP_ID}/webhooks → WhatsApp → Subscribe.
2. Callback URL: `https://{NEXT_PUBLIC_SITE_URL}/api/whatsapp/webhook`
3. Verify Token: cole o valor de `META_WEBHOOK_VERIFY_TOKEN` (gerar antes com `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`).
4. Clicar **Verify and Save**. Se a Vercel responde 200 com o `hub.challenge` ecoado, fica verde.
5. Em "Subscribed Fields" pra WABA, marcar:
   - `messages` (inbound + delivery statuses)
   - `message_template_status_update` (aprovações HSM)

### Variável a coletar nesta etapa

| Variável | Valor |
|---|---|
| `META_WEBHOOK_VERIFY_TOKEN` | O valor que você gerou e colou no painel (≥32 hex chars) |

### Testar localmente (antes de ir pra Vercel)

Pra desenvolver sem deploy, usar túnel:

```bash
# Em um terminal:
npx ngrok http 3000

# Anota a URL https://abc123.ngrok.app
# No painel Meta, troca temporariamente Callback URL pra https://abc123.ngrok.app/api/whatsapp/webhook
# Em outro terminal:
npm run dev
```

Quando confirmar que recebe os eventos no log local, troca a URL de volta pra produção.

---

## Etapa 4 — Habilitar Coexistência

**Importante:** essa etapa só está disponível pra WABAs com **Cloud API** (não On-Premises) e Business **Verified**.

1. Business Suite → WhatsApp Manager (https://business.facebook.com/wa/manage/).
2. Selecionar a conta Jofi.
3. **Settings** → procurar seção **Coexistence** (alguns idiomas exibe como "Account migration" ou "Phone number sharing").
4. Selecionar o número da Jofi → **Enable coexistence**.
5. A Meta vai gerar uma **Coexistence Key** de 6 dígitos + QR code.
6. **No celular da operadora Jofi**:
   - Abrir app **WhatsApp Business**
   - Configurações → Conta → **API** (ou "WhatsApp Business API" — pode variar com versão)
   - **Vincular conta API** → escanear o QR code OU digitar a Coexistence Key
7. Aguardar sincronização (5-15 min). Aparece um banner no app: "Esta conta agora está vinculada à WhatsApp Business Platform".

Depois disso:
- App continua recebendo todas as mensagens normais.
- API também recebe (via webhook configurado na Etapa 3).
- Pode mandar mensagem por qualquer lado.

### Validação pós-habilitação

Mande do seu celular pessoal uma mensagem pro número da Jofi. Em <5 segundos:
1. **No app da operadora**: aparece a nova mensagem normalmente.
2. **No log da Vercel** (`vercel logs --follow`): `wa_webhook event=inbound_message_inserted`.
3. **No Supabase**: `select * from crm_messages order by received_at desc limit 1` mostra a row.

Se 1 ✅ e 2,3 ❌: webhook não foi configurado direito (volta Etapa 3).
Se 1 ❌ e 2,3 ✅: app foi desvinculado (volta Etapa 4 passo 6).
Se 1,2,3 ✅: coexistência funcionando.

---

## Etapa 5 — Templates HSM (boas-vindas pós-quiz)

O CRM dispara mensagem inicial automática por tier. A Meta **EXIGE** que essa primeira mensagem seja um template aprovado (Highly Structured Message).

### Criar os 3 templates

WhatsApp Manager → Message Templates → Create. Configurar:

#### `jofi_boasvindas_quente`
- **Category:** MARKETING
- **Language:** Portuguese (BR)
- **Header:** (nenhum, ou imagem do mascote)
- **Body:**
  ```
  Oi, {{1}}! 🐾 Aqui é da Jofi. Vimos que seu pet merece um cuidado mais completo e o Sereninho é exatamente isso. Posso te chamar agora pra te contar como funciona?
  ```
- **Footer:** `Jofi Saúde Pet`
- **Buttons:** (opcional) Quick reply "Quero saber" + "Talvez depois"
- **Sample value pra {{1}}:** `Pedro`

#### `jofi_boasvindas_morno`
- **Category:** MARKETING
- **Body:**
  ```
  Oi, {{1}}! 🐾 Aqui é da Jofi. Pelas suas respostas, parece que seu pet tá num momento bom — e a gente quer ajudar a manter assim. Conta pra mim: o que mais te preocupa hoje?
  ```

#### `jofi_boasvindas_frio`
- **Category:** UTILITY
- **Body:**
  ```
  Oi, {{1}}! Aqui é da Jofi 🐾 Obrigado por responder o quiz. Vou ficar por aqui caso queira saber mais sobre cuidados pro seu pet — é só chamar.
  ```

### Submeter e aguardar aprovação

- Cada template entra como `PENDING`. Meta revisa em 24–48h (raramente até 5 dias).
- Quando aprovado: webhook `message_template_status_update` chega com `APPROVED` → CRM atualiza `crm_templates.status` automaticamente.
- Se rejeitado: razão chega no mesmo webhook. Causas comuns:
  - Promessa explícita ("Cancela a qualquer momento") em template MARKETING → mover pra UTILITY ou suavizar.
  - Saudação genérica demais ("Oi! Tudo bem?") → recusa por falta de propósito.
  - Variável `{{1}}` sem sample value.

### Habilitar disparo automático

Quando os 3 templates estiverem aprovados, setar na Vercel:

```
CRM_AUTO_HSM_ENABLED=true
```

Redeploy. A partir daí, todo lead novo capturado pelo quiz recebe o template do seu tier automaticamente.

---

## Etapa 6 — Configurar variáveis na Vercel

Production env vars (Settings → Environment Variables):

```
META_WABA_ID=<da Etapa 1>
META_PHONE_NUMBER_ID=<da Etapa 1>
META_APP_SECRET=<da Etapa 1>
META_ACCESS_TOKEN_PERMANENT=<da Etapa 2>
META_WEBHOOK_VERIFY_TOKEN=<da Etapa 3>
CRM_AUTO_HSM_ENABLED=false  # ligar quando templates aprovados
SUPABASE_URL=<projeto Supabase>
SUPABASE_SERVICE_ROLE_KEY=<service_role do Supabase>
NEXT_PUBLIC_SUPABASE_URL=<mesmo URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon do Supabase>
```

Redeploy.

---

## Limites e custos

| Item | Valor |
|---|---|
| Conversas marketing iniciadas em <24h | **R$0,05–0,38** cada (depende da categoria) |
| Conversa iniciada pelo usuário (free entry) | **Grátis** nas primeiras 24h |
| 1000 conversas marketing/mês | **Grátis** (free tier Cloud API) |
| Templates HSM | **Grátis** (sem limite de criação) |
| Limite de envio padrão (Tier 1) | 1000 destinatários únicos / 24h |
| Upgrade pra Tier 2 (10k/dia) | Automático após 7 dias com bom rating |

Com <500 leads/mês previstos, fica **sempre dentro do free tier**. Mesmo que a operação 10x, custo é <R$200/mês.

---

## Troubleshooting

### "Webhook returns 401 invalid_signature"
- App Secret diferente entre Meta painel e env var. Re-revelar no painel → atualizar Vercel.
- Algum middleware está re-serializando o body antes do handler. Confirmar que `request.text()` é chamado direto.

### "Mensagens enviadas via API não chegam pro cliente"
- Cliente fora da janela 24h + você está mandando texto livre. Solução: usar `sendTemplate`.
- Número está marcado como spam (cliente reportou). Conferir em WhatsApp Manager → Quality.

### "App desvinculou sozinho da API"
- Coexistência exige permanente vínculo. Se a operadora deslogou/reinstalou o app, refazer Etapa 4 passo 6.

### "Mensagens enviadas PELO APP não aparecem no webhook"
- Comportamento padrão. Pra mudar, em WhatsApp Manager → Coexistence settings → "Forward all messages to webhook" (feature em rollout, pode não estar disponível ainda).

### "Templates ficam PENDING por mais de 5 dias"
- Abrir support case em Business Help Center. Geralmente é fila.

---

## Quem é responsável por quê

| Tarefa | Responsável |
|---|---|
| Business Verification | Cliente (Jofi) — fornece docs CNPJ |
| Criar Meta App + System User | Pedro (DC) |
| Coexistência no celular | Operadora Jofi (presencial, com QR code) |
| Templates HSM (escrever copy) | Pedro (DC) |
| Submeter templates pra aprovação | Pedro (DC) |
| Resposta operacional no WhatsApp | Operadora Jofi via app **ou** Pedro via /admin/crm/inbox |

---

## Referências

- Cloud API docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Coexistence announcement: https://developers.facebook.com/docs/whatsapp/cloud-api/migrate-from-on-premises/coexistence
- Webhook reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- Template policy: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- Pricing: https://developers.facebook.com/docs/whatsapp/pricing
