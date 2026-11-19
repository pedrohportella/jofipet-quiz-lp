# Jofi Pet — design system do quiz e da LP de oferta (v3.0)

> **Fase 1 (18/11/2026):** tokens e fonte alinhados ao design system oficial da Jofi. A fonte única de marca é o design system oficial (artifact https://claude.ai/artifact/QuJgnJKMwsViyL8XDVKpjz, cópia em `Clientes/01_Ativos/Jofi Pet/01_Marca/design-system/`). Este arquivo só diz como o código do quiz consome esse sistema. **Substitui a v1.0, que descrevia coral e cream (`#FF7A59`, `#FFF7F0`) e nunca foi a marca.**
>
> Proposta e fases: `Clientes/01_Ativos/Jofi Pet/03_Planejamento/2026-11-18_proposta-design-system-quiz.md`.

## Como o código lê a marca

```
tokens.json  →  tailwind.config.ts  +  src/app/globals.css  →  componente
```

Componente lê classe do Tailwind (`bg-primary`, `text-neutral-900`) ou variável semântica (`--jofi-action-primary`). Cor escrita à mão no componente é bug: se faltar valor, acrescente ao token.

## Cor

| Papel | Valor | Origem | Onde aparece |
|---|---|---|---|
| Azul | `#009af2` | oficial | `primary`, `primary-500`, fundo-âncora, tier morno |
| Azul-tinta | `#004f78` | oficial | `neutral-900` (texto), `primary-700` |
| Tinta-média | `#2f5a73` | oficial | `neutral-700` (texto de apoio) |
| Fundo-suave | `#eaf6fe` | oficial | `cream`, `neutral-100`, `primary-50` |
| Borda-suave | `#d7ecfa` | oficial | `neutral-300`, `primary-100` |
| Laranja | `#ff9625` | oficial | `accent`, tier quente, CTA laranja |
| Realce-suave | `#ffe3c2` | oficial | `accent-100` |
| Amarelo | `#ffff44` | oficial | `highlight` (uma palavra de título sobre azul) |
| Azul claro | `#7fcdf8` | **derivado** | `primary-300`, tier frio |
| Azul de hover e link | `#0079bf` | **derivado** | `primary-600` (4,7:1 sobre branco) |
| Texto de apoio | `#4f7389` | **derivado** | `neutral-500` (5:1 sobre branco) |
| Laranja de texto | `#b35f00` | **derivado** | `accent-600`, mensagem de erro (5:1) |
| Laranja claro e escuro | `#ffbe78`, `#8a4800` | **derivado** | `accent-300`, `accent-700` |
| Verde e WhatsApp | `#4CAF82`, `#25D366` | funcional | sucesso e CTA de WhatsApp (decisão pendente, ver abaixo) |

Os degraus **derivados** não existem no design system oficial: são apoio calculado a partir dele. Se o Pedro aprovar outro valor, muda aqui e nos três arquivos de token, no mesmo passo.

**Regras de cor (do DS oficial):**
- Título sobre azul ou laranja é branco e grande; uma palavra pode ir em amarelo, só sobre azul. Amarelo nunca sobre branco nem sobre laranja.
- Texto sobre branco é azul-tinta, tinta-média ou o de apoio. Nunca preto puro.
- Branco sobre laranja dá 2,2:1 e branco sobre azul dá 3,0:1: só título grande ou texto bold de botão. Texto pequeno vai em pílula branca com azul-tinta.
- Palavra de destaque em título sobre branco: azul (`text-primary`), não laranja.
- Não existe tema escuro.

## Tipografia

- **Texto e interface:** Inter (`font-sans`, variável `--font-inter`), pesos 400, 500, 600, 700 e 800. Substitui a Nunito.
- **Título de peça:** Anton (`font-display`, `.jofi-display`), caixa alta. É a reserva do design system: a Tusker Grotesk, que é a fonte da marca, é comercial e não vai para a web.
- Itálico e pesos fora da lista, não.

## O que mudou na fase 1

- Valores de cor em `tailwind.config.ts`, `globals.css` e `tokens.json`.
- `tailwind.config.ts` ganhou `highlight` (amarelo) e o `cream` passou a ser o fundo-suave.
- Fonte do texto: Nunito → Inter.
- Cores escritas à mão trocadas: ícone, ícone de iOS, imagem de compartilhamento, tema do navegador e manifesto.
- Palavras de destaque de título e rótulos que eram laranja sobre branco passaram a azul, para não ficar em 2,2:1.
- Sombras e foco passaram a usar azul-tinta e azul.

## O que fica para as próximas fases

| Fase | Pendência |
|---|---|
| 2 | Botão principal passa de azul para a pílula laranja com texto branco bold em caixa alta; hoje branco sobre `#009af2` dá 3,0:1. Opção de resposta, barra de progresso, cartões, ícones de linha no lugar do emoji, fundos alternados |
| 3 | Captura e resultado: pet de cada assinatura e as cores das artes de outubro |
| 4 | `/oferta`, as 17 seções |
| 5 | Remover token e classe antigos; atualizar o artifact do DS oficial |

**Decisões do Pedro ainda abertas:** emoji no quiz, cor do botão de WhatsApp (verde de plataforma ou laranja da marca), e se o Ricardo aprova o visual novo antes de ir ao ar.

## Documentos de movimento

`MOTION-SPEC.md` e `SOCIAL-MOTION.md` descrevem as animações. Os valores de cor neles são da v1.0 (coral) e **não valem**; as durações e curvas valem e estão em `tokens.json` (`motion`). Serão revisados na fase 2.
