import { ancoras, demonstracao } from "@/conteudo/site";
import { descreverPrazo, formatarData, situacaoDoPrazo } from "@/lib/datas";
import { Icone } from "../ui/Icone";
import { Faixa, Selo, SituacaoPrazo, TituloSecao } from "../ui/basicos";

export function Demonstracao() {
  const { referencia, colunas } = demonstracao;
  const linhas = demonstracao.linhas.map((linha) => ({
    ...linha,
    situacao: situacaoDoPrazo(referencia, linha.proximo),
    prazo: descreverPrazo(referencia, linha.proximo),
  }));

  return (
    <Faixa id={ancoras.demonstracao} rotulo="titulo-demonstracao" className="bg-fundo-2 py-16 md:py-24">
      <TituloSecao
        id="titulo-demonstracao"
        sobretitulo={demonstracao.sobretitulo}
        titulo={demonstracao.titulo}
        introducao={demonstracao.introducao}
      />

      <div className="mt-10 overflow-hidden rounded-cartao border border-borda bg-superficie shadow-cartao">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-borda px-5 py-4 md:px-6">
          <div className="min-w-0">
            <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-texto-3">{colunas.condominio}</p>
            <p className="titulo-cartao m-0 mt-0.5">{demonstracao.condominio}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="dados text-[0.78rem] text-texto-2">Situação em {formatarData(referencia)}</span>
            <Selo icone="info" className="border border-borda bg-fundo-2 text-texto-2">
              {demonstracao.selo}
            </Selo>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left text-[0.9rem]">
            <caption className="sr-only">
              Exemplo de calendário de manutenção do {demonstracao.condominio}, com dados fictícios
            </caption>
            <thead>
              <tr className="bg-superficie-2 text-[0.72rem] uppercase tracking-[0.06em] text-texto-3">
                <th scope="col" className="px-6 py-3 font-semibold">{colunas.servico}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{colunas.ultima}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{colunas.proximo}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{colunas.responsavel}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{colunas.situacao}</th>
                <th scope="col" className="px-6 py-3 font-semibold">{colunas.registro}</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.servico} className="border-t border-borda align-top">
                  <th scope="row" className="max-w-[15rem] px-6 py-4 font-semibold text-titulo">{linha.servico}</th>
                  <td className="dados whitespace-nowrap px-4 py-4 text-texto-2">{formatarData(linha.ultima)}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="dados text-titulo">{formatarData(linha.proximo)}</span>
                    <span className="mt-0.5 block text-[0.78rem] text-texto-3">{linha.prazo}</span>
                  </td>
                  <td className="max-w-[12rem] px-4 py-4 text-texto">{linha.responsavel}</td>
                  <td className="px-4 py-4">
                    <SituacaoPrazo situacao={linha.situacao} />
                  </td>
                  <td className="max-w-[16rem] px-6 py-4 text-texto-2">{linha.registro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="m-0 list-none divide-y divide-borda p-0 lg:hidden">
          {linhas.map((linha) => (
            <li key={linha.servico} className="flex flex-col gap-4 px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <p className="m-0 min-w-0 font-semibold leading-snug text-titulo">{linha.servico}</p>
                <SituacaoPrazo situacao={linha.situacao} />
              </div>
              <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-[0.9rem]">
                <div className="min-w-0">
                  <dt className="text-[0.75rem] text-texto-3">{colunas.ultima}</dt>
                  <dd className="dados m-0 text-texto-2">{formatarData(linha.ultima)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[0.75rem] text-texto-3">{colunas.proximo}</dt>
                  <dd className="m-0">
                    <span className="dados text-titulo">{formatarData(linha.proximo)}</span>
                    <span className="block text-[0.78rem] text-texto-3">{linha.prazo}</span>
                  </dd>
                </div>
                <div className="col-span-2 min-w-0">
                  <dt className="text-[0.75rem] text-texto-3">{colunas.responsavel}</dt>
                  <dd className="m-0 text-texto">{linha.responsavel}</dd>
                </div>
                <div className="col-span-2 min-w-0">
                  <dt className="text-[0.75rem] text-texto-3">{colunas.registro}</dt>
                  <dd className="m-0 text-texto-2">{linha.registro}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>

      <ul className="m-0 mt-5 flex list-none flex-wrap gap-x-6 gap-y-2.5 p-0 text-[0.86rem] text-texto-2">
        {demonstracao.legenda.map((item) => (
          <li key={item.situacao} className="flex items-center gap-2">
            <SituacaoPrazo situacao={item.situacao} />
            {item.texto}
          </li>
        ))}
      </ul>

      <p className="m-0 mt-6 flex max-w-[52rem] items-start gap-2.5 text-[0.88rem] text-texto-2">
        <Icone nome="alerta" tamanho={17} className="mt-[3px] shrink-0 text-texto-3" />
        {demonstracao.aviso}
      </p>
    </Faixa>
  );
}
