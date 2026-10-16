/**
 * Gera a versão do site para publicar no Claude: um único arquivo HTML, sem servidor,
 * com o CSS, as fontes e o script embutidos.
 *
 *   npm run artefato
 *
 * Saída: dist/artefato/index.html
 * O pedido, nessa versão, sai pelo e-mail da pessoa (veja src/artefato/cliente.ts).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const raiz = process.cwd();
const saida = path.join(raiz, "dist", "artefato");
mkdirSync(saida, { recursive: true });

const CONTATO_EMAIL = process.env.ARTEFATO_CONTATO_EMAIL ?? "arantesbernardo432@gmail.com";
const RESPONSAVEL = process.env.ARTEFATO_RESPONSAVEL ?? "Bernardo";

// 1. HTML da página, com os mesmos componentes React do site
await build({
  entryPoints: [path.join(raiz, "src/artefato/pagina.tsx")],
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  outfile: path.join(saida, "render.mjs"),
  external: ["react", "react-dom", "lucide-react"],
  logLevel: "error",
});
const { renderizarArtefato } = await import(pathToFileURL(path.join(saida, "render.mjs")).href + `?v=${Date.now()}`);
const marcacao = renderizarArtefato({ contatoEmail: CONTATO_EMAIL, responsavel: RESPONSAVEL });

// 2. Script da página (menu, formulário, copiar)
const cliente = await build({
  entryPoints: [path.join(raiz, "src/artefato/cliente.ts")],
  bundle: true,
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  minify: true,
  write: false,
  logLevel: "error",
});
const script = cliente.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

// 3. CSS do Tailwind, a partir das mesmas classes
const arquivoCss = path.join(saida, "estilo.css");
execFileSync(process.execPath, [path.join(raiz, "node_modules/@tailwindcss/cli/dist/index.mjs"), "-i", "src/app/globals.css", "-o", arquivoCss, "--minify"], {
  cwd: raiz,
  stdio: ["ignore", "ignore", "inherit"],
});
const css = readFileSync(arquivoCss, "utf8");

// 4. Fontes embutidas (a página não pode buscar arquivos de outros endereços além do Google Fonts;
//    embutir evita qualquer requisição a terceiros)
const base64 = (arquivo) => readFileSync(path.join(raiz, "node_modules", arquivo)).toString("base64");
const fontes = [
  `@font-face{font-family:"Instrument Sans Variable";font-style:normal;font-display:swap;font-weight:400 700;font-stretch:75% 100%;src:url(data:font/woff2;base64,${base64("@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2")}) format("woff2")}`,
  `@font-face{font-family:"IBM Plex Mono";font-style:normal;font-display:swap;font-weight:400;src:url(data:font/woff2;base64,${base64("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2")}) format("woff2")}`,
  `@font-face{font-family:"IBM Plex Mono";font-style:normal;font-display:swap;font-weight:500;src:url(data:font/woff2;base64,${base64("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")}) format("woff2")}`,
].join("\n");

const descricao =
  "Calendário de manutenção grátis para síndicos profissionais e administradoras. Projeto em fase de validação.";

// O publicador do Claude envolve a página em <!doctype html><html><head>…<body>,
// por isso o arquivo começa direto pelo título e pelo estilo.
const html = `<title>Condomínios</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${descricao}">
<style>
${fontes}
${css}
</style>
${marcacao}
<script>${script}</script>
`;

const destino = path.join(saida, "index.html");
writeFileSync(destino, html);
console.log(`Gerado ${path.relative(raiz, destino)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
