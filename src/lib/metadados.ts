import type { Metadata } from "next";
import { meta } from "@/conteudo/site";

/**
 * Open Graph e Twitter. O Next.js substitui o objeto inteiro quando uma página
 * define `openGraph`, por isso cada página parte desta base.
 */
export const openGraphBase: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  locale: "pt_BR",
  siteName: meta.nome,
  title: meta.titulo,
  description: meta.descricao,
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "Condomínios: manutenções em dia, condomínios sob controle." }],
};

export const twitterBase: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  title: meta.titulo,
  description: meta.descricao,
  images: ["/og.png"],
};
