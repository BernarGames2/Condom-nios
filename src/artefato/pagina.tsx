/**
 * Monta a versão publicada no Claude (sem servidor) com os mesmos componentes do site.
 * Rodado pelo script scripts/gerar-artefato.mjs; não faz parte do site Next.js.
 */
import { renderToStaticMarkup } from "react-dom/server";
import type { ContextoSite } from "@/componentes/contexto";
import { PaginaInicial } from "@/componentes/PaginaInicial";
import { TextoPrivacidade } from "@/componentes/PoliticaPrivacidade";
import { Icone } from "@/componentes/ui/Icone";

export interface OpcoesArtefato {
  contatoEmail: string;
  responsavel: string;
}

export function renderizarArtefato({ contatoEmail, responsavel }: OpcoesArtefato): string {
  const ctx: ContextoSite = {
    modo: "email",
    artefato: true,
    contatoEmail,
    responsavel,
    hospedagem: "Claude, da Anthropic",
    urlPrivacidade: "#privacidade",
    baseAncoras: "",
  };

  const privacidade = (
    <section id="privacidade" aria-labelledby="titulo-privacidade" className="margem-lateral border-t border-borda bg-fundo-2">
      <div className="mx-auto w-full max-w-[48rem] py-10 md:py-14">
        <details id="detalhes-privacidade" className="group">
          <summary className="flex min-h-12 items-center justify-between gap-4">
            <h2 id="titulo-privacidade" className="titulo-secao m-0 text-[1.6rem]">
              Política de privacidade
            </h2>
            <Icone
              nome="chevron"
              tamanho={22}
              className="shrink-0 text-texto-3 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="pt-6">
            <TextoPrivacidade ctx={ctx} nivelTitulo={3} />
          </div>
        </details>
      </div>
    </section>
  );

  return renderToStaticMarkup(<PaginaInicial ctx={ctx} extra={privacidade} />);
}
