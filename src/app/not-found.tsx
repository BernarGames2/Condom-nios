import { Logo } from "@/componentes/ui/basicos";

export default function NaoEncontrada() {
  return (
    <main className="margem-lateral flex min-h-[70vh] items-center">
      <div className="mx-auto flex w-full max-w-[36rem] flex-col items-start gap-5 py-16">
        <Logo />
        <h1 className="titulo-secao m-0">Esta página não existe.</h1>
        <p className="m-0 text-texto-2">O endereço pode ter mudado ou estar digitado errado.</p>
        <a
          href="/"
          className="inline-flex min-h-11 items-center rounded-botao bg-azul px-5 font-semibold text-sobre-azul hover:bg-azul-forte"
        >
          Ir para a página inicial
        </a>
      </div>
    </main>
  );
}
