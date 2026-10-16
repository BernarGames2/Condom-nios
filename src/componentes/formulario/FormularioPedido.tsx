"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { formulario } from "@/conteudo/site";
import { registrarEvento } from "@/lib/eventos";
import { idParaFoco, lerCampos, novoId, selecionarTexto } from "@/lib/formulario-dom";
import {
  ASSUNTO_PEDIDO,
  DIFICULDADES,
  LIMITES,
  ORDEM_CAMPOS,
  PERFIS,
  QUANTIDADES,
  lerOrigem,
  linksDoEmail,
  montarMensagemPedido,
  validarPedido,
  type CampoPedido,
  type ErrosPedido,
  type Origem,
} from "@/lib/pedido";
import type { ContextoSite } from "../contexto";
import { Icone } from "../ui/Icone";
import { juntar } from "../ui/basicos";

type Estado = "editando" | "enviando" | "sucesso";

/** E-mail pronto para a pessoa enviar (modo "email"). */
interface EnvioEmail {
  corpo: string;
  gmail: string;
  app: string;
}

const classeEntrada =
  "block w-full rounded-botao border border-borda-forte bg-superficie px-3.5 py-2.5 text-[1rem] text-texto shadow-leve transition-colors placeholder:text-texto-3 hover:border-texto-3 focus:border-azul focus:outline-2 focus:outline-offset-0 focus:outline-azul aria-[invalid=true]:border-vermelho";

function Rotulo({ htmlFor, children, opcional }: { htmlFor: string; children: ReactNode; opcional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[0.92rem] font-semibold text-titulo">
      {children}
      {opcional ? <span className="ml-1.5 font-normal text-texto-3">({formulario.opcional})</span> : null}
    </label>
  );
}

function MensagemErro({ campo, erro }: { campo: CampoPedido; erro?: string }) {
  return (
    <p id={`erro-${campo}`} hidden={!erro} className="m-0 flex items-start gap-1.5 text-[0.86rem] font-medium text-vermelho">
      <Icone nome="alerta" tamanho={15} espessura={2.2} className="mt-[3px] shrink-0" />
      <span data-texto-erro="">{erro}</span>
    </p>
  );
}

function Ajuda({ campo, children }: { campo: CampoPedido; children: ReactNode }) {
  return (
    <p id={`ajuda-${campo}`} className="m-0 text-[0.84rem] text-texto-2">
      {children}
    </p>
  );
}

function descritoPor(campo: CampoPedido, temAjuda: boolean): string {
  return [temAjuda ? `ajuda-${campo}` : "", `erro-${campo}`].filter(Boolean).join(" ");
}

/**
 * Campo de texto. Em linhas de duas colunas, usa subgrid para alinhar as caixas
 * mesmo quando um rótulo ocupa duas linhas e o outro, uma.
 */
function CampoTexto({
  campo,
  rotulo,
  tipo = "text",
  autocomplete,
  inputMode,
  opcional,
  ajuda,
  erro,
  maximo,
}: {
  campo: CampoPedido;
  rotulo: string;
  tipo?: string;
  autocomplete?: string;
  inputMode?: "email" | "tel" | "text";
  opcional?: boolean;
  ajuda?: string;
  erro?: string;
  maximo: number;
}) {
  return (
    <div className="grid min-w-0 content-start gap-1.5 sm:row-span-3 sm:grid-rows-subgrid" data-campo={campo}>
      <div className="flex flex-col gap-1 self-end">
        <Rotulo htmlFor={`campo-${campo}`} opcional={opcional}>
          {rotulo}
        </Rotulo>
        {ajuda ? <Ajuda campo={campo}>{ajuda}</Ajuda> : null}
      </div>
      <input
        id={`campo-${campo}`}
        name={campo}
        type={tipo}
        autoComplete={autocomplete}
        inputMode={inputMode}
        maxLength={maximo}
        required={!opcional}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(campo, Boolean(ajuda))}
        className={classeEntrada}
      />
      <MensagemErro campo={campo} erro={erro} />
    </div>
  );
}

