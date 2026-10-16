/**
 * Funções de formulário que não dependem do React: usadas pelo componente
 * FormularioPedido e pelo script da versão publicada no Claude.
 */
import type { CampoPedido } from "./pedido";

/** Id do elemento que recebe o foco quando o campo tem erro. */
export function idParaFoco(campo: CampoPedido): string {
  if (campo === "perfil") return "campo-perfil-0";
  if (campo === "quantidade") return "campo-quantidade-0";
  return `campo-${campo}`;
}

/** Lê os campos do formulário como um objeto simples. */
export function lerCampos(form: HTMLFormElement): Record<string, string | boolean> {
  const dados: Record<string, string | boolean> = {};
  new FormData(form).forEach((valor, chave) => {
    if (typeof valor === "string") dados[chave] = valor;
  });
  const novidades = form.elements.namedItem("aceitaNovidades");
  dados.aceitaNovidades = novidades instanceof HTMLInputElement ? novidades.checked : false;
  return dados;
}

/** Gera um identificador único (UUID v4) também em páginas sem HTTPS. */
export function novoId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Seleciona o texto de um elemento (quando a cópia automática não é permitida). */
export function selecionarTexto(alvo: HTMLElement): void {
  const selecao = window.getSelection();
  if (!selecao) return;
  const intervalo = document.createRange();
  intervalo.selectNodeContents(alvo);
  selecao.removeAllRanges();
  selecao.addRange(intervalo);
}
