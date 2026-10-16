/**
 * Configuração lida das variáveis de ambiente. Use só no servidor:
 * segredos nunca vão para o navegador (não use o prefixo NEXT_PUBLIC_ neles).
 */

export type Destino = "arquivo" | "webhook";

export interface ConfigServidor {
  destino: Destino | null;
  arquivo: string;
  webhookUrl: string;
  webhookSegredo: string;
  origensPermitidas: string[];
  /** Tentativas de envio aceitas por endereço IP a cada 10 minutos. */
  limiteTentativas: number;
}

export function lerConfigServidor(ambiente: NodeJS.ProcessEnv = process.env): ConfigServidor {
  const padrao = ambiente.NODE_ENV === "production" ? "" : "arquivo";
  const destinoBruto = (ambiente.PEDIDOS_DESTINO ?? padrao).trim().toLowerCase();
  const destino: Destino | null = destinoBruto === "arquivo" || destinoBruto === "webhook" ? destinoBruto : null;
  const limite = Number.parseInt(ambiente.PEDIDOS_LIMITE_TENTATIVAS ?? "", 10);

  return {
    limiteTentativas: Number.isFinite(limite) && limite > 0 ? limite : 6,
    destino,
    arquivo: (ambiente.PEDIDOS_ARQUIVO ?? "").trim() || ".dados/pedidos.jsonl",
    webhookUrl: (ambiente.PEDIDOS_WEBHOOK_URL ?? "").trim(),
    webhookSegredo: (ambiente.PEDIDOS_WEBHOOK_SEGREDO ?? "").trim(),
    origensPermitidas: (ambiente.ORIGENS_PERMITIDAS ?? "")
      .split(",")
      .map((o) => o.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  };
}

/** Contato público do projeto: já aparece nas páginas e nos e-mails enviados. */
export const CONTATO_PADRAO = "arantesbernardo432@gmail.com";
export const RESPONSAVEL_PADRAO = "Bernardo";

export interface SitePublico {
  url: string;
  contatoEmail: string;
  responsavel: string;
  /** Nome da hospedagem, citado na política de privacidade. */
  hospedagem: string;
}

/**
 * Dados públicos do site (podem aparecer na página). Funcionam sem configuração:
 * na Vercel e na Netlify, o endereço e a hospedagem vêm das variáveis que elas mesmas criam.
 */
export function lerSitePublico(ambiente: NodeJS.ProcessEnv = process.env): SitePublico {
  const limpar = (valor?: string) => (valor ?? "").trim().replace(/\/+$/, "");
  const enderecoVercel = limpar(ambiente.VERCEL_PROJECT_PRODUCTION_URL);
  const url =
    limpar(ambiente.NEXT_PUBLIC_SITE_URL) ||
    (enderecoVercel ? `https://${enderecoVercel.replace(/^https?:\/\//, "")}` : "") ||
    (ambiente.NETLIFY ? limpar(ambiente.URL) : "") ||
    "http://localhost:3000";
  const hospedagem =
    (ambiente.NEXT_PUBLIC_HOSPEDAGEM ?? "").trim() ||
    (ambiente.VERCEL ? "Vercel" : ambiente.NETLIFY ? "Netlify" : "o provedor de hospedagem do site");
  return {
    url,
    contatoEmail: (ambiente.NEXT_PUBLIC_CONTATO_EMAIL ?? "").trim() || CONTATO_PADRAO,
    responsavel: (ambiente.NEXT_PUBLIC_RESPONSAVEL ?? "").trim() || RESPONSAVEL_PADRAO,
    hospedagem,
  };
}

export const sitePublico = lerSitePublico();
