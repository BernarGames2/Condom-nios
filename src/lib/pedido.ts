/**
 * Pedido do calendário grátis: opções, validação e textos.
 *
 * Este módulo é usado no navegador (formulário), no servidor (rota /api/pedidos)
 * e na versão publicada no Claude. Não importe nada de servidor aqui.
 */

export const PERFIS = [
  { valor: "sindico_profissional", rotulo: "Síndico profissional" },
  { valor: "administradora", rotulo: "Administradora" },
  { valor: "outro", rotulo: "Outro" },
] as const;

export const QUANTIDADES = [
  { valor: "1", rotulo: "1" },
  { valor: "2-5", rotulo: "2 a 5" },
  { valor: "6-15", rotulo: "6 a 15" },
  { valor: "16-30", rotulo: "16 a 30" },
  { valor: "30+", rotulo: "Mais de 30" },
] as const;

export const DIFICULDADES = [
  { valor: "vencimentos", rotulo: "Controlar os vencimentos" },
  { valor: "documentos", rotulo: "Organizar documentos e laudos" },
  { valor: "servicos", rotulo: "Registrar serviços realizados" },
  { valor: "relatorios", rotulo: "Preparar relatórios para o conselho" },
  { valor: "varios_predios", rotulo: "Acompanhar vários prédios" },
  { valor: "outro", rotulo: "Outro" },
] as const;

/** De onde a pessoa chegou, lido do link (#grupo, ?origem=grupo ou utm_source). */
export const ORIGENS = [
  { valor: "grupo", rotulo: "Grupo de síndicos" },
  { valor: "anuncio", rotulo: "Anúncio no Facebook ou Instagram" },
  { valor: "linkedin", rotulo: "LinkedIn" },
  { valor: "email", rotulo: "E-mail" },
  { valor: "indicacao", rotulo: "Indicação de alguém" },
] as const;

export const LIMITES = {
  nome: 120,
  email: 160,
  empresa: 120,
  telefone: 30,
  comentario: 1000,
} as const;

export type Perfil = (typeof PERFIS)[number]["valor"];
export type Quantidade = (typeof QUANTIDADES)[number]["valor"];
export type Dificuldade = (typeof DIFICULDADES)[number]["valor"];
export type Origem = (typeof ORIGENS)[number]["valor"];

export interface Pedido {
  nome: string;
  email: string;
  perfil: Perfil;
  quantidade: Quantidade;
  empresa: string;
  dificuldade: Dificuldade | "";
  telefone: string;
  comentario: string;
  aceitaNovidades: boolean;
}

export type CampoPedido = keyof Pedido;
export type ErrosPedido = Partial<Record<CampoPedido, string>>;
export type ResultadoValidacao =
  | { ok: true; pedido: Pedido }
  | { ok: false; erros: ErrosPedido };

/** Ordem dos campos na tela, usada para focar o primeiro erro. */
export const ORDEM_CAMPOS: CampoPedido[] = [
  "nome",
  "email",
  "perfil",
  "quantidade",
  "empresa",
  "dificuldade",
  "telefone",
  "comentario",
  "aceitaNovidades",
];

const CONTROLE_LINHA = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g;
const CONTROLE_TEXTO = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g;

/** Texto de uma linha: sem caracteres de controle e com espaços normalizados. */
function linha(valor: unknown): string {
  if (typeof valor !== "string") return "";
  return valor.normalize("NFC").replace(CONTROLE_LINHA, " ").replace(/\s+/g, " ").trim();
}

