import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ARQUIVO = path.resolve(".dados/e2e-pedidos.jsonl");

async function lerGravados(): Promise<Record<string, unknown>[]> {
  try {
    return (await readFile(ARQUIVO, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((linha) => JSON.parse(linha) as Record<string, unknown>);
  } catch {
    return [];
  }
}

function vigiarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(e.message));
  return erros;
}

async function preencherMinimo(page: Page, email: string) {
  const form = page.locator("#form-pedido");
  await form.getByLabel("Nome", { exact: true }).fill("Teste Automatizado");
  await form.getByLabel("E-mail profissional").fill(email);
  await form.getByRole("radio", { name: "Síndico profissional" }).check();
  await form.getByRole("radio", { name: "2 a 5" }).check();
}

const botaoEnviar = (page: Page) => page.locator("#form-pedido").getByRole("button", { name: "Solicitar calendário grátis" });

test.describe("página inicial", () => {
  test("carrega com título, metadados, sem erros e sem rolagem lateral", async ({ page }) => {
    const erros = vigiarErros(page);
    await page.goto("/");
    await expect(page).toHaveTitle("Condomínios | Controle de Manutenções Preventivas");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Organize os prazos de manutenção dos seus condomínios com um calendário gratuito e ajude a construir uma gestão mais organizada.",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.png$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Manutenções em dia.Condomínios sob controle.");
    const [largura, janela] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(largura).toBeLessThanOrEqual(janela ?? 0);
    await page.waitForLoadState("networkidle");
    expect(erros).toEqual([]);
  });

  test("segue a ordem das seções do roteiro", async ({ page }) => {
    await page.goto("/");
    const ids = await page.$$eval("main > section", (secoes) => secoes.map((s) => s.id || s.getAttribute("aria-labelledby")));
    expect(ids).toEqual([
      "inicio",
      "problema",
      "como-funciona",
      "demonstracao",
      "para-quem-e",
      "solicitar",
      "recursos",
      "perguntas",
      "titulo-final",
    ]);
  });

  test("links internos levam a seções e páginas que existem", async ({ page }) => {
    await page.goto("/");
    const ancoras = await page.$$eval("a[href^='#']", (as) => [...new Set(as.map((a) => a.getAttribute("href") ?? ""))]);
    expect(ancoras.length).toBeGreaterThan(5);
    for (const href of ancoras) await expect(page.locator(href), href).toHaveCount(1);
    const paginas = await page.$$eval("a[href^='/']", (as) => [...new Set(as.map((a) => a.getAttribute("href") ?? ""))]);
    for (const href of paginas) expect((await page.request.get(href)).status(), href).toBe(200);
    const vazios = await page.$$eval("a", (as) => as.filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#").length);
    expect(vazios).toBe(0);
  });

  test("demonstrações marcadas como fictícias e recursos futuros sem botões", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#inicio figure")).toHaveAttribute("aria-label", /Demonstração com dados fictícios/);
    await expect(page.locator("#demonstracao").getByText("Dados fictícios", { exact: true })).toBeVisible();
    await expect(page.locator("#recursos").getByText("Em planejamento", { exact: true })).toHaveCount(8);
    await expect(page.locator("#recursos button, #recursos a")).toHaveCount(0);
  });

  test("perguntas frequentes abrem com teclado", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado só no computador");
    await page.goto("/");
    const pergunta = page.locator("#perguntas summary").first();
    await pergunta.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#perguntas details").first()).toHaveAttribute("open", "");
    await expect(page.getByText("Ainda não. O projeto está em fase de validação")).toBeVisible();
  });

  test("sem violações graves de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
});

