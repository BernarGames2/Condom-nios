import type { Metadata } from "next";
import { Cabecalho } from "@/componentes/Cabecalho";
import { LinkPularConteudo } from "@/componentes/PaginaInicial";
import { TextoPrivacidade } from "@/componentes/PoliticaPrivacidade";
import { Rodape } from "@/componentes/Rodape";
import { contextoDoSite } from "@/lib/contexto-site";
import { openGraphBase } from "@/lib/metadados";

const descricao = "Como o Condomínios trata os dados enviados no pedido do calendário de manutenção gratuito.";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: descricao,
  alternates: { canonical: "/privacidade" },
  openGraph: { ...openGraphBase, url: "/privacidade", title: "Política de privacidade | Condomínios", description: descricao },
};

export default function Privacidade() {
  const ctx = contextoDoSite("/");
  return (
    <>
      <LinkPularConteudo />
      <Cabecalho ctx={ctx} />
      <main id="conteudo" tabIndex={-1} className="margem-lateral outline-none">
        <article className="mx-auto flex w-full max-w-[48rem] flex-col gap-6 py-14 md:py-20">
          <p className="sobretitulo m-0">Privacidade</p>
          <h1 className="titulo-display m-0 text-[clamp(2.1rem,1.6rem+2vw,3.1rem)]">Política de privacidade</h1>
          <p className="m-0 text-[1.125rem] text-texto-2">
            Em resumo: usamos o que você informa só para responder ao pedido, montar o calendário e, se você autorizar,
            mandar novidades. Você pode pedir a exclusão a qualquer momento.
          </p>
          <div className="mt-4 border-t border-borda pt-8">
            <TextoPrivacidade ctx={ctx} />
          </div>
        </article>
      </main>
      <Rodape ctx={ctx} />
    </>
  );
}