/** Texto de várias linhas: mantém quebras de linha, remove o resto dos caracteres de controle. */
function paragrafos(valor: unknown): string {
  if (typeof valor !== "string") return "";
  return valor
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROLE_TEXTO, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pertence<T extends string>(valor: string, opcoes: readonly { valor: T }[]): valor is T {
  return opcoes.some((o) => o.valor === valor);
}

function marcado(valor: unknown): boolean {
  return valor === true || valor === "on" || valor === "sim" || valor === "true";
}

const FORMATO_EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/;

export function emailValido(email: string): boolean {
  if (!FORMATO_EMAIL.test(email)) return false;
  const [, dominio = ""] = email.split("@");
  return !dominio.includes("..") && !dominio.startsWith(".") && !dominio.startsWith("-");
}

/** Telefone do Brasil com DDD (10 ou 11 dígitos), com ou sem +55, ou internacional com +. */
export function telefoneValido(telefone: string): boolean {
  if (!/^[+\d\s().-]+$/.test(telefone)) return false;
  const digitos = telefone.replace(/\D/g, "");
  if (telefone.trim().startsWith("+")) return digitos.length >= 8 && digitos.length <= 15;
  if (digitos.startsWith("55") && (digitos.length === 12 || digitos.length === 13)) return true;
  return digitos.length === 10 || digitos.length === 11;
}

/**
 * Valida e normaliza os dados do pedido. Aceita o objeto vindo de um formulário
 * (strings, "on" na caixa marcada) ou de um JSON.
 */
export function validarPedido(entrada: unknown): ResultadoValidacao {
  const dados = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const erros: ErrosPedido = {};

  const nome = linha(dados.nome);
  if (!nome) erros.nome = "Informe seu nome.";
  else if (nome.length < 2) erros.nome = "Confira o nome: ele precisa ter pelo menos 2 letras.";
  else if (nome.length > LIMITES.nome) erros.nome = `O nome pode ter no máximo ${LIMITES.nome} caracteres.`;

  const emailBruto = linha(dados.email);
  const email = emailBruto.replace(/@(.+)$/, (_, dominio: string) => "@" + dominio.toLowerCase());
  if (!email) erros.email = "Informe seu e-mail.";
  else if (email.length > LIMITES.email) erros.email = `O e-mail pode ter no máximo ${LIMITES.email} caracteres.`;
  else if (!emailValido(email)) erros.email = "Confira o e-mail. Ele deve ter o formato nome@empresa.com.br.";

  const perfil = linha(dados.perfil);
  if (!pertence(perfil, PERFIS)) erros.perfil = "Escolha o seu perfil.";

  const quantidade = linha(dados.quantidade);
  if (!pertence(quantidade, QUANTIDADES)) erros.quantidade = "Escolha quantos condomínios você administra.";

  const empresa = linha(dados.empresa);
  if (empresa.length > LIMITES.empresa) erros.empresa = `O nome da empresa pode ter no máximo ${LIMITES.empresa} caracteres.`;

  const dificuldade = linha(dados.dificuldade);
  if (dificuldade && !pertence(dificuldade, DIFICULDADES)) erros.dificuldade = "Escolha uma das opções da lista.";

  const telefone = linha(dados.telefone);
  if (telefone.length > LIMITES.telefone || (telefone && !telefoneValido(telefone))) {
    erros.telefone = "Confira o telefone. Use o DDD e o número, por exemplo (11) 91234-5678.";
  }

  const comentario = paragrafos(dados.comentario);
  if (comentario.length > LIMITES.comentario) {
    erros.comentario = `O comentário pode ter no máximo ${LIMITES.comentario.toLocaleString("pt-BR")} caracteres.`;
  }

  if (Object.keys(erros).length > 0) return { ok: false, erros };

  return {
    ok: true,
    pedido: {
      nome,
      email,
      perfil: perfil as Perfil,
      quantidade: quantidade as Quantidade,
      empresa,
      dificuldade: dificuldade as Dificuldade | "",
      telefone,
      comentario,
      aceitaNovidades: marcado(dados.aceitaNovidades),
    },
  };
}

export function rotulo<T extends string>(opcoes: readonly { valor: T; rotulo: string }[], valor: string): string {
  return opcoes.find((o) => o.valor === valor)?.rotulo ?? "";
}

/** Lê a origem do link: #grupo, ?origem=grupo ou ?utm_source=grupo. */
export function lerOrigem(hash: string, busca: string): Origem | null {
  const candidatos: string[] = [];
  const marca = hash.replace(/^#/, "").toLowerCase();
  if (marca) candidatos.push(marca);
  try {
    const parametros = new URLSearchParams(busca);
    for (const chave of ["origem", "utm_source"]) {
      const valor = parametros.get(chave);
      if (valor) candidatos.push(valor.toLowerCase());
    }
  } catch {
    // busca malformada: ignora
  }
  for (const candidato of candidatos) {
    if (pertence(candidato, ORIGENS)) return candidato;
  }
  return null;
}

export const ASSUNTO_PEDIDO = "Quero o calendário grátis";

/** Texto do pedido em linhas "Campo: valor", usado no e-mail e no aviso da planilha. */
export function montarMensagemPedido(pedido: Pedido, origem: Origem | null): string {
  const linhas = [
    "Olá! Quero o calendário de manutenção grátis.",
    "",
    `Nome: ${pedido.nome}`,
    `E-mail profissional: ${pedido.email}`,
    `Perfil: ${rotulo(PERFIS, pedido.perfil)}`,
    `Condomínios que administro: ${rotulo(QUANTIDADES, pedido.quantidade)}`,
  ];
  if (pedido.empresa) linhas.push(`Administradora ou empresa: ${pedido.empresa}`);
  if (pedido.dificuldade) linhas.push(`Principal dificuldade: ${rotulo(DIFICULDADES, pedido.dificuldade)}`);
  if (pedido.telefone) linhas.push(`Telefone: ${pedido.telefone}`);
  if (pedido.comentario) linhas.push("", "Comentário:", pedido.comentario);
  linhas.push("", `Quero receber novidades sobre o Condomínios: ${pedido.aceitaNovidades ? "Sim" : "Não"}`);
  linhas.push(`Como cheguei à página: ${origem ? rotulo(ORIGENS, origem) : "Não informado"}`);
  return linhas.join("\n");
}

/** Links prontos para enviar o pedido por e-mail (Gmail na web e aplicativo de e-mail). */
export function linksDoEmail(para: string, corpo: string): { gmail: string; app: string } {
  return {
    gmail:
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(para) +
      "&su=" + encodeURIComponent(ASSUNTO_PEDIDO) +
      "&body=" + encodeURIComponent(corpo),
    app: "mailto:" + para + "?subject=" + encodeURIComponent(ASSUNTO_PEDIDO) + "&body=" + encodeURIComponent(corpo),
  };
}
