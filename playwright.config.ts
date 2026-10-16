import { defineConfig } from "@playwright/test";

/**
 * Testes de ponta a ponta. Antes de rodar, compile as duas versões do site e a do Claude:
 *   npm run preparar:e2e
 * Depois:
 *   npm run test:e2e
 *
 * Se o Chromium do Playwright não estiver instalado, rode `npx playwright install chromium`
 * ou aponte PLAYWRIGHT_CHROMIUM_PATH para um Chromium já instalado.
 */
const chromium = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const next = "node node_modules/next/dist/bin/next start";

export default defineConfig({
  testDir: "testes/e2e",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    launchOptions: chromium ? { executablePath: chromium } : {},
    locale: "pt-BR",
  },
  projects: [
    {
      name: "computador",
      testIgnore: /site-email\.spec\.ts/,
      use: { baseURL: "http://localhost:3200", viewport: { width: 1366, height: 900 } },
    },
    {
      name: "celular",
      testIgnore: /site-email\.spec\.ts/,
      use: { baseURL: "http://localhost:3200", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
    {
      name: "sem-planilha",
      testMatch: /site-email\.spec\.ts/,
      use: { baseURL: "http://localhost:3201", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: [
    {
      command: `${next} -p 3200`,
      url: "http://localhost:3200",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        PEDIDOS_DESTINO: "arquivo",
        PEDIDOS_ARQUIVO: ".dados/e2e-pedidos.jsonl",
        PEDIDOS_LIMITE_TENTATIVAS: "1000",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
    {
      command: `${next} -p 3201`,
      url: "http://localhost:3201",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NEXT_DIST_DIR: ".next-email", NEXT_TELEMETRY_DISABLED: "1" },
    },
  ],
});