test.describe("tema escuro", () => {
  test.use({ colorScheme: "dark" });

  test("mantém contraste e cores do tema (axe)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fundo).toBe("rgb(10, 20, 33)");
    const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const graves = resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
});

test.describe("menu do celular", () => {
  test("abre, fecha com Esc e fecha ao escolher um link", async ({ page, isMobile }) => {
    test.skip(!isMobile, "o menu compacto só aparece no celular");
    await page.goto("/");
    const botao = page.locator("#botao-menu");
    const menu = page.locator("#menu-movel");
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeHidden();
    await botao.click();
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(botao).toBeFocused();
    await botao.click();
    await menu.getByRole("link", { name: "Recursos" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#recursos$/);
  });
});

test.describe("formulário de pedido", () => {
  test.beforeAll(async () => {
    await rm(ARQUIVO, { force: true });
  });

  test("mostra os erros em português e foca o primeiro campo", async ({ page }) => {
    await page.goto("/");
    await botaoEnviar(page).click();
    await expect(page.locator("#resumo-erros")).toHaveText("Confira os 4 campos destacados abaixo.");
    await expect(page.locator("#erro-nome")).toHaveText("Informe seu nome.");
    await expect(page.locator("#erro-email")).toHaveText("Informe seu e-mail.");
    await expect(page.locator("#erro-perfil")).toHaveText("Escolha o seu perfil.");
    await expect(page.locator("#erro-quantidade")).toHaveText("Escolha quantos condomínios você administra.");
    await expect(page.locator("#campo-nome")).toBeFocused();
    await expect(page.locator("#campo-nome")).toHaveAttribute("aria-invalid", "true");

    await page.locator("#campo-nome").fill("Ana");
    await expect(page.locator("#erro-nome")).toBeHidden();
    await page.locator("#campo-email").fill("ana@empresa");
    await page.locator("#campo-telefone").fill("1234");
    await botaoEnviar(page).click();
    await expect(page.locator("#erro-email")).toHaveText("Confira o e-mail. Ele deve ter o formato nome@empresa.com.br.");
    await expect(page.locator("#erro-telefone")).toHaveText(/Use o DDD e o número/);
    await expect(page.getByText("Solicitação recebida!")).toHaveCount(0);
  });

  test("envio válido grava o pedido e só depois mostra a confirmação", async ({ page }) => {
    const email = `valido-${Date.now()}@teste.com.br`;
    await page.goto("/#grupo");
    await preencherMinimo(page, email);
    await page.locator("#campo-dificuldade").selectOption("relatorios");
    await page.locator("#campo-comentario").fill("O laudo elétrico atrasou e a multa foi de R$ 800.");
    await page.getByLabel("Quero receber por e-mail novidades sobre o Condomínios.").check();
    await page.waitForTimeout(2200);

    const resposta = page.waitForResponse((r) => r.url().endsWith("/api/pedidos"));
    await botaoEnviar(page).click();
    expect((await resposta).status()).toBe(201);

    const sucesso = page.getByRole("heading", { name: "Solicitação recebida!" });
    await expect(sucesso).toBeVisible();
    await expect(sucesso).toBeFocused();
    await expect(
      page.getByText("Obrigado pelo interesse no Condomínios. Vamos analisar sua solicitação e entrar em contato pelo e-mail informado."),
    ).toBeVisible();

    const gravado = (await lerGravados()).find((r) => r.email === email);
    expect(gravado).toMatchObject({
      nome: "Teste Automatizado",
      perfil: "sindico_profissional",
      quantidade: "2-5",
      dificuldade: "relatorios",
      aceitaNovidades: true,
      origem: "grupo",
    });
  });

  test("duplo clique envia uma vez só", async ({ page }) => {
    let chamadas = 0;
    await page.route("**/api/pedidos", async (rota) => {
      chamadas += 1;
      await new Promise((ok) => setTimeout(ok, 700));
      await rota.continue();
    });
    const email = `duplo-${Date.now()}@teste.com.br`;
    await page.goto("/");
    await preencherMinimo(page, email);
    await page.waitForTimeout(2200);
    await botaoEnviar(page).dblclick();
    await expect(page.getByRole("button", { name: "Enviando…" })).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Solicitação recebida!" })).toBeVisible();
    expect(chamadas).toBe(1);
    expect((await lerGravados()).filter((r) => r.email === email)).toHaveLength(1);
  });

  test("erro do servidor mostra o motivo e não mostra confirmação", async ({ page }) => {
    await page.route("**/api/pedidos", (rota) =>
      rota.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ ok: false, erro: "falha" }) }),
    );
    await page.goto("/");
    await preencherMinimo(page, "erro@teste.com.br");
    await page.waitForTimeout(2200);
    await botaoEnviar(page).click();
    await expect(page.locator("#erro-geral")).toContainText("Não conseguimos registrar seu pedido agora.");
    await expect(page.getByText("Solicitação recebida!")).toHaveCount(0);
    await expect(botaoEnviar(page)).toBeEnabled();
  });

  test("validação do servidor aparece no campo certo", async ({ page }) => {
    await page.route("**/api/pedidos", (rota) =>
      rota.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, erro: "validacao", campos: { email: "Confira o e-mail. Ele deve ter o formato nome@empresa.com.br." } }),
      }),
    );
    await page.goto("/");
    await preencherMinimo(page, "servidor@teste.com.br");
    await page.waitForTimeout(2200);
    await botaoEnviar(page).click();
    await expect(page.locator("#erro-email")).toBeVisible();
    await expect(page.locator("#campo-email")).toBeFocused();
  });

  test("o servidor recusa envio rápido demais (robôs)", async ({ page }) => {
    await page.goto("/");
    await preencherMinimo(page, `rapido-${Date.now()}@teste.com.br`);
    await botaoEnviar(page).click();
    await expect(page.locator("#erro-geral")).toContainText("O envio foi rápido demais.");
  });

  test("sem JavaScript, o envio não vaza dados pela URL", async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const page = await contexto.newPage();
    await page.goto("/");
    await expect(page.locator("#form-pedido")).toHaveAttribute("method", "post");
    await expect(page.locator("#form-pedido")).toHaveAttribute("action", "/api/pedidos");
    await contexto.close();
  });
});

