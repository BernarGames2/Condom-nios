/** Datas no formato AAAA-MM-DD, sem fuso horário (dia de calendário). */

function paraDiaUtc(data: string): number {
  const [ano, mes, dia] = data.split("-").map(Number);
  if (!ano || !mes || !dia) throw new Error(`data inválida: ${data}`);
  return Date.UTC(ano, mes - 1, dia);
}

/** Dias de `de` até `ate` (negativo se `ate` já passou). */
export function diasEntre(de: string, ate: string): number {
  return Math.round((paraDiaUtc(ate) - paraDiaUtc(de)) / 86_400_000);
}

/** 2026-10-20 -> 20/10/2026 */
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** 2026-10-20 -> 20/10 */
export function formatarDiaMes(data: string): string {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

export type Situacao = "em_dia" | "proximo" | "atrasado";

/** Regra da demonstração: vence em até 30 dias = próximo do vencimento. */
export const JANELA_PROXIMO_DIAS = 30;

export function situacaoDoPrazo(referencia: string, vencimento: string): Situacao {
  const dias = diasEntre(referencia, vencimento);
  if (dias < 0) return "atrasado";
  if (dias <= JANELA_PROXIMO_DIAS) return "proximo";
  return "em_dia";
}

export function descreverPrazo(referencia: string, vencimento: string): string {
  const dias = diasEntre(referencia, vencimento);
  if (dias < -1) return `venceu há ${-dias} dias`;
  if (dias === -1) return "venceu ontem";
  if (dias === 0) return "vence hoje";
  if (dias === 1) return "vence amanhã";
  return `vence em ${dias} dias`;
}
