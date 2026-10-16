import { ancoras, chamadaFinal } from "@/conteudo/site";
import { linkAncora, type ContextoSite } from "../contexto";
import { BotaoLink } from "../ui/basicos";

export function ChamadaFinal({ ctx }: { ctx: ContextoSite }) {
  return (
    <section aria-labelledby="titulo-final" className="margem-lateral bg-marinho">
      <div className="mx-auto flex w-full max-w-[74rem] flex-col items-start gap-7 py-16 md:flex-row md:items-center md:justify-between md:gap-12 md:py-20">
        <div className="flex max-w-[40rem] flex-col gap-3">
          <h2 id="titulo-final" className="titulo-secao m-0 text-sobre-marinho!">
            {chamadaFinal.titulo}
          </h2>
          <p className="m-0 text-[1.0625rem] text-sobre-marinho-2">{chamadaFinal.texto}</p>
        </div>
        <BotaoLink
          href={linkAncora(ctx, ancoras.solicitar)}
          variante="claro"
          evento="clique_solicitar"
          local="chamada_final"
          icone="seta"
          className="w-full shrink-0 sm:w-auto"
        >
          {chamadaFinal.botao}
        </BotaoLink>
      </div>
    </section>
  );
}
