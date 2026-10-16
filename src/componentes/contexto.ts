/**
 * O mesmo conjunto de componentes monta o site em duas situações:
 * - site próprio (Next.js): o formulário grava pela rota /api/pedidos ("servidor") ou,
 *   sem destino configurado, prepara um e-mail ("email");
 * - versão publicada no Claude (artefato): sem servidor, sempre "email".
 */
export type ModoSite = "servidor" | "email";

export interface ContextoSite {
  /** Como o pedido sai: gravado pelo servidor ou por e-mail enviado pela própria pessoa. */
  modo: ModoSite;
  /** true só na versão publicada no Claude (HTML estático, sem React no navegador). */
  artefato: boolean;
  /** E-mail de contato público. */
  contatoEmail: string;
  /** Nome de quem responde pelos dados. */
  responsavel: string;
  /** Quem hospeda o site, citado na política de privacidade. */
  hospedagem: string;
  /** Link da política de privacidade: "/privacidade" no site, "#privacidade" no Claude. */
  urlPrivacidade: string;
  /** Prefixo dos links de seção: "" na página inicial, "/" nas outras páginas. */
  baseAncoras: string;
}

export function linkAncora(ctx: ContextoSite, ancora: string): string {
  return `${ctx.baseAncoras}#${ancora}`;
}
