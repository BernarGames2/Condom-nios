import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

/**
 * Versão publicada no Claude (sem servidor). Gere antes com:
 *   npm run artefato && node scripts/previa-artefato.mjs
 */
const previa = path.resolve("dist/artefato/previa.html");
const url = pathToFileURL(previa).href;

test.describe("versão do Claude (pedido por e-mail)", () => {
  test.skip(!existsSync(previa), "rode `npm run artefato && node scripts/previa-artefato.mjs` antes");

  test("carrega sem erros e sem rolagem lateral", async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") erros.push(m.text());
    });
    page.on("pageerror", (e) => erros.push(e.message));
    await page.goto(url);
    await expect(page).toHaveTitle("Condomínios");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Manutenções em dia.Condomínios sob controle.");
    const [largura, janela] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(largura).toBeLessThanOrEqual(janela ?? 0);
    await expect(page.locator("form[action]")).toHaveCount(0);
    expect(erros).toEqual([]);
  });

  test("valida e prepara o e-mail com a origem do link, sem dizer que foi recebido", async ({ page }) => {
    await page.goto(`${url}#grupo`);
    const form = page.locator("#form-pedido");
    await form.getByRole("button", { name: "Solicitar calendário grátis" }).click();
    await expect(page.locator("#erro-nome")).toHaveText("Informe seu nome.");
    await expect(page.locator("#resumo-erros")).toHaveText("Confira os 4 campos destacados abaixo.");
    await expect(page.locator("#campo-nome")).toBeFocused();

    await form.getByLabel("Nome", { exact: true }).fill("Marina Alves");
    await expect(page.locator("#erro-nome")).toBeHidden();
    await form.getByLabel("E-mail profissional").fill("marina@gestao.com.br");
    await form.getByRole("radio", { name: "Administradora" }).check();
    await form.getByRole("radio", { name: "Mais de 30" }).check();
    await page.locator("#campo-empresa").fill("Alves Gestão Condominial");
    await page.locator("#campo-comentario").fill("A recarga dos extintores venceu em dois prédios.");
    await form.getByRole("button", { name: "Solicitar calendário grátis" }).click();

    const painel = page.locator("#painel-envio");
    await expect(painel).toBeVisible();
    await expect(form).toBeHidden();
    await expect(page.getByRole("heading", { name: "Falta um passo: envie o e-mail" })).toBeFocused();
    await expect(page.locator("#envio-para")).toHaveText("arantesbernardo432@gmail.com");
    await expect(page.locator("#envio-assunto")).toHaveText("Quero o calendário grátis");
    const mensagem = page.locator("#envio-mensagem");
    await expect(mensagem).toContainText("Nome: Marina Alves");
    await expect(mensagem).toContainText("Perfil: Administradora");
    await expect(mensagem).toContainText("Condomínios que administro: Mais de 30");
    await expect(mensagem).toContainText("Administradora ou empresa: Alves Gestão Condominial");
    await expect(mensagem).toContainText("Como cheguei à página: Grupo de síndicos");

    const gmail = await page.locator("#envio-gmail").getAttribute("href");
    expect(gmail).toContain("https://mail.google.com/mail/?view=cm&fs=1&to=arantesbernardo432%40gmail.com");
    expect(gmail).toContain("&su=Quero%20o%20calend%C3%A1rio%20gr%C3%A1tis");
    expect(decodeURIComponent(gmail ?? "")).toContain("Nome: Marina Alves");
    await expect(page.locator("#envio-gmail")).toHaveAttribute("target", "_blank");
    await expect(page.getByText("Solicitação recebida!")).toHaveCount(0);

    await page.getByRole("button", { name: "Voltar e editar" }).click();
    await expect(form).toBeVisible();
    await expect(page.locator("#campo-nome")).toHaveValue("Marina Alves");
  });

  test("copiar mostra retorno e a política abre pelo link", async ({ page, context, isMobile }) => {
    if (!isMobile) await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(url);
    const copiar = page.locator('#contato [data-copiar="rodape-email"]');
    await copiar.click();
    await expect(copiar).toContainText(/Copiado|Selecionado/);
    await page.locator('footer a[href="#privacidade"]').click();
    await expect(page.locator("#detalhes-privacidade")).toHaveAttribute("open", "");
    await expect(page.getByText(/A página não grava o pedido: ele sai do seu próprio e-mail/)).toBeVisible();
  });

  test("menu do celular funciona sem React", async ({ page, isMobile }) => {
    test.skip(!isMobile, "o menu compacto só aparece no celular");
    await page.goto(url);
    const botao = page.locator("#botao-menu");
    await botao.click();
    await expect(page.locator("#menu-movel")).toBeVisible();
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    await expect(botao.locator("[data-rotulo-menu]")).toHaveText("Fechar menu");
    await page.locator("#menu-movel").getByRole("link", { name: "Como funciona" }).click();
    await expect(page.locator("#menu-movel")).toBeHidden();
  });
});
