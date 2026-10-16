import { ancoras, hero } from "@/conteudo/site";
import { linkAncora, type ContextoSite } from "../contexto";
import { PainelDemo } from "../demo/PainelDemo";
import { Icone } from "../ui/Icone";
import { BotaoLink } from "../ui/basicos";

export function Hero({ ctx }: { ctx: ContextoSite }) {
  return (
    <section id="inicio" aria-labelledby="titulo-hero" className="margem-lateral relative overflow-hidden">
      <div
        aria-hidden="true"
        className="fundo-grade pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_35%,transparent_95%)]"
      />
      <div className="relative mx-auto grid w-full max-w-[74rem] gap-12 py-12 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] lg:items-center lg:gap-12 lg:py-24">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <p className="sobretitulo">{hero.sobretitulo}</p>
          <h1 id="titulo-hero" className="titulo-display m-0">
            {hero.titulo.map((parte) => (
              <span key={parte} className="block">
                {parte}
              </span>
            ))}
          </h1>
          <p className="m-0 max-w-[34rem] text-[1.125rem] leading-relaxed text-texto-2 md:text-[1.1875rem]">{hero.subtitulo}</p>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <BotaoLink
              href={linkAncora(ctx, ancoras.solicitar)}
              evento="clique_solicitar"
              local="hero"
              icone="seta"
              className="w-full sm:w-auto"
            >
              {hero.botaoPrincipal}
            </BotaoLink>
            <BotaoLink
              href={linkAncora(ctx, ancoras.comoFunciona)}
              variante="secundario"
              className="w-full sm:w-auto"
            >
              {hero.botaoSecundario}
            </BotaoLink>
          </div>
          <p className="m-0 flex max-w-[34rem] items-start gap-2 text-[0.9rem] text-texto-2">
            <Icone nome="planilha" tamanho={18} className="mt-[2px] shrink-0 text-azul" />
            {hero.auxiliar}
          </p>
        </div>
        <PainelDemo />
      </div>
    </section>
  );
}
