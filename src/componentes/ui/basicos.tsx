import type { ReactNode } from "react";
import { rotulosSituacao } from "@/conteudo/site";
import type { Situacao } from "@/lib/datas";
import { Icone, type NomeIcone } from "./Icone";

export function juntar(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Faixa de largura total com conteúdo centralizado e margem lateral segura. */
export function Faixa({
  id,
  children,
  className,
  interno,
  rotulo,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  interno?: string;
  rotulo?: string;
}) {
  return (
    <section id={id} aria-labelledby={rotulo} className={juntar("margem-lateral", className)}>
      <div className={juntar("mx-auto w-full max-w-[74rem]", interno)}>{children}</div>
    </section>
  );
}

export function TituloSecao({
  id,
  sobretitulo,
  titulo,
  introducao,
  centralizado,
}: {
  id: string;
  sobretitulo: string;
  titulo: string;
  introducao?: string;
  centralizado?: boolean;
}) {
  return (
    <div className={juntar("flex max-w-[46rem] flex-col gap-3", centralizado && "mx-auto items-center text-center")}>
      <p className="sobretitulo">{sobretitulo}</p>
      <h2 id={id} className="titulo-secao">
        {titulo}
      </h2>
      {introducao ? <p className="max-w-[40rem] text-[1.0625rem] text-texto-2">{introducao}</p> : null}
    </div>
  );
}

type VarianteBotao = "primario" | "secundario" | "claro";

const estilosBotao: Record<VarianteBotao, string> = {
  primario:
    "bg-azul text-sobre-azul shadow-leve hover:bg-azul-forte active:translate-y-px",
  secundario:
    "border border-borda-forte bg-superficie text-titulo hover:border-azul hover:text-azul active:translate-y-px",
  claro: "bg-sobre-marinho text-marinho hover:bg-azul-suave active:translate-y-px",
};

/** Link com aparência de botão (todas as ações da página levam a uma seção). */
export function BotaoLink({
  href,
  children,
  variante = "primario",
  evento,
  local,
  className,
  icone,
}: {
  href: string;
  children: ReactNode;
  variante?: VarianteBotao;
  evento?: string;
  local?: string;
  className?: string;
  icone?: NomeIcone;
}) {
  return (
    <a
      href={href}
      data-evento={evento}
      data-local={local}
      className={juntar(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-botao px-5 py-2.5 text-[0.975rem] font-semibold transition-colors duration-150",
        estilosBotao[variante],
        className,
      )}
    >
      {children}
      {icone ? <Icone nome={icone} tamanho={18} espessura={2} /> : null}
    </a>
  );
}

export function Selo({ children, icone, className }: { children: ReactNode; icone?: NomeIcone; className?: string }) {
  return (
    <span
      className={juntar(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] font-semibold leading-none",
        className,
      )}
    >
      {icone ? <Icone nome={icone} tamanho={13} espessura={2.2} /> : null}
      {children}
    </span>
  );
}

const estilosSituacao: Record<Situacao, { classe: string; icone: NomeIcone }> = {
  em_dia: { classe: "bg-verde-fundo text-verde", icone: "check-circulo" },
  proximo: { classe: "bg-ambar-fundo text-ambar", icone: "relogio" },
  atrasado: { classe: "bg-vermelho-fundo text-vermelho", icone: "alerta" },
};

/** Situação de um prazo: sempre cor + ícone + texto, nunca só cor. */
export function SituacaoPrazo({ situacao, curta }: { situacao: Situacao; curta?: boolean }) {
  const estilo = estilosSituacao[situacao];
  const texto = curta && situacao === "proximo" ? "Próximo" : rotulosSituacao[situacao];
  return (
    <Selo icone={estilo.icone} className={estilo.classe}>
      {texto}
    </Selo>
  );
}

export const corDoPonto: Record<Situacao, string> = {
  em_dia: "bg-verde-ponto",
  proximo: "bg-ambar-ponto",
  atrasado: "bg-vermelho-ponto",
};

/** Logotipo tipográfico. */
export function Logo({ className, claro }: { className?: string; claro?: boolean }) {
  return (
    <span
      className={juntar(
        "inline-flex items-baseline text-[1.4rem] font-[680] leading-none tracking-[-0.035em] [font-stretch:82%]",
        claro ? "text-sobre-marinho" : "text-titulo",
        className,
      )}
    >
      Condomínios
      <span aria-hidden="true" className="ml-[0.08em] inline-block size-[0.3em] rounded-[2px] bg-azul" />
    </span>
  );
}
