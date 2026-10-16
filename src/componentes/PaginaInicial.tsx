import type { ReactNode } from "react";
import { Cabecalho } from "./Cabecalho";
import type { ContextoSite } from "./contexto";
import { Rodape } from "./Rodape";
import { CalendarioGratis } from "./secoes/CalendarioGratis";
import { ChamadaFinal } from "./secoes/ChamadaFinal";
import { ComoFunciona } from "./secoes/ComoFunciona";
import { Demonstracao } from "./secoes/Demonstracao";
import { Hero } from "./secoes/Hero";
import { ParaQuem } from "./secoes/ParaQuem";
import { PerguntasFrequentes } from "./secoes/PerguntasFrequentes";
import { Problema } from "./secoes/Problema";
import { RecursosPlanejados } from "./secoes/RecursosPlanejados";

export function LinkPularConteudo() {
  return (
    <a
      href="#conteudo"
      className="sr-only rounded-botao bg-azul px-4 py-2 font-semibold text-sobre-azul focus:not-sr-only focus:fixed focus:left-[max(16px,env(safe-area-inset-left,0px))] focus:top-[calc(env(safe-area-inset-top,0px)+12px)] focus:z-[70]"
    >
      Pular para o conteúdo
    </a>
  );
}

/** Página inicial completa, na ordem do roteiro. `extra` entra depois da chamada final. */
export function PaginaInicial({ ctx, extra }: { ctx: ContextoSite; extra?: ReactNode }) {
  return (
    <>
      <LinkPularConteudo />
      <Cabecalho ctx={ctx} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero ctx={ctx} />
        <Problema />
        <ComoFunciona />
        <Demonstracao />
        <ParaQuem />
        <CalendarioGratis ctx={ctx} />
        <RecursosPlanejados />
        <PerguntasFrequentes ctx={ctx} />
        <ChamadaFinal ctx={ctx} />
        {extra}
      </main>
      <Rodape ctx={ctx} />
    </>
  );
}
