import type { Metadata } from "next";
import { PaginaInicial } from "@/componentes/PaginaInicial";
import { contextoDoSite } from "@/lib/contexto-site";
import { openGraphBase } from "@/lib/metadados";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...openGraphBase, url: "/" },
};

export default function Pagina() {
  return <PaginaInicial ctx={contextoDoSite("")} />;
}
