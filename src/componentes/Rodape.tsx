import { ancoras, cta, rodape } from "@/conteudo/site";
import { linkAncora, type ContextoSite } from "./contexto";
import { Icone } from "./ui/Icone";
import { Logo } from "./ui/basicos";

export function Rodape({ ctx }: { ctx: ContextoSite }) {
  const link = "text-[0.95rem] text-texto-2 underline-offset-2 hover:text-azul hover:underline";
  const titulo = "m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-texto-3";
  return (
    <footer className="margem-lateral border-t border-borda bg-fundo">
      <div className="mx-auto grid w-full max-w-[74rem] gap-10 py-12 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="m-0 max-w-[26rem] text-[0.95rem] text-texto-2">{rodape.resumo}</p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-col gap-3">
          <p className={titulo}>Links</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            <li>
              <a href={linkAncora(ctx, ancoras.solicitar)} className={link} data-evento="clique_solicitar" data-local="rodape">
                {cta.cabecalho}
              </a>
            </li>
            <li>
              <a href={linkAncora(ctx, ancoras.perguntas)} className={link}>
                Perguntas frequentes
              </a>
            </li>
            <li>
              <a href={ctx.urlPrivacidade} className={link}>
                {rodape.privacidade}
              </a>
            </li>
            {ctx.contatoEmail ? (
              <li>
                <a href={`${ctx.baseAncoras}#contato`} className={link}>
                  {rodape.contato}
                </a>
              </li>
            ) : null}
          </ul>
        </nav>

        {ctx.contatoEmail ? (
          <div id="contato" data-ancora="" className="flex flex-col gap-3">
            <p className={titulo}>{rodape.contato}</p>
            {!ctx.artefato ? (
              <a
                href={`mailto:${ctx.contatoEmail}`}
                data-evento="clique_contato"
                data-local="rodape"
                className="inline-flex items-center gap-2 break-all text-[0.95rem] font-medium text-titulo hover:text-azul"
              >
                <Icone nome="email" tamanho={18} className="shrink-0 text-texto-3" />
                {ctx.contatoEmail}
              </a>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex min-w-0 items-center gap-2 text-[0.95rem] font-medium text-titulo">
                  <Icone nome="email" tamanho={18} className="shrink-0 text-texto-3" />
                  <span id="rodape-email" className="select-all break-all">
                    {ctx.contatoEmail}
                  </span>
                </span>
                <button
                  type="button"
                  data-copiar="rodape-email"
                  data-evento="clique_contato"
                  data-local="rodape"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[6px] border border-borda-forte bg-superficie px-2.5 text-[0.82rem] font-semibold text-titulo transition-colors hover:border-azul hover:text-azul"
                >
                  <Icone nome="copiar" tamanho={14} espessura={2} />
                  <span data-rotulo-copiar="">Copiar</span>
                </button>
              </div>
            )}
            <p className="m-0 text-[0.86rem] text-texto-3">Respondemos em dias úteis.</p>
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-[74rem] flex-col gap-2 border-t border-borda py-6 text-[0.84rem] text-texto-2 md:flex-row md:items-start md:justify-between md:gap-10">
        <p className="m-0 max-w-[46rem]">{rodape.aviso}</p>
        <p className="m-0 shrink-0">© 2026 Condomínios</p>
      </div>
    </footer>
  );
}
