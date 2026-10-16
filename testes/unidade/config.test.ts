import { describe, expect, it } from "vitest";
import { lerSitePublico } from "@/lib/config";
import { modoDoFormulario } from "@/lib/contexto-site";

describe("dados públicos do site", () => {
  it("funciona sem configuração, com o contato do projeto", () => {
    expect(lerSitePublico({} as NodeJS.ProcessEnv)).toEqual({
      url: "http://localhost:3000",
      contatoEmail: "arantesbernardo432@gmail.com",
      responsavel: "Bernardo",
      hospedagem: "o provedor de hospedagem do site",
    });
  });

  it("reconhece a Vercel e a Netlify pelas variáveis que elas criam", () => {
    const vercel = lerSitePublico({ VERCEL: "1", VERCEL_PROJECT_PRODUCTION_URL: "condominios-site.vercel.app" } as unknown as NodeJS.ProcessEnv);
    expect(vercel.url).toBe("https://condominios-site.vercel.app");
    expect(vercel.hospedagem).toBe("Vercel");
    const netlify = lerSitePublico({ NETLIFY: "true", URL: "https://condominios.netlify.app/" } as unknown as NodeJS.ProcessEnv);
    expect(netlify.url).toBe("https://condominios.netlify.app");
    expect(netlify.hospedagem).toBe("Netlify");
  });

  it("o domínio configurado vence o endereço automático", () => {
    const site = lerSitePublico({
      VERCEL: "1",
      VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app",
      NEXT_PUBLIC_SITE_URL: "https://www.meudominio.com.br/",
    } as unknown as NodeJS.ProcessEnv);
    expect(site.url).toBe("https://www.meudominio.com.br");
  });
});

describe("modo do formulário", () => {
  it("usa e-mail em produção sem planilha e servidor quando há destino", () => {
    expect(modoDoFormulario({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toBe("email");
    expect(modoDoFormulario({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).toBe("servidor");
    expect(
      modoDoFormulario({
        NODE_ENV: "production",
        PEDIDOS_DESTINO: "webhook",
        PEDIDOS_WEBHOOK_URL: "https://script.google.com/macros/s/x/exec",
        PEDIDOS_WEBHOOK_SEGREDO: "s",
      } as NodeJS.ProcessEnv),
    ).toBe("servidor");
  });

  it("aceita escolha explícita", () => {
    expect(modoDoFormulario({ NODE_ENV: "development", MODO_FORMULARIO: "email" } as NodeJS.ProcessEnv)).toBe("email");
  });
});