function GrupoOpcoes({
  campo,
  legenda,
  opcoes,
  erro,
  colunas,
  classeOpcao = "px-3 text-[0.95rem]",
}: {
  campo: "perfil" | "quantidade";
  legenda: string;
  opcoes: readonly { valor: string; rotulo: string }[];
  erro?: string;
  colunas: string;
  classeOpcao?: string;
}) {
  return (
    <fieldset
      className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0"
      data-campo={campo}
      aria-describedby={`erro-${campo}`}
      aria-invalid={erro ? true : undefined}
    >
      <legend className="mb-2 p-0 text-[0.92rem] font-semibold text-titulo">{legenda}</legend>
      <div className={juntar("grid gap-2", colunas)}>
        {opcoes.map((opcao, indice) => (
          <label
            key={opcao.valor}
            className={juntar(
              "relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-botao border border-borda-forte bg-superficie py-2 text-center font-medium leading-tight text-texto shadow-leve transition-colors hover:border-texto-3 has-checked:border-azul has-checked:bg-azul-suave has-checked:text-titulo has-checked:shadow-[inset_0_0_0_1px_var(--azul)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-azul",
              classeOpcao,
            )}
          >
            <input
              id={`campo-${campo}-${indice}`}
              type="radio"
              name={campo}
              value={opcao.valor}
              required
              className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
            />
            <Icone nome="check" tamanho={15} espessura={2.6} className="hidden shrink-0 text-azul peer-checked:block" />
            <span>{opcao.rotulo}</span>
          </label>
        ))}
      </div>
      <MensagemErro campo={campo} erro={erro} />
    </fieldset>
  );
}

