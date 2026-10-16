import { atualizadaEm, secoesPrivacidade } from "@/conteudo/privacidade";
import type { ContextoSite } from "./contexto";

/** Texto da política, usado na página /privacidade e no fim da versão do Claude. */
export function TextoPrivacidade({ ctx, nivelTitulo = 2 }: { ctx: ContextoSite; nivelTitulo?: 2 | 3 }) {
  const secoes = secoesPrivacidade({
    canal: ctx.modo === "servidor" ? "planilha" : "email",
    hospedagem: ctx.hospedagem,
    artefato: ctx.artefato,
    responsavel: ctx.responsavel,
    email: ctx.contatoEmail,
  });
  const Titulo = nivelTitulo === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-8">
      <p className="dados m-0 text-[0.82rem] text-texto-3">Atualizada em {atualizadaEm}</p>
      {secoes.map((secao) => (
        <section key={secao.titulo} className="flex flex-col gap-3">
          <Titulo className="titulo-cartao m-0 text-[1.2rem]">{secao.titulo}</Titulo>
          {secao.itens ? (
            <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-texto-2 marker:text-texto-3">
              {secao.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {secao.paragrafos?.map((paragrafo) => (
            <p key={paragrafo} className="m-0 max-w-[44rem] text-texto-2">
              {paragrafo}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
