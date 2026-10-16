import { ancoras, perguntas } from "@/conteudo/site";
import type { ContextoSite } from "../contexto";
import { Icone } from "../ui/Icone";
import { Faixa } from "../ui/basicos";

export function PerguntasFrequentes({ ctx }: { ctx: ContextoSite }) {
  return (
    <Faixa id={ancoras.perguntas} rotulo="titulo-perguntas" className="bg-fundo-2 py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-3">
          <p className="sobretitulo">{perguntas.sobretitulo}</p>
          <h2 id="titulo-perguntas" className="titulo-secao m-0">
            {perguntas.titulo}
          </h2>
        </div>
        <div className="divide-y divide-borda border-y border-borda">
          {perguntas.itens.map((item, indice) => (
            <details key={item.pergunta} className="group" id={`pergunta-${indice + 1}`}>
              <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-[1.0625rem] font-semibold leading-snug text-titulo">
                {item.pergunta}
                <Icone
                  nome="chevron"
                  tamanho={20}
                  className="shrink-0 text-texto-3 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="flex max-w-[46rem] flex-col gap-2 pb-5 text-texto-2">
                <p className="m-0">{item.resposta}</p>
                {"link" in item && item.link === "privacidade" ? (
                  <a
                    href={ctx.urlPrivacidade}
                    className="self-start font-medium text-azul underline underline-offset-2 hover:text-azul-forte"
                  >
                    Ler a política de privacidade
                  </a>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Faixa>
  );
}
