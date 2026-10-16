"use client";

import { useEffect, useRef, useState } from "react";
import { ancoras, cta, navegacao } from "@/conteudo/site";
import { linkAncora, type ContextoSite } from "./contexto";
import { Icone } from "./ui/Icone";
import { BotaoLink, Logo } from "./ui/basicos";

/**
 * Cabeçalho fixo no topo. No celular, os links ficam num menu compacto.
 * Os ids (botao-menu, menu-movel) e atributos data-* também são usados pela
 * versão publicada no Claude, que controla o menu sem React.
 */
export function Cabecalho({ ctx }: { ctx: ContextoSite }) {
  const [aberto, setAberto] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const telaGrande = window.matchMedia("(min-width: 48rem)");
    const aoMudarTela = () => {
      if (telaGrande.matches) setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    telaGrande.addEventListener("change", aoMudarTela);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      telaGrande.removeEventListener("change", aoMudarTela);
    };
  }, [aberto]);

  const inicio = ctx.artefato ? "#inicio" : "/";
  const solicitar = linkAncora(ctx, ancoras.solicitar);

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-borda bg-fundo">
      <div className="margem-lateral">
        <div className="mx-auto flex h-[var(--altura-cabecalho)] w-full max-w-[74rem] items-center gap-3">
          <a href={inicio} className="mr-auto inline-flex rounded-[4px] py-1" aria-label="Condomínios, voltar ao início">
            <Logo />
          </a>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="m-0 flex list-none items-center gap-1 p-0">
              {navegacao.map((item) => (
                <li key={item.ancora}>
                  <a
                    href={linkAncora(ctx, item.ancora)}
                    className="rounded-[6px] px-3 py-2 text-[0.95rem] font-medium text-texto-2 transition-colors hover:bg-fundo-2 hover:text-titulo"
                  >
                    {item.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <BotaoLink href={solicitar} evento="clique_solicitar" local="cabecalho" className="max-md:hidden">
            {cta.cabecalho}
          </BotaoLink>
          <BotaoLink
            href={solicitar}
            evento="clique_solicitar"
            local="cabecalho_celular"
            className="min-h-10 px-3.5 text-[0.9rem] md:hidden"
          >
            {cta.cabecalhoCurto}
          </BotaoLink>

          <button
            ref={botaoRef}
            id="botao-menu"
            type="button"
            aria-expanded={aberto}
            aria-controls="menu-movel"
            onClick={() => setAberto((valor) => !valor)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-botao border border-borda text-titulo transition-colors hover:bg-fundo-2 md:hidden"
          >
            <span data-icone-menu="fechado" hidden={aberto} className="inline-flex">
              <Icone nome="menu" tamanho={20} espessura={2} />
            </span>
            <span data-icone-menu="aberto" hidden={!aberto} className="inline-flex">
              <Icone nome="fechar" tamanho={20} espessura={2} />
            </span>
            <span className="sr-only" data-rotulo-menu="">
              {aberto ? "Fechar menu" : "Abrir menu"}
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu-movel"
        hidden={!aberto}
        className="border-t border-borda bg-fundo md:hidden"
        onClick={(evento) => {
          if ((evento.target as HTMLElement).closest("a")) setAberto(false);
        }}
      >
        <nav aria-label="Menu" className="margem-lateral">
          <ul className="m-0 mx-auto flex max-w-[74rem] list-none flex-col p-0 py-2">
            {navegacao.map((item) => (
              <li key={item.ancora} className="border-b border-borda">
                <a
                  href={linkAncora(ctx, item.ancora)}
                  className="flex min-h-12 items-center justify-between text-[1.0625rem] font-medium text-titulo"
                >
                  {item.rotulo}
                  <Icone nome="seta" tamanho={18} className="text-texto-3" />
                </a>
              </li>
            ))}
            <li className="pb-3 pt-4">
              <BotaoLink href={solicitar} evento="clique_solicitar" local="menu" className="w-full">
                {cta.cabecalho}
              </BotaoLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
