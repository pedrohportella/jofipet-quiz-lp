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

## Fases 2 a 5 (18/11/2026)

| Fase | Resultado |
|---|---|
| 2 | Botão principal laranja (retângulo de 16px, texto branco bold em caixa alta); opção de resposta, barra de progresso e cartões no DS; ícone de linha no lugar do emoji (`IconeEmoji`, só na tela: `quiz.json` e o resumo do WhatsApp seguem com emoji) |
| 3 | Captura e resultado com a faixa do plano (cor e pet da assinatura), numa fonte só: `src/lib/plans/identidade.ts` |
| 4 | `/oferta` com ritmo de cores e cartões de plano na cor da assinatura |
| 5 | Limpeza: aliases antigos, triplas RGB, variáveis de tier e classes sem uso saíram de `globals.css`; movimento atualizado; logo do rodapé da `/oferta` corrigida (estava esticada) |

**Cor de plano** (Sereninho, Sereno, Parceiro e Melhor Amigo) vem das artes de outubro e **entrou no design system oficial em 18/11/2026** (tokens `plano-*`, artifact versão 19). Aqui estão em `tokens.json` (`color.primitive.plano`), em `tailwind.config.ts` (`plano.*`) e em `src/lib/plans/identidade.ts` (com o pet de cada assinatura, que não está nos assets do DS oficial).

**Decisões do Pedro ainda abertas:** cor do botão de WhatsApp (verde de plataforma ou laranja da marca) e se o Ricardo aprova o visual novo.

**Arquivos de `public/` sem uso no código** foram mantidos de propósito: podem estar linkados em anúncio, e-mail ou material externo.

## Tela de operação: o `/admin` (CRM) no design system (23/11/2026)

O design system oficial é de **peça de marca** (fundo chapado, título gigante). O `/admin` é ferramenta de operação, densa e de leitura rápida, então adapta o sistema **sem inventar cor**. Cada adaptação abaixo é registrada aqui e vira seção do design system oficial só com o aval do Pedro. Proposta e fases: `Clientes/01_Ativos/Jofi Pet/03_Planejamento/2026-11-23_proposta-design-system-crm.md`.

| Tema | Regra |
|---|---|
| Página | Fundo `fundo-suave` (`neutral-100`); cartões, tabelas e colunas em `branco` com contorno `borda-suave` (`neutral-300`). **Sem sombra** e **sem fundo azul ou laranja de página inteira**: o ritmo colorido é de peça. |
| Casca | Faixa `azul` com a logo branca e a pílula "Admin" (branca, texto azul-tinta); barra branca abaixo com o menu. O menu quebra linha em vez de rolar de lado no celular. |
| Texto | `azul-tinta` em título e dado, `tinta-media` (`neutral-700`) em apoio, `neutral-500` só em rótulo de 12px sobre branco. Nunca `azul` como texto pequeno, nunca branco pequeno sobre azul ou laranja. |
| Botão principal | Pílula `laranja`, texto branco bold em caixa alta (a regra de CTA do DS, 2,2:1). Secundário: pílula branca com contorno `azul-tinta`. Item ativo de menu e de filtro: pílula `azul-tinta` com texto branco (8,8:1). |
| Campos | Pílula com contorno `borda-suave`; foco em azul. Altura mínima de 44px (36px em filtro). |
| Ícones | Lucide, traço arredondado, 12 a 18px, sempre com o nome ao lado ou `aria-label`. **Sem emoji** no código do painel. Os rótulos do `quiz.json` trazem emoji: o painel os tira só na exibição (`semEmoji` em `components/admin/crm-ui.tsx`); CSV, RD e dado não mudam. |
| Tier do lead | Pílula com ícone e nome em `azul-tinta`: quente `realce-suave` e `accent-600`, morno `azul-borda` e `primary-600`, frio `fundo-suave` com anel `borda-suave`. Nos gráficos: quente `laranja`, morno `azul`, frio `azul claro`. |
| Etapa do funil | Bolinha com o nome ao lado. As cores do banco (`crm_pipeline_stages.color`) **não são lidas**: o front mapeia por nome (e por posição, se o nome for outro) para `azul`, `plano-sereno`, `plano-sereninho`, `plano-parceiro`. Ganho e Perdido levam ícone (`azul-tinta` e `tinta-media`). |
| Estado e erro | **Sem vermelho e sem verde.** Aviso em caixa `fundo-suave` (informação) ou `realce-suave` (atenção) com ícone e texto. Status do RD: `sent` azul, `queued` azul claro, `rejected`, `unreachable` e `token_missing` em `realce-suave` com triângulo. |
| Conversa | Mensagem enviada em `azul-tinta` com texto branco; recebida em branco com contorno; falha em `realce-suave` com contorno `accent-600` e a palavra "Falhou". |
| Densidade | Texto de 12 a 14px, linhas de tabela compactas, largura máxima de 1120px. Texto de apoio nunca abaixo de 11px. |
| Celular | Inbox mostra a lista **ou** a conversa (botão "Conversas" para voltar). Kanban rola por coluna, dentro do próprio contêiner, sem vazar a página. |

**Uso de `plano-*` fora de tela de assinatura:** o README do DS oficial restringe essas cores a telas de assinatura. O `/admin` as usa como escala das etapas do funil; a restrição precisa ser ajustada no oficial (artifact e cópia, no mesmo passo), com o aval do Pedro.

**Teste visual:** o harness que tira os prints com dados fictícios (sem Supabase, KV nem lead real) está em `Clientes/01_Ativos/Jofi Pet/03_Planejamento/ferramentas/2026-11-23_crm-prints-harness.mjs`.

## Documentos de movimento

`MOTION-SPEC.md` e `SOCIAL-MOTION.md` já usam as cores oficiais (fase 5). Durações e curvas estão em `tokens.json` (`motion`).
