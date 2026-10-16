import { ancoras, problema } from "@/conteudo/site";
import { Icone } from "../ui/Icone";
import { Faixa, TituloSecao } from "../ui/basicos";

export function Problema() {
  return (
    <Faixa id={ancoras.problema} rotulo="titulo-problema" className="bg-fundo-2 py-16 md:py-24">
      <TituloSecao id="titulo-problema" sobretitulo={problema.sobretitulo} titulo={problema.titulo} />
      <ul className="m-0 mt-12 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-8">
        {problema.itens.map((item) => (
          <li key={item.titulo} className="flex flex-col gap-3 border-t-2 border-titulo pt-5">
            <span className="inline-flex size-10 items-center justify-center rounded-[10px] bg-superficie text-azul shadow-leve ring-1 ring-borda">
              <Icone nome={item.icone} tamanho={21} />
            </span>
            <h3 className="titulo-cartao m-0">{item.titulo}</h3>
            <p className="m-0 text-texto-2">{item.texto}</p>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-12 flex max-w-[44rem] items-start gap-3 text-[1.125rem] font-medium leading-snug text-titulo md:text-[1.25rem]">
        <Icone nome="seta" tamanho={22} espessura={2} className="mt-[3px] shrink-0 text-azul" />
        {problema.fechamento}
      </p>
    </Faixa>
  );
}