test.describe("API de pedidos", () => {
  test("recusa outro site, outro formato e dados inválidos", async ({ request, isMobile }) => {
    test.skip(isMobile, "basta rodar uma vez");
    const valido = {
      nome: "Ana",
      email: "ana@empresa.com.br",
      perfil: "administradora",
      quantidade: "1",
      id: "3f1c2a9e-8b7d-4c6e-9f00-1a2b3c4d5e6f",
      inicio: Date.now() - 10_000,
    };
    const cruzado = await request.post("/api/pedidos", { data: valido, headers: { Origin: "https://site-malicioso.com" } });
    expect(cruzado.status()).toBe(403);
    const formulario = await request.post("/api/pedidos", { form: { nome: "Ana" } });
    expect(formulario.status()).toBe(415);
    const invalido = await request.post("/api/pedidos", { data: { ...valido, email: "x", id: "11111111-2222-4333-8444-555555555555" } });
    expect(invalido.status()).toBe(400);
    expect((await invalido.json()).campos.email).toMatch(/Confira o e-mail/);
    expect((await request.get("/api/pedidos")).status()).toBe(405);
  });
});

test.describe("política de privacidade", () => {
  test("existe, descreve retenção e direitos e passa no axe", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page).toHaveTitle("Política de privacidade | Condomínios");
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidade" })).toBeVisible();
    await expect(page.getByText(/até 12 meses depois do último contato/)).toBeVisible();
    await expect(page.getByText(/respondemos em até 15 dias/)).toBeVisible();
    await expect(page.getByText(/Lei nº 13\.709\/2018/)).toBeVisible();
    const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  });

  test("sitemap e robots usam o endereço configurado", async ({ request, isMobile }) => {
    test.skip(isMobile, "basta rodar uma vez");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/privacidade</loc>");
  });
});
