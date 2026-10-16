/**
 * Monta o contexto das páginas do site próprio (Next.js). Roda no servidor, no build.
 *
 * Modo do formulário:
 * - "servidor": há um destino configurado (planilha do Google ou arquivo); o pedido é gravado pela rota /api/pedidos;
 * - "email": nada configurado; o formulário prepara um e-mail que a pessoa envia, como na versão do Claude.
 * MODO_FORMULARIO=email|servidor força um dos dois.
 */
import type { ContextoSite, ModoSite } from "@/componentes/contexto";
import { obterArmazenamento } from "./armazenamento";
import { lerConfigServidor, sitePublico } from "./config";

export function modoDoFormulario(ambiente: NodeJS.ProcessEnv = process.env): ModoSite {
  const forcado = (ambiente.MODO_FORMULARIO ?? "").trim().toLowerCase();
  if (forcado === "email" || forcado === "servidor") return forcado;
  return obterArmazenamento(lerConfigServidor(ambiente)) ? "servidor" : "email";
}

export function contextoDoSite(baseAncoras: "" | "/"): ContextoSite {
  return {
    modo: modoDoFormulario(),
    artefato: false,
    contatoEmail: sitePublico.contatoEmail,
    responsavel: sitePublico.responsavel,
    hospedagem: sitePublico.hospedagem,
    urlPrivacidade: "/privacidade",
    baseAncoras,
  };
}
