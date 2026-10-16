import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/pedidos/route";
import { limparMemoriaAntispam } from "@/lib/antispam";

let pasta = "";
let arquivo = "";

const corpoValido = () => ({
  nome: "Carlos Lima",
  email: "carlos@sindico.com.br",
  perfil: "sindico_profissional",
  quantidade: "2-5",
  comentario: "A bomba de recalque parou e o conserto custou R$ 3.400.",
  aceitaNovidades: true,
  id: crypto.randomUUID(),
  inicio: Date.now() - 30_000,
  origem: "grupo",
  site: "",
});

function requisicao(corpo: unknown, cabecalhos: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/pedidos", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000", host: "localhost:3000", ...cabecalhos },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}

async function linhasGravadas(): Promise<Record<string, unknown>[]> {
  try {
    return (await readFile(arquivo, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>);
  } catch {
    return [];
  }
}

beforeAll(async () => {
  pasta = await mkdtemp(path.join(tmpdir(), "rota-"));
  arquivo = path.join(pasta, "pedidos.jsonl");
});

afterAll(async () => {
  await rm(pasta, { recursive: true, force: true });
});

beforeEach(() => {
  limparMemoriaAntispam();
  vi.unstubAllEnvs();
  vi.stubEnv("PEDIDOS_DESTINO", "arquivo");
  vi.stubEnv("PEDIDOS_ARQUIVO", arquivo);
});

describe("POST /api/pedidos", () => {
  it("grava um pedido válido e responde 201", async () => {
    const corpo = corpoValido();
    const resposta = await POST(requisicao(corpo));
    expect(resposta.status).toBe(201);
    expect(await resposta.json()).toEqual({ ok: true, repetido: false });
    const gravado = (await linhasGravadas()).find((l) => l.id === corpo.id);
    expect(gravado).toMatchObject({ nome: "Carlos Lima", email: "carlos@sindico.com.br", origem: "grupo", aceitaNovidades: true });
    expect(gravado).not.toHaveProperty("site");
    expect(gravado).not.toHaveProperty("inicio");
  });

  it("não duplica quando o mesmo pedido chega duas vezes", async () => {
    const corpo = corpoValido();
    expect((await POST(requisicao(corpo))).status).toBe(201);
    const segunda = await POST(requisicao(corpo));
    expect(segunda.status).toBe(200);
    expect(await segunda.json()).toEqual({ ok: true, repetido: true });
    expect((await linhasGravadas()).filter((l) => l.id === corpo.id)).toHaveLength(1);
  });

  it("valida no servidor e devolve as mensagens por campo", async () => {
    const resposta = await POST(requisicao({ ...corpoValido(), email: "carlos", perfil: "x" }));
    expect(resposta.status).toBe(400);
    const json = await resposta.json();
    expect(json.erro).toBe("validacao");
    expect(json.campos).toEqual({
      email: "Confira o e-mail. Ele deve ter o formato nome@empresa.com.br.",
      perfil: "Escolha o seu perfil.",
    });
  });

  it("finge sucesso para robôs (campo invisível preenchido) e não grava nada", async () => {
    const corpo = { ...corpoValido(), site: "https://spam.example" };
    const resposta = await POST(requisicao(corpo));
    expect(resposta.status).toBe(200);
    expect((await linhasGravadas()).some((l) => l.id === corpo.id)).toBe(false);
  });

  it("recusa envio rápido demais", async () => {
    const resposta = await POST(requisicao({ ...corpoValido(), inicio: Date.now() - 300 }));
    expect(resposta.status).toBe(400);
    expect((await resposta.json()).erro).toBe("rapido");
  });

  it("recusa outro site (CSRF), outro formato e corpo grande", async () => {
    expect((await POST(requisicao(corpoValido(), { origin: "https://site-malicioso.com" }))).status).toBe(403);
    const texto = new Request("http://localhost:3000/api/pedidos", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", host: "localhost:3000" },
      body: "nome=a",
    });
    expect((await POST(texto)).status).toBe(415);
    expect((await POST(requisicao("{nao é json"))).status).toBe(400);
    expect((await POST(requisicao({ ...corpoValido(), comentario: "x".repeat(20_000) }))).status).toBe(413);
  });

  it("limita tentativas por endereço", async () => {
    const ip = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 6; i++) {
      expect((await POST(requisicao(corpoValido(), ip))).status).toBe(201);
    }
    const bloqueada = await POST(requisicao(corpoValido(), ip));
    expect(bloqueada.status).toBe(429);
    expect((await bloqueada.json()).erro).toBe("limite");
    expect((await POST(requisicao(corpoValido(), { "x-forwarded-for": "203.0.113.8" }))).status).toBe(201);
  });

  it("responde 503 (sem fingir que gravou) quando nada está configurado", async () => {
    vi.stubEnv("PEDIDOS_DESTINO", "");
    vi.stubEnv("NODE_ENV", "production");
    const resposta = await POST(requisicao(corpoValido()));
    expect(resposta.status).toBe(503);
    expect((await resposta.json()).erro).toBe("indisponivel");
  });

  it("responde 502 quando o destino falha, sem dados pessoais no log", async () => {
    vi.stubEnv("PEDIDOS_DESTINO", "webhook");
    vi.stubEnv("PEDIDOS_WEBHOOK_URL", "http://127.0.0.1:9/exec");
    vi.stubEnv("PEDIDOS_WEBHOOK_SEGREDO", "s");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const resposta = await POST(requisicao(corpoValido()));
    expect(resposta.status).toBe(502);
    const mensagens = log.mock.calls.flat().join(" ");
    expect(mensagens).not.toMatch(/Carlos|carlos@|bomba/);
    log.mockRestore();
  });
});
