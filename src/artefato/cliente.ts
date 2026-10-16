/**
 * Script da versão publicada no Claude. A página é HTML estático (gerado pelos mesmos
 * componentes do site); este script cuida do menu, da validação do formulário,
 * do e-mail pronto para enviar e dos botões de copiar.
 *
 * Nessa versão não há servidor: o pedido sai do e-mail da própria pessoa, com o
 * assunto "Quero o calendário grátis". Por isso a página nunca diz que o pedido
 * foi recebido; ela só prepara a mensagem.
 */
import { formulario } from "@/conteudo/site";
import { idParaFoco, lerCampos, selecionarTexto } from "@/lib/formulario-dom";
import {
  ORDEM_CAMPOS,
  lerOrigem,
  linksDoEmail,
  montarMensagemPedido,
  validarPedido,
  type CampoPedido,
  type ErrosPedido,
} from "@/lib/pedido";

function el<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// A origem vem do link usado para abrir a página (#grupo, #anuncio...). É lida uma vez,
// antes que os links internos troquem o # da barra de endereço.
const origem = lerOrigem(window.location.hash, window.location.search);

/* ---------------- menu do celular ---------------- */

function iniciarMenu(): void {
  const botao = el<HTMLButtonElement>("botao-menu");
  const menu = el("menu-movel");
  if (!botao || !menu) return;
  const definir = (aberto: boolean) => {
    menu.hidden = !aberto;
    botao.setAttribute("aria-expanded", String(aberto));
    const fechado = botao.querySelector<HTMLElement>('[data-icone-menu="fechado"]');
    const abertoIcone = botao.querySelector<HTMLElement>('[data-icone-menu="aberto"]');
    if (fechado) fechado.hidden = aberto;
    if (abertoIcone) abertoIcone.hidden = !aberto;
    const rotulo = botao.querySelector<HTMLElement>("[data-rotulo-menu]");
    if (rotulo) rotulo.textContent = aberto ? "Fechar menu" : "Abrir menu";
  };
  botao.addEventListener("click", () => definir(menu.hidden));
  menu.addEventListener("click", (evento) => {
    if ((evento.target as HTMLElement).closest("a")) definir(false);
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !menu.hidden) {
      definir(false);
      botao.focus();
    }
  });
  window.matchMedia("(min-width: 48rem)").addEventListener("change", (evento) => {
    if (evento.matches) definir(false);
  });
}

/* ---------------- formulário ---------------- */

function alvoDoErro(campo: CampoPedido): HTMLElement | null {
  if (campo === "perfil" || campo === "quantidade") {
    return document.querySelector<HTMLElement>(`fieldset[data-campo="${campo}"]`);
  }
  return el(`campo-${campo}`);
}

function mostrarErros(erros: ErrosPedido, focar: boolean): void {
  for (const campo of ORDEM_CAMPOS) {
    const caixa = el(`erro-${campo}`);
    if (!caixa) continue;
    const mensagem = erros[campo];
    caixa.hidden = !mensagem;
    const texto = caixa.querySelector<HTMLElement>("[data-texto-erro]");
    if (texto) texto.textContent = mensagem ?? "";
    const alvo = alvoDoErro(campo);
    if (alvo) {
      if (mensagem) alvo.setAttribute("aria-invalid", "true");
      else alvo.removeAttribute("aria-invalid");
    }
  }
  const total = Object.keys(erros).length;
  const resumo = el("resumo-erros");
  if (resumo) {
    resumo.hidden = total === 0;
    const texto = resumo.querySelector<HTMLElement>("[data-texto-resumo]");
    if (texto) texto.textContent = total > 0 ? formulario.resumoErros(total) : "";
  }
  if (focar) {
    const primeiro = ORDEM_CAMPOS.find((campo) => erros[campo]);
    if (primeiro) el(idParaFoco(primeiro))?.focus();
  }
}

function limparErroDoCampo(nome: string, errosAtuais: ErrosPedido): void {
  const campo = nome as CampoPedido;
  if (!errosAtuais[campo]) return;
  delete errosAtuais[campo];
  mostrarErros(errosAtuais, false);
}

function iniciarFormulario(): void {
  const form = el<HTMLFormElement>("form-pedido");
  const painel = el("painel-envio");
  if (!form || !painel) return;

  const para = (el("envio-para")?.textContent ?? "").trim();
  const mensagem = el("envio-mensagem");
  const gmail = el<HTMLAnchorElement>("envio-gmail");
  const app = el<HTMLAnchorElement>("envio-app");
  const titulo = el("titulo-envio");
  const cartao = el("cartao-pedido");
  let erros: ErrosPedido = {};

  form.addEventListener("input", (evento) => limparErroDoCampo((evento.target as HTMLInputElement).name, erros));
  form.addEventListener("change", (evento) => limparErroDoCampo((evento.target as HTMLInputElement).name, erros));

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const validacao = validarPedido(lerCampos(form));
    if (!validacao.ok) {
      erros = { ...validacao.erros };
      mostrarErros(erros, true);
      return;
    }
    erros = {};
    mostrarErros(erros, false);

    const corpo = montarMensagemPedido(validacao.pedido, origem);
    const links = linksDoEmail(para, corpo);
    if (mensagem) mensagem.textContent = corpo;
    if (gmail) gmail.href = links.gmail;
    if (app) app.href = links.app;
    form.hidden = true;
    painel.hidden = false;
    cartao?.scrollIntoView({ block: "start", behavior: "smooth" });
    titulo?.focus({ preventScroll: true });
  });

  el("envio-editar")?.addEventListener("click", () => {
    painel.hidden = true;
    form.hidden = false;
    el("campo-nome")?.focus();
  });
}

/* ---------------- copiar ---------------- */

function avisar(botao: HTMLElement, texto: string): void {
  const rotulo = botao.querySelector<HTMLElement>("[data-rotulo-copiar]");
  if (!rotulo) return;
  const original = rotulo.dataset.original ?? rotulo.textContent ?? "";
  rotulo.dataset.original = original;
  rotulo.textContent = texto;
  window.setTimeout(() => {
    rotulo.textContent = original;
  }, 2200);
}

function iniciarCopiar(): void {
  document.addEventListener("click", (evento) => {
    const botao = (evento.target as HTMLElement).closest<HTMLElement>("[data-copiar]");
    if (!botao) return;
    const alvo = el(botao.dataset.copiar ?? "");
    if (!alvo) return;
    const texto = (alvo.textContent ?? "").trim();
    const falhou = () => {
      selecionarTexto(alvo);
      avisar(botao, "Selecionado");
    };
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(texto).then(() => avisar(botao, formulario.envioPorEmail.copiado), falhou);
      } else {
        falhou();
      }
    } catch {
      falhou();
    }
  });
}

/* ---------------- política de privacidade ---------------- */

function iniciarPrivacidade(): void {
  const detalhes = el<HTMLDetailsElement>("detalhes-privacidade");
  if (!detalhes) return;
  const abrir = () => {
    if (window.location.hash === "#privacidade") detalhes.open = true;
  };
  abrir();
  window.addEventListener("hashchange", abrir);
  document.addEventListener("click", (evento) => {
    const link = (evento.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#privacidade"]');
    if (link) detalhes.open = true;
  });
}

iniciarMenu();
iniciarFormulario();
iniciarCopiar();
iniciarPrivacidade();
