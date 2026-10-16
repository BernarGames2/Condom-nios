import { ancoras, comoFunciona } from "@/conteudo/site";
import { Icone } from "../ui/Icone";
import { Faixa, TituloSecao, juntar } from "../ui/basicos";

export function ComoFunciona() {
  const total = comoFunciona.etapas.length;
  return (
    <Faixa id={ancoras.comoFunciona} rotulo="titulo-como-funciona" className="py-16 md:py-24">
      <TituloSecao
        id="titulo-como-funciona"
        sobretitulo={comoFunciona.sobretitulo}
        titulo={comoFunciona.titulo}
        introducao={comoFunciona.introducao}
      />
      <ol className="m-0 mt-12 grid list-none gap-9 p-0 md:grid-cols-3 md:gap-8">
        {comoFunciona.etapas.map((etapa, indice) => (
          <li key={etapa.titulo} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="dados inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-azul bg-superficie text-[0.95rem] font-semibold text-azul">
                {indice + 1}
              </span>
              <span
                aria-hidden="true"
                className={juntar("hidden h-px flex-1 bg-borda-forte md:block", indice === total - 1 && "md:invisible")}
              />
            </div>
            <h3 className="titulo-cartao m-0">{etapa.titulo}</h3>
            <p className="m-0 text-texto-2">{etapa.texto}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex items-start gap-3 rounded-cartao border border-azul-borda bg-azul-suave p-5 md:p-6">
        <Icone nome="info" tamanho={20} className="mt-[2px] shrink-0 text-azul" />
        <p className="m-0 max-w-[52rem] text-texto">{comoFunciona.aviso}</p>
      </div>
    </Faixa>
  );
}
