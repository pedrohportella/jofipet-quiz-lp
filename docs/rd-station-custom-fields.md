# RD Station — Custom Fields do Jofi Quiz

**Status:** Pedro vai criar os 8 campos no painel RD da Jofi antes do go-live (resposta da open question #2 em 2026-05-12).

**Onde criar:** Painel RD Station Marketing > **Configurações > Campos personalizados de contato > Novo campo**.

**Convenção:** O RD prefixa automaticamente custom fields com `cf_` no payload da API. Os identificadores abaixo são os **API identifiers** (slug), não os labels visíveis ao usuário.

---

## Os 8 campos a criar

| API identifier | Label visível (sugestão) | Tipo | Valores aceitos / exemplos | Onde aparece no quiz |
|---|---|---|---|---|
| `cf_quiz_tier` | Quiz — Tier do lead | Texto | `quente`, `morno`, `frio` | Score final calculado |
| `cf_quiz_score` | Quiz — Score numérico | Número | `0` a `10` (decimal) | Score final calculado |
| `cf_pet_especie` | Pet — Espécie | Texto | `cao`, `gato`, `outro` | Pergunta 2 |
| `cf_pet_idade` | Pet — Faixa etária | Texto | `filhote`, `adulto`, `idoso` | Pergunta 3 |
| `cf_pet_ultima_vet` | Pet — Última ida ao vet | Texto | `menos-1-mes`, `1-6-meses`, `mais-6-meses`, `nunca` | Pergunta 4 |
| `cf_gasto_mensal` | Pet — Gasto mensal (R$) | Número | `0` a `500` | Pergunta 5 |
| `cf_plano_atual` | Pet — Plano atual | Texto | `nao`, `sim-outro`, `sim-jofi` | Pergunta 7 |
| `cf_cep` | Endereço — CEP | Texto | Formato `00000-000` (ou vazio se pulou) | Pergunta 8 (opcional) |

---

## Checklist de criação

- [ ] Criar `cf_quiz_tier` (texto)
- [ ] Criar `cf_quiz_score` (número)
- [ ] Criar `cf_pet_especie` (texto)
- [ ] Criar `cf_pet_idade` (texto)
- [ ] Criar `cf_pet_ultima_vet` (texto)
- [ ] Criar `cf_gasto_mensal` (número)
- [ ] Criar `cf_plano_atual` (texto)
- [ ] Criar `cf_cep` (texto)
- [ ] Validar que aparece em `https://api.rd.services/platform/contacts/fields` (opcional — só se tiver token privado configurado)

---

## Por que cada campo importa

- **`cf_quiz_tier`** — chave da segmentação. Cria 3 listas/automações: "Leads quentes", "Leads mornos", "Leads frios".
- **`cf_quiz_score`** — granularidade fina pra você comparar campanhas (média de score por utm_source).
- **`cf_pet_especie` + `cf_pet_idade`** — base pra cadências de email diferenciadas (cão filhote ≠ gato idoso).
- **`cf_pet_ultima_vet` + `cf_plano_atual`** — sinais de prontidão pra abordagem comercial (lead que nunca foi ao vet + sem plano = alta urgência).
- **`cf_gasto_mensal`** — pricing fit (gasta R$50/mês não cabe no plano premium).
- **`cf_cep`** — habilita ofertas geo-direcionadas e teste A/B por região da rede parceira.

---

## O que NÃO criar como custom field

Esses já são nativos do RD — não duplicar:

- Email → `email`
- Nome → `name`
- Telefone/WhatsApp → `mobile_phone`
- UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) → o RD captura automaticamente quando enviado no payload de `conversion_identifier` ou via tags.

## Referência

- Doc oficial RD para conversions API: https://developers.rdstation.com/reference/conversoes
- Doc oficial para custom fields: https://developers.rdstation.com/reference/get_platform-contacts-fields
