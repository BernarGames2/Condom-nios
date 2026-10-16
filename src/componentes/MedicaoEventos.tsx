"use client";

import { useEffect } from "react";
import { registrarEvento, type NomeEvento } from "@/lib/eventos";

let visualizacaoRegistrada = false;

/**
 * Registra a visualização da página e os cliques em elementos com data-evento
 * (por exemplo, os botões "Solicitar calendário grátis").
 */
export function MedicaoEventos() {
  useEffect(() => {
    if (!visualizacaoRegistrada) {
      visualizacaoRegistrada = true;
      registrarEvento("visualizacao_pagina", { pagina: window.location.pathname });
    }
    const aoClicar = (evento: MouseEvent) => {
      const alvo = (evento.target as Element | null)?.closest?.("[data-evento]");
      if (!(alvo instanceof HTMLElement)) return;
      const nome = alvo.dataset.evento as NomeEvento | undefined;
      if (nome) registrarEvento(nome, { local: alvo.dataset.local });
    };
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);
  return null;
}
