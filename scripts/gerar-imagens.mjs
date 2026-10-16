/**
 * Gera as imagens de compartilhamento e o ícone do celular:
 *   public/og.png          (1200 x 630, prévia em WhatsApp, LinkedIn etc.)
 *   src/app/apple-icon.png (180 x 180)
 *
 *   npm run imagens
 *
 * Usa o Chromium do Playwright (ou PLAYWRIGHT_CHROMIUM_PATH).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const raiz = process.cwd();
const fonte = (arquivo) => `data:font/woff2;base64,${readFileSync(path.join(raiz, "node_modules", arquivo)).toString("base64")}`;
const fontes = `
@font-face{font-family:"Instrument Sans";font-weight:400 700;font-stretch:75% 100%;src:url(${fonte("@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2")}) format("woff2")}
@font-face{font-family:"Plex Mono";font-weight:500;src:url(${fonte("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")}) format("woff2")}`;

const og = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${fontes}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0e2a47;color:#fff;font-family:"Instrument Sans",sans-serif;overflow:hidden;position:relative}
.grade{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:36px 36px}
.conteudo{position:relative;display:grid;grid-template-columns:1fr 400px;gap:56px;padding:72px 80px;height:100%;align-items:center}
.marca{font-size:34px;font-weight:680;font-stretch:82%;letter-spacing:-.035em;display:flex;align-items:baseline}
.marca i{display:inline-block;width:10px;height:10px;border-radius:2px;background:#7aaeff;margin-left:3px}
h1{margin-top:44px;font-size:68px;line-height:1.02;font-weight:640;font-stretch:84%;letter-spacing:-.03em}
p{margin-top:28px;font-size:26px;line-height:1.35;color:#c2cfdf;max-width:600px}
.painel{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
.topo{background:#17395e;padding:20px 24px;font-size:20px;font-weight:600}
.topo small{display:block;font-family:"Plex Mono";font-size:14px;color:#c2cfdf;font-weight:500;margin-top:4px}
.linha{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;border-top:1px solid #dce3eb;color:#0e2a47;font-size:19px;font-weight:600}
.linha span{font-family:"Plex Mono";font-weight:500;color:#4a586c;font-size:16px;margin-right:12px}
.selo{font-size:15px;padding:6px 12px;border-radius:999px;font-weight:600;white-space:nowrap}
.ok{background:#e3f2ea;color:#1e7550}.prox{background:#fcefd6;color:#8a5300}.atr{background:#fbe7e8;color:#b3262c}
.aviso{padding:12px 24px;font-size:13px;color:#5f6d82;background:#f6f8fb;border-top:1px solid #dce3eb}
</style></head><body><div class="grade"></div><div class="conteudo">
<div><div class="marca">Condomínios<i></i></div>
<h1>Manutenções em dia. Condomínios sob controle.</h1>
<p>Calendário de manutenção grátis para síndicos profissionais e administradoras.</p></div>
<div class="painel"><div class="topo">Carteira de condomínios<small>demonstração · dados fictícios</small></div>
<div class="linha"><div><span>18/10</span>Elevadores</div><b class="selo atr">Atrasado</b></div>
<div class="linha"><div><span>25/10</span>Gerador</div><b class="selo prox">Próximo</b></div>
<div class="linha"><div><span>05/11</span>Caixa d'água</div><b class="selo prox">Próximo</b></div>
<div class="linha"><div><span>10/03</span>Para-raios</div><b class="selo ok">Em dia</b></div>
<div class="aviso">Exemplo ilustrativo</div></div>
</div></body></html>`;

const icone = `<!doctype html><html><head><style>*{margin:0}body{width:180px;height:180px;background:#0e2a47}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180"><rect width="32" height="32" fill="#0e2a47"/><path d="M19.95 11.05A7 7 0 1 0 19.95 20.95" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/><rect x="22.2" y="18.6" width="4.2" height="4.2" rx="1" fill="#7aaeff"/></svg>
</body></html>`;

const executavel = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const navegador = await chromium.launch(executavel ? { executablePath: executavel } : {});
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(og, { waitUntil: "load" });
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: path.join(raiz, "public/og.png") });
await pagina.setViewportSize({ width: 180, height: 180 });
await pagina.setContent(icone, { waitUntil: "load" });
await pagina.screenshot({ path: path.join(raiz, "src/app/apple-icon.png") });
await navegador.close();
console.log("Geradas public/og.png e src/app/apple-icon.png");
