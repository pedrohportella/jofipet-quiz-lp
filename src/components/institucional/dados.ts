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
  /** Para quem é: uma linha, sem promessa. */
  perfil: string;
};

export const PLANOS: Plano[] = [
  {
    nome: 'Sereninho',
    chave: 'sereninho',
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
    perfil: 'Para quem quer começar com previsibilidade.',
  },
  {
    nome: 'Sereno',
    chave: 'sereno',
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
    perfil: 'Para quem quer cuidado completo na rotina.',
  },
  {
    nome: 'Parceiro',
    chave: 'parceiro',
    frase: 'Para quando o cuidado pede mais.',
    ate7: '169,90',
    a8mais: '209,90',
    herda: 'Tudo da assinatura Sereno, e mais:',
    inclui: [
      'Diárias de internação',
      'Consultas com especialistas',
      'Tomografia',
      'Cirurgias e anestesias',
      'Limpeza de tártaro',
      'Acupuntura',
    ],
    perfil: 'Para quem quer cobertura para cirurgia e internação.',
  },
  {
    nome: 'Melhor Amigo',
    chave: 'melhor-amigo',
    frase: 'A cobertura mais ampla da Jofi.',
    ate7: '259,90',
    a8mais: '309,90',
    herda: 'Tudo da assinatura Parceiro, e mais:',
    inclui: [
      'Consultas clínicas ilimitadas',
      'Mais diárias de internamento',
      'Endoscopia respiratória e colonoscopia',
      'Ultrassonografia, raio-x e tomografias especiais',
      'Ressonância magnética',
      'Fisioterapia e transfusão de sangue',
      'Incineração',
    ],
    perfil: 'Para quem quer a cobertura mais ampla.',
  },
];

export type Clinica = {
  unidadeId: number;
  nome: string;
  bairro: string;
  cidade: string;
  uf: string;
  endereco: string;
  /** Só onde o Pedro confirmou (06/10/2026). */
  atendimento24h?: boolean;
  foto?: { src: string; alt: string };
};

export const CLINICAS: Clinica[] = [
  {
    unidadeId: 2,
    nome: 'Vets Care Fortaleza',
    bairro: 'Aldeota',
    cidade: 'Fortaleza',
    uf: 'CE',
    endereco: 'Avenida Padre Antônio Tomás, 40',
    atendimento24h: true,
    foto: { src: '/institucional/vets-care-gato.jpg', alt: 'Gato branco no colo de uma veterinária' },
  },
  {
    unidadeId: 3,
    nome: 'Vets Care Fortaleza',
    bairro: 'Parque Araxá',
    cidade: 'Fortaleza',
    uf: 'CE',
    endereco: 'Avenida Bezerra de Menezes, 1309',
    // O 24h foi confirmado para o Vets Care; o raio-x cita as unidades Aldeota e São Geraldo, e a API
    // lista Aldeota e Parque Araxá. Sem confirmar que o Araxá é 24h, o selo fica fora desta unidade.
  },
  {
    unidadeId: 4,
    nome: 'Hospital Veterinário Quatro Patas',
    bairro: 'Jardim São Francisco',
    cidade: 'São Luís',
    uf: 'MA',
    endereco: 'Rua das Paparaubas, 13',
    atendimento24h: true,
    foto: { src: '/institucional/quatro-patas-fachada.jpg', alt: 'Fachada do Hospital Veterinário Quatro Patas' },
  },
  {
    unidadeId: 1,
    nome: 'Cabus Pet',
    bairro: 'Piedade',
    cidade: 'Jaboatão dos Guararapes',
    uf: 'PE',
    endereco: 'Avenida Bernardo Vieira de Melo, 5457',
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
    texto: 'Quatro assinaturas, do essencial à cobertura mais ampla. O valor aparece antes de você pagar.',
  },
  {
    n: '3',
    titulo: 'Escolha a clínica parceira',
    texto: 'Seu pet passa a ter uma clínica de referência, com atendimento de quem já o conhece.',
  },
];
