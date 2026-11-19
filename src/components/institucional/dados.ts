/**
 * Dados do site institucional da Jofi (prévia, 18/11/2026).
 *
 * Preço e cobertura: API do checkout (`api.jofi.pet/v1/site/prestadores/{id}/planos`), conferida em
 * 18/11/2026 e igual nas quatro unidades. Fonte canônica da casa:
 * `02_Briefings/_ativos/_planos-oficiais_jofi.md`. Preço nunca vem da página /coberturas do site
 * atual, que diz "mesmo preço em qualquer idade" e está errada. Mudou a API, muda aqui.
 *
 * Carência: tabela "Carências por assinatura" de `06_Maquina de Criativos/context/03-oferta-e-claims.md`
 * (cartilhas de 02/10/2026). Só se diz o que está ali.
 */

export const WHATSAPP_NUMERO = '558007779745';
export const TELEFONE = '0800 777 9745';
export const ENDERECO_SEDE = 'Rua Álvares Cabral, 155, 2º andar, Recife/PE';

const UTM = 'utm_source=site&utm_medium=institucional';

export const QUIZ_HREF = `/quiz/0?${UTM}`;

export function whatsappHref(texto: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

/** O checkout da Jofi mora em jofi.pet; o id é o da unidade (o mesmo da API). */
export function checkoutHref(unidadeId: number): string {
  return `https://www.jofi.pet/prestadores/${unidadeId}/contratar`;
}

export type Plano = {
  nome: string;
  chave: 'sereninho' | 'sereno' | 'parceiro' | 'melhor-amigo';
  frase: string;
  ate7: string;
  a8mais: string;
  /** Sereninho custa o mesmo nas duas faixas. */
  precoUnico?: boolean;
  herda?: string;
  inclui: string[];
  /**
   * Identidade do plano nas artes de outubro (`06_Criativos/2026-10/whatsapp-resumo-planos`): cor do
   * fundo da arte e o pet de cada assinatura. Cores medidas no fundo de cada camada.
   */
  cor: string;
  /** Texto do título sobre `cor` (o amarelo-laranja do Sereninho pede azul-tinta). */
  corTexto: string;
  pet: { src: string; alt: string };
};

export const PLANOS: Plano[] = [
  {
    nome: 'Sereninho',
    chave: 'sereninho',
    cor: '#f5b03a',
    corTexto: '#004f78',
    pet: { src: '/institucional/planos/pet-sereninho.png', alt: 'Cachorro caramelo, o pet do Sereninho' },
    frase: 'O essencial para a rotina de cuidado.',
    ate7: '49,90',
    a8mais: '49,90',
    precoUnico: true,
    inclui: [
      'Consultas clínicas',
      'Vacinação essencial',
      'Aplicação de medicamentos',
      'Exames de rotina',
      'Cuidados fundamentais',
    ],
  },
  {
    nome: 'Sereno',
    chave: 'sereno',
    cor: '#0091b9',
    corTexto: '#ffffff',
    pet: { src: '/institucional/planos/pet-sereno.png', alt: 'Cachorro beagle com a língua para fora, o pet do Sereno' },
    frase: 'Consultas, vacinas e exames no dia a dia.',
    ate7: '79,90',
    a8mais: '109,90',
    inclui: [
      'Consultas clínicas e de urgência e emergência',
      'Vacinação completa',
      'Exames laboratoriais',
      'Exames de imagem',
      'Sedação e outros procedimentos',
    ],
  },
  {
    nome: 'Parceiro',
    chave: 'parceiro',
    cor: '#f47646',
    corTexto: '#ffffff',
    pet: { src: '/institucional/planos/pet-parceiro.png', alt: 'Cachorro preto de orelhas em pé, o pet do Parceiro' },
    frase: 'Para quando o cuidado pede mais.',
    ate7: '169,90',
    a8mais: '209,90',
    herda: 'Tudo do Sereno, e mais:',
    inclui: [
      'Diárias de internação',
      'Consultas com especialistas',
      'Tomografia',
      'Cirurgias e anestesias',
      'Limpeza de tártaro',
      'Acupuntura',
    ],
  },
  {
    nome: 'Melhor Amigo',
    chave: 'melhor-amigo',
    cor: '#5753a2',
    corTexto: '#ffffff',
    pet: { src: '/institucional/planos/pet-melhor-amigo.png', alt: 'Gato malhado lambendo o focinho, o pet do Melhor Amigo' },
    frase: 'A cobertura mais ampla da Jofi.',
    ate7: '259,90',
    a8mais: '309,90',
    herda: 'Tudo do Parceiro, e mais:',
    inclui: [
      'Consultas clínicas ilimitadas',
      'Mais diárias de internamento',
      'Endoscopia e colonoscopia',
      'Ultrassom, raio-x e tomografias especiais',
      'Ressonância magnética',
      'Fisioterapia e transfusão de sangue',
      'Incineração',
    ],
  },
];

export type Unidade = { unidadeId: number; bairro: string; endereco: string; cep: string };

export type Hospital = {
  nome: string;
  cidade: string;
  uf: string;
  /** Só onde o Pedro confirmou (06/10/2026): Vets Care e Quatro Patas. */
  atendimento24h?: boolean;
  foto?: { src: string; alt: string; posicao?: string };
  /** WhatsApp da clínica, como a API do checkout devolve (18/11/2026), só com dígitos e o 55. */
  whatsapp: string;
  unidades: Unidade[];
};

/** Cidades da rede, na ordem em que aparecem (as duas praças de maior verba primeiro). */
export const CIDADES = [
  { slug: 'fortaleza', nome: 'Fortaleza' },
  { slug: 'sao-luis', nome: 'São Luís' },
  { slug: 'jaboatao', nome: 'Jaboatão dos Guararapes' },
] as const;

export function slugDaCidade(cidade: string): string {
  return CIDADES.find((c) => c.nome === cidade)?.slug ?? cidade;
}

/** "Como chegar": abre a busca do Google Maps com o endereço completo da unidade. */
export function rotaHref(h: Hospital, u: Unidade): string {
  const q = `${h.nome}, ${u.endereco}, ${u.bairro}, ${h.cidade} - ${h.uf}, ${u.cep}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function whatsappDaClinicaHref(h: Hospital): string {
  return `https://wa.me/${h.whatsapp}?text=${encodeURIComponent(`Olá! Vim pelo site da Jofi e queria falar com a ${h.nome}.`)}`;
}

export const HOSPITAIS: Hospital[] = [
  {
    nome: 'Vets Care Fortaleza',
    cidade: 'Fortaleza',
    uf: 'CE',
    atendimento24h: true,
    foto: {
      src: '/institucional/fotos/vets-care-fachada-24h.jpg',
      alt: 'Fachada do Vets Care Hospital Veterinário Popular, com a placa 24h',
      posicao: '50% 38%',
    },
    // O 24h foi confirmado para o Vets Care como um todo; o raio-x cita as unidades Aldeota e São
    // Geraldo e a API lista Aldeota e Parque Araxá. O selo vai no hospital, não em cada unidade.
    whatsapp: '5585997144909',
    unidades: [
      { unidadeId: 2, bairro: 'Aldeota', endereco: 'Avenida Padre Antônio Tomás, 40', cep: '60140-160' },
      { unidadeId: 3, bairro: 'Parque Araxá', endereco: 'Avenida Bezerra de Menezes, 1309', cep: '60325-003' },
    ],
  },
  {
    nome: 'Hospital Veterinário Quatro Patas',
    cidade: 'São Luís',
    uf: 'MA',
    atendimento24h: true,
    foto: {
      src: '/institucional/fotos/quatro-patas-fachada.jpg',
      alt: 'Fachada do Hospital Veterinário Quatro Patas, em São Luís',
      posicao: '50% 55%',
    },
    whatsapp: '5598984132363',
    unidades: [{ unidadeId: 4, bairro: 'Jardim São Francisco', endereco: 'Rua das Paparaubas, 13', cep: '65076-000' }],
  },
  {
    nome: 'Cabus Pet',
    cidade: 'Jaboatão dos Guararapes',
    uf: 'PE',
    whatsapp: '5581998057798',
    unidades: [{ unidadeId: 1, bairro: 'Piedade', endereco: 'Avenida Bernardo Vieira de Melo, 5457', cep: '54440-070' }],
  },
];

export const PASSOS = [
  {
    n: '1',
    titulo: 'Conte sobre o seu pet',
    texto: 'Nome, idade e onde vocês moram. Leva cerca de um minuto.',
  },
  {
    n: '2',
    titulo: 'Escolha a assinatura',
    texto: 'Quatro opções, do essencial à cobertura mais ampla. O valor aparece antes de você pagar.',
  },
  {
    n: '3',
    titulo: 'Escolha a clínica parceira',
    texto: 'Seu pet passa a ter um lugar de referência para o cuidado, com quem já conhece o histórico dele.',
  },
];

/** O que as assinaturas cobrem, em geral. O que cada uma cobre está na matriz de coberturas. */
export const COBRE = [
  'Consultas clínicas',
  'Urgência e emergência',
  'Vacinas',
  'Exames laboratoriais',
  'Exames de imagem',
  'Sedação e anestesia',
  'Cirurgias',
  'Internação',
  'Tomografia',
  'Ressonância magnética',
  'Consultas com especialistas',
  'Limpeza de tártaro',
  'Acupuntura',
  'Fisioterapia',
  'Transfusão de sangue',
  'Medicamentos injetáveis',
];

export const MOTIVOS = [
  {
    t: 'Uma clínica de referência',
    d: 'Seu pet é atendido por quem já conhece o histórico dele, na clínica parceira que você escolhe.',
    icone: 'casa',
  },
  {
    t: 'Valor claro antes de pagar',
    d: 'O preço muda aos 8 anos do pet, e você vê o valor da sua assinatura antes de fechar.',
    icone: 'etiqueta',
  },
  {
    t: 'Consulta liberada desde o primeiro dia',
    d: 'Nas quatro assinaturas, a consulta clínica não tem carência. Exames e procedimentos têm prazos por cobertura.',
    icone: 'check',
  },
  {
    t: 'Sem burocracia para usar',
    d: 'Depois de cumprida a carência, é só usar: você não precisa pedir autorização à Jofi.',
    icone: 'chave',
  },
] as const;

/**
 * Matriz da página de coberturas. Cada célula é o prazo de carência da cartilha de 02/10/2026:
 * "Liberado" é o que o pet usa desde o primeiro dia, "—" é o que a assinatura não cobre. Colunas:
 * Sereninho, Sereno, Parceiro, Melhor Amigo. Na dúvida, vale a cartilha.
 */
export const MATRIZ: { item: string; celulas: [string, string, string, string] }[] = [
  { item: 'Consulta clínica geral', celulas: ['Liberado', 'Liberado', 'Liberado', 'Liberado'] },
  { item: 'Urgência e emergência', celulas: ['—', 'Liberado', 'Liberado', 'Liberado'] },
  { item: 'Consulta com especialista', celulas: ['—', '—', '60 dias', '60 dias'] },
  { item: 'Vacinas', celulas: ['30 dias', '30 dias', 'Liberado', 'Liberado'] },
  { item: 'Exames de sangue e laboratório', celulas: ['45 dias', '30 a 120 dias', '30 a 120 dias', '30 a 120 dias'] },
  { item: 'Exames de imagem', celulas: ['—', '90 a 120 dias', '90 a 360 dias', '90 a 360 dias'] },
  { item: 'Aplicação de medicamentos', celulas: ['30 dias', '30 dias', '30 dias', '30 dias'] },
  { item: 'Sedação', celulas: ['—', '30 dias', '30 dias', '30 dias'] },
  { item: 'Anestesia', celulas: ['—', '—', '120 dias', '120 dias'] },
  { item: 'Internação (diárias)', celulas: ['—', '—', '90 dias', '90 dias'] },
  { item: 'Cirurgias', celulas: ['—', '—', '360 dias', '360 dias'] },
  { item: 'Dentes e limpeza de tártaro', celulas: ['—', '—', '180 a 360 dias', '180 a 360 dias'] },
  { item: 'Acupuntura', celulas: ['—', '—', '90 dias', '90 dias'] },
  { item: 'Fisioterapia', celulas: ['—', '—', '—', '90 dias'] },
  { item: 'Transfusão de sangue e incineração', celulas: ['—', '—', '—', '180 dias'] },
];

export const FAQ: { p: string; r: string }[] = [
  {
    p: 'Quanto custa a assinatura?',
    r: 'A partir de R$ 49,90 por mês, no Sereninho. O valor das outras assinaturas depende da idade do pet, e você vê o valor exato antes de pagar.',
  },
  {
    p: 'O preço muda com a idade do pet?',
    r: 'Sim. Até 7 anos é um valor; a partir dos 8 anos completos é outro. Só o Sereninho custa o mesmo nas duas faixas. A raça não entra no cálculo.',
  },
  {
    p: 'Existe carência?',
    r: 'Existe, e ela varia por assinatura e por cobertura. A consulta clínica é liberada desde o primeiro dia nas quatro assinaturas. Exames, procedimentos, internação e cirurgias têm prazos de 30 a 360 dias.',
  },
  {
    p: 'Preciso pedir autorização para usar?',
    r: 'Depois de cumprida a carência, não: você leva o pet à clínica parceira e usa a cobertura, sem pedir autorização à Jofi.',
  },
  {
    p: 'Como eu contrato?',
    r: 'Você pode responder ao questionário e ver a cobertura que combina com o seu pet, ou escolher a clínica parceira na página da rede credenciada e contratar por lá.',
  },
  {
    p: 'Posso cadastrar mais de um pet?',
    r: 'Quem cadastra mais de um pet tem vantagens. Fale com a gente pelo WhatsApp para saber como funciona.',
  },
  {
    p: 'A Jofi é telemedicina?',
    r: 'Não. O atendimento é presencial, nas clínicas e hospitais veterinários parceiros.',
  },
];
