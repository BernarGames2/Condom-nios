/**
 * Cria dist/artefato/previa.html: a página do Claude dentro de um esqueleto parecido
 * com o que o publicador usa (doctype, viewport com viewport-fit=cover e um reset curto).
 * Serve para testar a versão do Claude localmente.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const raiz = process.cwd();
const pagina = readFileSync(path.join(raiz, "dist/artefato/index.html"), "utf8");
const esqueleto = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${pagina}</body></html>`;
writeFileSync(path.join(raiz, "dist/artefato/previa.html"), esqueleto);
console.log("Gerado dist/artefato/previa.html");
