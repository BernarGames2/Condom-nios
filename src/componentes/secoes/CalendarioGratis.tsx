import { ancoras, calendario } from "@/conteudo/site";
import type { ContextoSite } from "../contexto";
import { FormularioPedido } from "../formulario/FormularioPedido";
import { Icone } from "../ui/Icone";
import { TituloSecao } from "../ui/basicos";

/**
 * Principal seção de conversão: oferta do calendário grátis + formulário.
 * No celular, o formulário vem logo depois da oferta; no computador, fica na coluna da direita.
 */
export function CalendarioGratis({ ctx }: { ctx: ContextoSite }) {
  const passos = calendario.passos[ctx.modo];
  return (
    <section
      id={ancoras.solicitar}
      aria-labelledby="titulo-solicitar"
      className="margem-lateral border-y border-azul-borda bg-azul-suave py-16 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-[74rem] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-8">
        <div className="flex min-w-0 flex-col gap-7 lg:col-start-1 lg:row-start-1">
          <TituloSecao
            id="titulo-solicitar"
            sobretitulo={calendario.sobretitulo}
            titulo={calendario.titulo}
            introducao={calendario.descricao}
          />
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {calendario.beneficios.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-3 text-[1.0625rem] text-texto">
                <span className="mt-[2px] inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-verde-fundo text-verde">
                  <Icone nome="check" tamanho={15} espessura={2.6} />
                </span>
                {beneficio}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <FormularioPedido ctx={ctx} />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-2">
          <div className="rounded-cartao border border-azul-borda bg-superficie p-5 md:p-6">
            <h3 className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-texto-3">
              {calendario.passosTitulo}
            </h3>
            <ol className="m-0 mt-4 flex list-none flex-col gap-3.5 p-0">
              {passos.map((passo, indice) => (
                <li key={passo} className="flex items-start gap-3">
                  <span className="dados mt-[1px] inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-marinho text-[0.78rem] font-semibold text-sobre-marinho">
                    {indice + 1}
                  </span>
                  <span className="text-texto-2">{passo}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="m-0 flex items-start gap-2.5 text-[0.95rem] text-texto-2">
            <Icone nome="cadeado" tamanho={18} className="mt-[2px] shrink-0 text-azul" />
            {calendario.condicoes}
          </p>
        </div>
      </div>
    </section>
  );
}
