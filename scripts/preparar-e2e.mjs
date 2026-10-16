/**
 * Prepara tudo o que os testes no navegador usam:
 *   .next        site com o formulário gravando no servidor (PEDIDOS_DESTINO=arquivo)
 *   .next-email  site sem destino configurado (o formulário prepara um e-mail)
 *   dist/artefato/previa.html  versão do Claude
 *
 *   npm run preparar:e2e && npm run test:e2e
 */
import { execFileSync } from "node:child_process";

const next = ["node_modules/next/dist/bin/next", "build"];
const base = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SITE_URL: "https://www.exemplo.com.br" };
delete base.PEDIDOS_DESTINO;
delete base.MODO_FORMULARIO;

function rodar(rotulo, comando, ambiente) {
  console.log(`\n> ${rotulo}`);
  execFileSync(process.execPath, comando, { stdio: "inherit", env: ambiente });
}

rodar("site com gravação no servidor (.next)", next, { ...base, PEDIDOS_DESTINO: "arquivo" });
rodar("site com pedido por e-mail (.next-email)", next, { ...base, NEXT_DIST_DIR: ".next-email", NEXT_PUBLIC_HOSPEDAGEM: "Vercel" });
rodar("versão do Claude", ["scripts/gerar-artefato.mjs"], base);
rodar("prévia da versão do Claude", ["scripts/previa-artefato.mjs"], base);