export function FormularioPedido({ ctx }: { ctx: ContextoSite }) {
  const [erros, setErros] = useState<ErrosPedido>({});
  const [estado, setEstado] = useState<Estado>("editando");
  const [erroGeral, setErroGeral] = useState("");
  const [envio, setEnvio] = useState<EnvioEmail | null>(null);
  const idRef = useRef("");
  const inicioRef = useRef(0);
  const origemRef = useRef<Origem | null>(null);
  const comecouRef = useRef(false);
  const sucessoRef = useRef<HTMLHeadingElement>(null);
  const emailModo = ctx.modo === "email";
  const campos = formulario.campos;

  useEffect(() => {
    idRef.current = novoId();
    inicioRef.current = Date.now();
    origemRef.current = lerOrigem(window.location.hash, window.location.search);
  }, []);

  useEffect(() => {
    if (estado === "sucesso") sucessoRef.current?.focus();
  }, [estado]);

  const quantidadeErros = Object.keys(erros).length;

  function mostrarErros(novos: ErrosPedido) {
    setErros(novos);
    const primeiro = ORDEM_CAMPOS.find((campo) => novos[campo]);
    if (primeiro) {
      requestAnimationFrame(() => document.getElementById(idParaFoco(primeiro))?.focus());
    }
  }

  function textoDoErro(codigo: unknown): string {
    const mapa: Record<string, string> = {
      rapido: formulario.erros.rapido,
      limite: formulario.erros.limite,
      indisponivel: formulario.erros.indisponivel,
      falha: formulario.erros.falha,
    };
    const base = (typeof codigo === "string" && mapa[codigo]) || formulario.erros.geral;
    return ctx.contatoEmail ? `${base} ${formulario.erros.alternativa(ctx.contatoEmail)}` : base;
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (estado === "enviando") return;

    const dados = lerCampos(evento.currentTarget);
    const validacao = validarPedido(dados);
    if (!validacao.ok) {
      setErroGeral("");
      mostrarErros(validacao.erros);
      registrarEvento("erro_formulario", { tipo: "validacao", campos: Object.keys(validacao.erros).join(",") });
      return;
    }

    setErros({});
    setErroGeral("");

    if (emailModo) {
      // Sem servidor configurado: prepara o e-mail; a pessoa envia pelo Gmail ou pelo aplicativo dela.
      const corpo = montarMensagemPedido(validacao.pedido, origemRef.current);
      setEnvio({ corpo, ...linksDoEmail(ctx.contatoEmail, corpo) });
      registrarEvento("email_preparado", {
        perfil: validacao.pedido.perfil,
        quantidade: validacao.pedido.quantidade,
        origem: origemRef.current ?? "nao_informada",
      });
      return;
    }

    setEstado("enviando");

    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validacao.pedido,
          id: idRef.current,
          inicio: inicioRef.current,
          origem: origemRef.current ?? "",
          site: typeof dados.site === "string" ? dados.site : "",
        }),
      });
      const corpo = (await resposta.json().catch(() => null)) as
        | { ok?: boolean; erro?: string; campos?: ErrosPedido }
        | null;

      if (resposta.ok && corpo?.ok) {
        setEstado("sucesso");
        registrarEvento("envio_sucesso", {
          perfil: validacao.pedido.perfil,
          quantidade: validacao.pedido.quantidade,
          origem: origemRef.current ?? "nao_informada",
        });
        return;
      }

      setEstado("editando");
      if (corpo?.erro === "validacao" && corpo.campos) {
        mostrarErros(corpo.campos);
      } else {
        setErroGeral(textoDoErro(corpo?.erro));
      }
      registrarEvento("erro_formulario", { tipo: corpo?.erro ?? `http_${resposta.status}` });
    } catch {
      setEstado("editando");
      setErroGeral(
        ctx.contatoEmail
          ? `${formulario.erros.rede} ${formulario.erros.alternativa(ctx.contatoEmail)}`
          : formulario.erros.rede,
      );
      registrarEvento("erro_formulario", { tipo: "rede" });
    }
  }

  function aoMudar(evento: FormEvent<HTMLFormElement>) {
    const nome = (evento.target as HTMLInputElement).name as CampoPedido;
    if (nome && erros[nome]) {
      setErros((atuais) => {
        const copia = { ...atuais };
        delete copia[nome];
        return copia;
      });
    }
  }

  function aoFocar() {
    if (comecouRef.current) return;
    comecouRef.current = true;
    registrarEvento("inicio_formulario");
  }

  if (estado === "sucesso") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-cartao border border-borda bg-superficie p-6 shadow-cartao md:p-8">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-verde-fundo text-verde">
          <Icone nome="check-circulo" tamanho={26} />
        </span>
        <h3 ref={sucessoRef} tabIndex={-1} className="titulo-secao m-0 text-[1.75rem] outline-none">
          {formulario.sucesso.titulo}
        </h3>
        <p className="m-0 text-[1.0625rem] text-texto-2">{formulario.sucesso.texto}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-cartao border border-borda bg-superficie p-5 shadow-cartao sm:p-6 md:p-8" id="cartao-pedido">
      <form
        id="form-pedido"
        noValidate
        onSubmit={aoEnviar}
        onChange={aoMudar}
        onFocus={aoFocar}
        hidden={Boolean(envio)}
        {...(emailModo ? (ctx.artefato ? {} : { method: "post" }) : { action: "/api/pedidos", method: "post" })}
        className="flex flex-col gap-5"
        aria-labelledby="titulo-formulario"
      >
        <div className="flex flex-col gap-1">
          <h3 id="titulo-formulario" className="titulo-cartao m-0 text-[1.3rem]">
            {formulario.titulo}
          </h3>
          <p className="m-0 text-[0.86rem] text-texto-2">{formulario.obrigatorios}</p>
        </div>

        <div
          id="resumo-erros"
          hidden={quantidadeErros === 0}
          className="flex items-start gap-2.5 rounded-botao border border-vermelho/40 bg-vermelho-fundo px-4 py-3 text-[0.92rem] font-medium text-vermelho"
        >
          <Icone nome="alerta" tamanho={18} espessura={2.2} className="mt-[2px] shrink-0" />
          <span data-texto-resumo="">{quantidadeErros > 0 ? formulario.resumoErros(quantidadeErros) : ""}</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-y-1.5">
          <CampoTexto campo="nome" rotulo={campos.nome.rotulo} autocomplete={campos.nome.autocomplete} erro={erros.nome} maximo={LIMITES.nome} />
          <CampoTexto
            campo="email"
            rotulo={campos.email.rotulo}
            tipo="email"
            inputMode="email"
            autocomplete={campos.email.autocomplete}
            erro={erros.email}
            maximo={LIMITES.email}
          />
        </div>

        <GrupoOpcoes campo="perfil" legenda={campos.perfil.rotulo} opcoes={PERFIS} erro={erros.perfil} colunas="grid-cols-1 sm:grid-cols-3" />

        <GrupoOpcoes
          campo="quantidade"
          legenda={campos.quantidade.rotulo}
          opcoes={QUANTIDADES}
          erro={erros.quantidade}
          colunas="grid-cols-3 sm:grid-cols-5"
          classeOpcao="px-1.5 text-[0.92rem] whitespace-nowrap"
        />

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-y-1.5">
          <CampoTexto
            campo="empresa"
            rotulo={campos.empresa.rotulo}
            autocomplete={campos.empresa.autocomplete}
            opcional
            erro={erros.empresa}
            maximo={LIMITES.empresa}
          />
          <CampoTexto
            campo="telefone"
            rotulo={campos.telefone.rotulo}
            tipo="tel"
            inputMode="tel"
            autocomplete={campos.telefone.autocomplete}
            opcional
            ajuda={campos.telefone.ajuda}
            erro={erros.telefone}
            maximo={LIMITES.telefone}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5" data-campo="dificuldade">
          <Rotulo htmlFor="campo-dificuldade" opcional>
            {campos.dificuldade.rotulo}
          </Rotulo>
          <div className="relative">
            <select
              id="campo-dificuldade"
              name="dificuldade"
              defaultValue=""
              aria-invalid={erros.dificuldade ? true : undefined}
              aria-describedby="erro-dificuldade"
              className={juntar(classeEntrada, "appearance-none pr-10")}
            >
              <option value="">{campos.dificuldade.vazio}</option>
              {DIFICULDADES.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
            <Icone
              nome="chevron"
              tamanho={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texto-3"
            />
          </div>
          <MensagemErro campo="dificuldade" erro={erros.dificuldade} />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5" data-campo="comentario">
          <Rotulo htmlFor="campo-comentario" opcional>
            {campos.comentario.rotulo}
          </Rotulo>
          <Ajuda campo="comentario">{campos.comentario.ajuda}</Ajuda>
          <textarea
            id="campo-comentario"
            name="comentario"
            rows={4}
            maxLength={LIMITES.comentario}
            aria-invalid={erros.comentario ? true : undefined}
            aria-describedby={descritoPor("comentario", true)}
            className={juntar(classeEntrada, "min-h-28 resize-y")}
          />
          <MensagemErro campo="comentario" erro={erros.comentario} />
        </div>

        <div className="flex items-start gap-3 rounded-botao bg-superficie-2 p-3.5" data-campo="aceitaNovidades">
          <input
            id="campo-aceitaNovidades"
            name="aceitaNovidades"
            type="checkbox"
            aria-describedby="ajuda-aceitaNovidades"
            className="mt-[3px] size-[1.15rem] shrink-0 cursor-pointer accent-[var(--azul)]"
          />
          <div className="flex flex-col gap-0.5">
            <label htmlFor="campo-aceitaNovidades" className="cursor-pointer text-[0.94rem] text-texto">
              {campos.novidades.rotulo}
            </label>
            <p id="ajuda-aceitaNovidades" className="m-0 text-[0.82rem] text-texto-2">
              {campos.novidades.ajuda}
            </p>
          </div>
        </div>

        {emailModo ? null : (
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="campo-site">Não preencha este campo</label>
            <input id="campo-site" name="site" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
        )}

        <div
          id="erro-geral"
          role="alert"
          hidden={!erroGeral}
          className="flex items-start gap-2.5 rounded-botao border border-vermelho/40 bg-vermelho-fundo px-4 py-3 text-[0.92rem] text-vermelho"
        >
          <Icone nome="alerta" tamanho={18} espessura={2.2} className="mt-[2px] shrink-0" />
          <span>{erroGeral}</span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={estado === "enviando"}
            aria-disabled={estado === "enviando" ? true : undefined}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-botao bg-azul px-5 py-3 text-[1rem] font-semibold text-sobre-azul shadow-leve transition-colors hover:bg-azul-forte disabled:cursor-wait disabled:opacity-80"
          >
            {estado === "enviando" ? formulario.enviando : formulario.botao}
            {estado === "enviando" ? null : <Icone nome="seta" tamanho={18} espessura={2} />}
          </button>
          <p className="m-0 flex items-start gap-2 text-[0.84rem] text-texto-2">
            <Icone nome="cadeado" tamanho={15} className="mt-[3px] shrink-0 text-texto-3" />
            <span>
              {formulario.privacidade}{" "}
              <a href={ctx.urlPrivacidade} className="font-medium text-azul underline underline-offset-2 hover:text-azul-forte">
                {formulario.privacidadeLink}
              </a>
              .
            </span>
          </p>
        </div>

        {ctx.artefato ? null : (
          <noscript>
            <p className="m-0 text-[0.9rem] text-vermelho">
              {formulario.semScript}
              {ctx.contatoEmail ? ` ${formulario.erros.alternativa(ctx.contatoEmail)}` : ""}
            </p>
          </noscript>
        )}
      </form>

      {emailModo ? (
        <PainelEnvioEmail
          ctx={ctx}
          envio={envio}
          aoEditar={() => {
            setEnvio(null);
            requestAnimationFrame(() => document.getElementById("campo-nome")?.focus());
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Painel do modo "email": mostra o e-mail pronto para a pessoa enviar.
 * No site próprio, o React controla o painel. Na versão do Claude (HTML estático),
 * o script da página preenche e mostra os mesmos elementos (ids e data-*).
 */
function PainelEnvioEmail({
  ctx,
  envio,
  aoEditar,
}: {
  ctx: ContextoSite;
  envio: EnvioEmail | null;
  aoEditar: () => void;
}) {
  const textos = formulario.envioPorEmail;
  const [copiado, setCopiado] = useState<{ id: string; selecionado: boolean } | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!envio) return;
    document.getElementById("cartao-pedido")?.scrollIntoView({ block: "start", behavior: "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [envio]);

  useEffect(() => {
    if (!copiado) return;
    const espera = window.setTimeout(() => setCopiado(null), 2200);
    return () => window.clearTimeout(espera);
  }, [copiado]);

  function copiar(id: string) {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    const texto = (alvo.textContent ?? "").trim();
    const falhou = () => {
      selecionarTexto(alvo);
      setCopiado({ id, selecionado: true });
    };
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(texto).then(() => setCopiado({ id, selecionado: false }), falhou);
      } else {
        falhou();
      }
    } catch {
      falhou();
    }
  }

  const rotuloCopiar = (id: string) =>
    copiado?.id === id ? (copiado.selecionado ? "Selecionado" : textos.copiado) : textos.copiar;

  const botaoCopiar =
    "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[6px] border border-borda-forte bg-superficie px-2.5 text-[0.82rem] font-semibold text-titulo transition-colors hover:border-azul hover:text-azul";

  return (
    <div id="painel-envio" hidden={!envio} className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-azul-suave text-azul">
          <Icone nome="email" tamanho={20} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 ref={tituloRef} id="titulo-envio" tabIndex={-1} className="titulo-cartao m-0 text-[1.3rem] outline-none">
            {textos.titulo}
          </h3>
          <p className="m-0 text-texto-2">{textos.texto}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <a
          id="envio-gmail"
          href={envio?.gmail ?? "https://mail.google.com/mail/?view=cm&fs=1"}
          target="_blank"
          rel="noopener noreferrer"
          data-evento="clique_contato"
          data-local="gmail"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-botao bg-azul px-4 py-2.5 text-[0.95rem] font-semibold text-sobre-azul shadow-leve transition-colors hover:bg-azul-forte"
        >
          {textos.abrirGmail}
          <Icone nome="externo" tamanho={16} espessura={2} />
        </a>
        <a
          id="envio-app"
          href={envio?.app ?? `mailto:${ctx.contatoEmail}`}
          data-evento="clique_contato"
          data-local="app_email"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-botao border border-borda-forte bg-superficie px-4 py-2.5 text-[0.95rem] font-semibold text-titulo transition-colors hover:border-azul hover:text-azul"
        >
          {textos.abrirApp}
        </a>
      </div>

      <dl className="m-0 divide-y divide-borda rounded-botao border border-borda">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
          <dt className="w-16 text-[0.8rem] text-texto-3">{textos.para}</dt>
          <dd id="envio-para" className="dados m-0 min-w-0 flex-1 select-all break-all text-[0.88rem] text-titulo">
            {ctx.contatoEmail}
          </dd>
          <button type="button" className={botaoCopiar} data-copiar="envio-para" onClick={() => copiar("envio-para")}>
            <Icone nome="copiar" tamanho={14} espessura={2} />
            <span data-rotulo-copiar="">{rotuloCopiar("envio-para")}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
          <dt className="w-16 text-[0.8rem] text-texto-3">{textos.assunto}</dt>
          <dd id="envio-assunto" className="m-0 min-w-0 flex-1 select-all text-[0.92rem] text-titulo">
            {ASSUNTO_PEDIDO}
          </dd>
          <button type="button" className={botaoCopiar} data-copiar="envio-assunto" onClick={() => copiar("envio-assunto")}>
            <Icone nome="copiar" tamanho={14} espessura={2} />
            <span data-rotulo-copiar="">{rotuloCopiar("envio-assunto")}</span>
          </button>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[0.8rem] text-texto-3">{textos.mensagem}</dt>
            <button type="button" className={botaoCopiar} data-copiar="envio-mensagem" onClick={() => copiar("envio-mensagem")}>
              <Icone nome="copiar" tamanho={14} espessura={2} />
              <span data-rotulo-copiar="">{rotuloCopiar("envio-mensagem")}</span>
            </button>
          </div>
          <dd className="m-0">
            <pre
              id="envio-mensagem"
              className="m-0 max-h-72 select-all overflow-auto whitespace-pre-wrap break-words rounded-[6px] bg-superficie-2 p-3 font-sans text-[0.88rem] leading-relaxed text-texto"
            >
              {envio?.corpo}
            </pre>
          </dd>
        </div>
      </dl>

      <p className="m-0 flex items-start gap-2 text-[0.92rem] text-texto-2">
        <Icone nome="info" tamanho={17} className="mt-[3px] shrink-0 text-azul" />
        {textos.depois}
      </p>
      <p className="m-0 text-[0.85rem] text-texto-3">{textos.semApp}</p>
      <button
        id="envio-editar"
        type="button"
        onClick={aoEditar}
        className="self-start rounded-[4px] text-[0.92rem] font-semibold text-azul underline underline-offset-2 hover:text-azul-forte"
      >
        {textos.editar}
      </button>
    </div>
  );
}
