import { painelDemo, rotulosSituacao } from "@/conteudo/site";
import { descreverPrazo, diasEntre, formatarData, formatarDiaMes, situacaoDoPrazo, type Situacao } from "@/lib/datas";
import { Icone } from "../ui/Icone";
import { SituacaoPrazo, corDoPonto, juntar } from "../ui/basicos";

/**
 * Ilustração do topo: um painel de carteira de condomínios com dados fictícios.
 * As posições na régua são calculadas a partir das datas, na mesma escala.
 */
export function PainelDemo() {
  const { referencia, janelaDias, contagens, prazos, historico } = painelDemo;
  const largura = janelaDias.fim - janelaDias.inicio;
  const posicao = (dias: number) => `${(((dias - janelaDias.inicio) / largura) * 100).toFixed(2)}%`;

  const itens = prazos
    .map((p) => ({ ...p, dias: diasEntre(referencia, p.vencimento), situacao: situacaoDoPrazo(referencia, p.vencimento) }))
    .sort((a, b) => a.dias - b.dias);
  const condominios = new Set([...prazos.map((p) => p.condominio), ...historico.map((h) => h.condominio)]).size;
  const marcas = [0, 15, 30, 45, 60];

  const resumo: { situacao: Situacao; total: number }[] = [
    { situacao: "em_dia", total: contagens.em_dia },
    { situacao: "proximo", total: contagens.proximo },
    { situacao: "atrasado", total: contagens.atrasado },
  ];

  const descricao =
    `Demonstração com dados fictícios: painel de uma carteira de ${condominios} condomínios, com ` +
    `${contagens.em_dia} itens em dia, ${contagens.proximo} próximos do vencimento e ${contagens.atrasado} atrasado, ` +
    "uma régua dos próximos 60 dias e a lista dos próximos vencimentos.";

  return (
    <figure
      role="img"
      aria-label={descricao}
      className="m-0 min-w-0 overflow-hidden rounded-[14px] border border-borda bg-superficie text-texto shadow-painel"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-marinho px-5 py-4">
        <div className="min-w-0">
          <p className="text-[0.95rem] font-semibold leading-tight text-sobre-marinho">{painelDemo.titulo}</p>
          <p className="dados mt-1 text-[0.72rem] text-sobre-marinho-2">
            {condominios} condomínios · situação em {formatarData(referencia)}
          </p>
        </div>
        <span className="rounded-full border border-sobre-marinho-2/40 px-2.5 py-1 text-[0.7rem] font-semibold leading-none text-sobre-marinho">
          {painelDemo.selo}
        </span>
      </div>

      <dl className="grid grid-cols-3 border-b border-borda">
        {resumo.map((r, indice) => (
          <div key={r.situacao} className={juntar("flex flex-col gap-1.5 px-4 py-3.5", indice > 0 && "border-l border-borda")}>
            <dt className="flex items-start gap-1.5 text-[0.72rem] font-medium leading-tight text-texto-2">
              <span aria-hidden="true" className={juntar("mt-[3px] size-2 shrink-0 rounded-full", corDoPonto[r.situacao])} />
              {rotulosSituacao[r.situacao]}
            </dt>
            <dd className="dados m-0 text-[1.55rem] font-medium leading-none text-titulo">{r.total}</dd>
          </div>
        ))}
      </dl>

      <div className="border-b border-borda px-5 pb-4 pt-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-texto-3">Próximos 60 dias</p>
        <div className="relative mx-1 mt-3 h-10">
          <div
            aria-hidden="true"
            className="absolute left-0 top-[7px] h-[10px] rounded-l-full bg-vermelho-fundo"
            style={{ width: posicao(0) }}
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-3 h-px bg-borda-forte" />
          {marcas.map((dia) => (
            <div key={dia} aria-hidden="true" className="absolute top-[9px] h-2 w-px bg-borda-forte" style={{ left: posicao(dia) }} />
          ))}
          <div aria-hidden="true" className="absolute top-0 h-[26px] w-[2px] -translate-x-1/2 rounded-full bg-titulo" style={{ left: posicao(0) }} />
          {itens.map((item) => (
            <span
              key={item.item + item.vencimento}
              aria-hidden="true"
              className={juntar(
                "absolute top-3 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[2.5px] ring-superficie",
                corDoPonto[item.situacao],
              )}
              style={{ left: posicao(item.dias) }}
            />
          ))}
          {marcas.map((dia, indice) => (
            <span
              key={`r${dia}`}
              aria-hidden="true"
              className={juntar(
                "dados absolute top-[22px] whitespace-nowrap text-[0.66rem] text-texto-3",
                indice === marcas.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
                dia === 0 && "font-semibold text-titulo",
              )}
              style={{ left: posicao(dia) }}
            >
              {dia === 0 ? "hoje" : indice === marcas.length - 1 ? `${dia} dias` : dia}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-texto-3">Próximos vencimentos</p>
      </div>
      <ul className="m-0 list-none divide-y divide-borda p-0">
        {itens
          .filter((item) => item.situacao !== "em_dia")
          .map((item) => (
            <li key={item.item + item.vencimento} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-3 px-5 py-3">
              <span className="dados text-[0.8rem] text-texto-2">{formatarDiaMes(item.vencimento)}</span>
              <span className="min-w-0">
                <span className="block text-[0.86rem] font-semibold leading-snug text-titulo">
                  {item.item} · {item.servico}
                </span>
                <span className="block text-[0.76rem] leading-snug text-texto-3">
                  {item.condominio} · {descreverPrazo(referencia, item.vencimento)}
                </span>
              </span>
              <SituacaoPrazo situacao={item.situacao} curta />
            </li>
          ))}
      </ul>

      <div className="border-t border-borda bg-superficie-2 px-5 py-4">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-texto-3">Histórico recente</p>
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
          {historico.map((h) => (
            <li key={h.item + h.data} className="flex items-start gap-2.5 text-[0.8rem] leading-snug">
              <Icone nome="check" tamanho={15} espessura={2.4} className="mt-[2px] shrink-0 text-verde" />
              <span className="min-w-0">
                <span className="dados text-texto-2">{formatarDiaMes(h.data)}</span>{" "}
                <span className="font-medium text-texto">
                  {h.item} · {h.servico}
                </span>{" "}
                <span className="text-texto-3">· {h.condominio}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
