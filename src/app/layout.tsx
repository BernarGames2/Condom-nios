import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/instrument-sans/standard.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { MedicaoEventos } from "@/componentes/MedicaoEventos";
import { meta } from "@/conteudo/site";
import { sitePublico } from "@/lib/config";
import { openGraphBase, twitterBase } from "@/lib/metadados";

export const metadata: Metadata = {
  metadataBase: new URL(sitePublico.url),
  title: { default: meta.titulo, template: "%s | Condomínios" },
  description: meta.descricao,
  applicationName: meta.nome,
  openGraph: openGraphBase,
  twitter: twitterBase,
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1421" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <MedicaoEventos />
      </body>
    </html>
  );
}
