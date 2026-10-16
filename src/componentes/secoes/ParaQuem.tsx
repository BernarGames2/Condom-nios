import { ancoras, paraQuem } from "@/conteudo/site";
import { Icone } from "../ui/Icone";
import { Faixa, TituloSecao } from "../ui/basicos";

export function ParaQuem() {
  return (
    <Faixa id={ancoras.paraQuem} rotulo="titulo-para-quem" className="py-16 md:py-24">
      <TituloSecao id="titulo-para-quem" sobretitulo={paraQuem.sobretitulo} titulo={paraQuem.titulo} />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {paraQuem.publicos.map((publico) => (
          <article key={publico.titulo} className="flex flex-col gap-4 rounded-cartao border border-borda bg-superficie p-6 md:p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-[10px] bg-marinho text-sobre-marinho">
              <Icone nome={publico.icone} tamanho={22} />
            </span>
            <h3 className="titulo-cartao m-0 text-[1.375rem]">{publico.titulo}</h3>
            <p className="m-0 text-[1.0625rem] text-texto-2">{publico.texto}</p>
            <ul className="m-0 mt-1 flex list-none flex-col gap-2.5 border-t border-borda p-0 pt-5">
              {publico.pontos.map((ponto) => (
                <li key={ponto} className="flex items-start gap-2.5">
                  <Icone nome="check" tamanho={18} espessura={2.4} className="mt-[3px] shrink-0 text-verde" />
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="m-0 mt-6 flex max-w-[50rem] items-start gap-3 text-texto-2">
        <Icone nome="capacete" tamanho={20} className="mt-[2px] shrink-0 text-texto-3" />
        {paraQuem.observacao}
      </p>
    </Faixa>
  );
}
