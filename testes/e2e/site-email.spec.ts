import { expect, test } from "@playwright/test";

/**
 * Site próprio publicado sem planilha configurada (por exemplo, logo depois de importar na Vercel):
 * o formulário prepara um e-mail com o assunto "Quero o calendário grátis", como na versão do Claude.
 */
test.describe("site sem planilha: pedido por e-mail", () => {
  test("prepara o e-mail com a origem do link e nunca diz que o pedido foi recebido", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await page.goto("/#anuncio");
    const form = page.locator("#form-pedido");
    await expect(form).toHaveAttribute("method", "post");
    await expect(form).not.toHaveAttribute("action", /.+/);

    await form.getByRole("button", { name: "Solicitar calendário grátis" }).click();
    await expect(page.locator("#erro-email")).toHaveText("Informe seu e-mail.");

    await form.getByLabel("Nome", { exact: true }).fill("Paulo Mendes");
    await form.getByLabel("E-mail profissional").fill("paulo@sindico.com.br");
    await form.getByRole("radio", { name: "Síndico profissional" }).check();
    await form.getByRole("radio", { name: "6 a 15" }).check();
    await form.getByRole("button", { name: "Solicitar calendário grátis" }).click();

    await expect(page.locator("#painel-envio")).toBeVisible();
    await expect(form).toBeHidden();
    await expect(page.getByRole("heading", { name: "Falta um passo: envie o e-mail" })).toBeFocused();
    await expect(page.locator("#envio-para")).toHaveText("arantesbernardo432@gmail.com");
    await expect(page.locator("#envio-mensagem")).toContainText("Condomínios que administro: 6 a 15");
    await expect(page.locator("#envio-mensagem")).toContainText("Como cheguei à página: Anúncio no Facebook ou Instagram");
    const gmail = await page.locator("#envio-gmail").getAttribute("href");
    expect(gmail).toContain("&su=Quero%20o%20calend%C3%A1rio%20gr%C3%A1tis");
    expect(decodeURIComponent(gmail ?? "")).toContain("Nome: Paulo Mendes");
    await expect(page.getByText("Solicitação recebida!")).toHaveCount(0);

    await page.getByRole("button", { name: "Voltar e editar" }).click();
    await expect(form).toBeVisible();
    await expect(page.locator("#campo-nome")).toHaveValue("Paulo Mendes");
    expect(erros).toEqual([]);
  });

  test("rodapé com e-mail clicável e política citando a hospedagem e o envio por e-mail", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('#contato a[href="mailto:arantesbernardo432@gmail.com"]')).toBeVisible();
    await page.goto("/privacidade");
    await expect(page.getByText("Vercel, que hospeda o site. O site não grava o pedido: ele sai do seu próprio e-mail.")).toBeVisible();
    await expect(page.getByText(/Quem decide sobre o uso dos dados e responde por eles é Bernardo/)).toBeVisible();
  });
});
