import { ancoras, recursos } from "@/conteudo/site";
import { Icone } from "../ui/Icone";
import { Faixa, Selo, TituloSecao } from "../ui/basicos";

/** Funções futuras: borda tracejada e selo "Em planejamento", sem nenhum botão. */
export function RecursosPlanejados() {
  return (
    <Faixa id={ancoras.recursos} rotulo="titulo-recursos" className="py-16 md:py-24">
      <TituloSecao
        id="titulo-recursos"
        sobretitulo={recursos.sobretitulo}
        titulo={recursos.titulo}
        introducao={recursos.introducao}
      />
      <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {recursos.itens.map((item) => (
          <li key={item.titulo} className="flex flex-col gap-3 rounded-cartao border border-dashed border-borda-forte p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-texto-2">
                <Icone nome={item.icone} tamanho={22} />
              </span>
              <Selo icone="ampulheta" className="bg-fundo-2 text-texto-2">
                {recursos.selo}
              </Selo>
            </div>
            <h3 className="titulo-cartao m-0 text-[1.03rem]">{item.titulo}</h3>
            <p className="m-0 text-[0.93rem] text-texto-2">{item.texto}</p>
          </li>
        ))}
      </ul>
    </Faixa>
  );
}
