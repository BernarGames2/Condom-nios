/**
 * Medição de eventos, sem rastreador instalado.
 *
 * Cada evento é emitido como um CustomEvent "condominios:evento" na janela e,
 * se existir um window.dataLayer (Google Tag Manager, por exemplo), também é
 * empilhado nele. Nada sai do navegador enquanto nenhuma ferramenta de medição
 * for configurada (veja "Medição" no README).
 */

export type NomeEvento =
  | "visualizacao_pagina"
  | "clique_solicitar"
  | "inicio_formulario"
  | "envio_sucesso"
  | "email_preparado"
  | "erro_formulario"
  | "clique_contato";

export type DadosEvento = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function registrarEvento(nome: NomeEvento, dados: DadosEvento = {}): void {
  if (typeof window === "undefined") return;
  const detalhe = { evento: nome, ...dados };
  try {
    window.dispatchEvent(new CustomEvent("condominios:evento", { detail: detalhe }));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(detalhe);
  } catch {
    // a medição nunca pode quebrar a página
  }
}
