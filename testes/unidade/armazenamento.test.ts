import { createServer, type Server } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { obterArmazenamento, type RegistroPedido } from "@/lib/armazenamento";
import { criarArmazenamentoArquivo } from "@/lib/armazenamento/arquivo";
import { criarArmazenamentoWebhook } from "@/lib/armazenamento/webhook";
import { lerConfigServidor } from "@/lib/config";

const registro: RegistroPedido = {
  id: "3f1c2a9e-8b7d-4c6e-9f00-1a2b3c4d5e6f",
  recebidoEm: "2026-10-16T15:00:00.000Z",
  origem: "grupo",
  nome: "Ana Souza",
  email: "ana@administradora.com.br",
  perfil: "administradora",
  quantidade: "6-15",
  empresa: "",
  dificuldade: "",
  telefone: "",
  comentario: "",
  aceitaNovidades: false,
};

describe("armazenamento em arquivo", () => {
  let pasta = "";
  beforeAll(async () => {
    pasta = await mkdtemp(path.join(tmpdir(), "pedidos-"));
  });
  afterAll(async () => {
    await rm(pasta, { recursive: true, force: true });
  });

  it("grava uma linha JSON por pedido e não duplica o mesmo id", async () => {
    const arquivo = path.join(pasta, "sub", "pedidos.jsonl");
    const armazenamento = criarArmazenamentoArquivo(arquivo);
    expect(await armazenamento.salvar(registro)).toEqual({ repetido: false });
    expect(await armazenamento.salvar(registro)).toEqual({ repetido: true });
    expect(await armazenamento.salvar({ ...registro, id: "11111111-2222-4333-8444-555555555555" })).toEqual({ repetido: false });
    const linhas = (await readFile(arquivo, "utf8")).trim().split("\n");
    expect(linhas).toHaveLength(2);
    expect(JSON.parse(linhas[0] ?? "{}")).toEqual(registro);
  });

  it("grava em fila quando chegam pedidos ao mesmo tempo", async () => {
    const arquivo = path.join(pasta, "concorrente.jsonl");
    const armazenamento = criarArmazenamentoArquivo(arquivo);
    const ids = Array.from({ length: 10 }, (_, i) => `11111111-2222-4333-8444-${String(i).padStart(12, "0")}`);
    await Promise.all(ids.map((id) => armazenamento.salvar({ ...registro, id })));
    await Promise.all(ids.map((id) => armazenamento.salvar({ ...registro, id })));
    const linhas = (await readFile(arquivo, "utf8")).trim().split("\n");
    expect(linhas).toHaveLength(10);
  });
});

describe("armazenamento por webhook (planilha do Google)", () => {
  let servidor: Server;
  let base = "";
  let resposta: (corpo: string, metodo: string, rota: string) => { status: number; corpo: string; local?: string };
  const recebidos: { metodo: string; rota: string; corpo: string }[] = [];

  beforeAll(async () => {
    servidor = createServer((req, res) => {
      let corpo = "";
      req.on("data", (parte) => (corpo += parte));
      req.on("end", () => {
        recebidos.push({ metodo: req.method ?? "", rota: req.url ?? "", corpo });
        const r = resposta(corpo, req.method ?? "", req.url ?? "");
        res.writeHead(r.status, { "Content-Type": "application/json", ...(r.local ? { Location: r.local } : {}) });
        res.end(r.corpo);
      });
    });
    await new Promise<void>((ok) => servidor.listen(0, "127.0.0.1", ok));
    base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
  });
  afterEach(() => {
    recebidos.length = 0;
  });
  afterAll(async () => {
    await new Promise<void>((ok) => servidor.close(() => ok()));
  });

  it("envia o segredo e o pedido, e só conta como gravado com {ok: true}", async () => {
    resposta = () => ({ status: 200, corpo: JSON.stringify({ ok: true }) });
    const armazenamento = criarArmazenamentoWebhook(`${base}/exec`, "segredo-de-teste");
    expect(await armazenamento.salvar(registro)).toEqual({ repetido: false });
    expect(JSON.parse(recebidos[0]?.corpo ?? "{}")).toEqual({ segredo: "segredo-de-teste", pedido: registro });
  });

  it("segue o redirecionamento do Google Apps Script (POST e depois GET)", async () => {
    resposta = (_corpo, metodo, rota) =>
      rota === "/exec" && metodo === "POST"
        ? { status: 302, corpo: "", local: "/resultado" }
        : { status: 200, corpo: JSON.stringify({ ok: true, repetido: true }) };
    const armazenamento = criarArmazenamentoWebhook(`${base}/exec`, "s");
    expect(await armazenamento.salvar(registro)).toEqual({ repetido: true });
    expect(recebidos.map((r) => `${r.metodo} ${r.rota}`)).toEqual(["POST /exec", "GET /resultado"]);
  });

  it("falha quando o destino recusa, dá erro ou não responde JSON", async () => {
    const armazenamento = criarArmazenamentoWebhook(`${base}/exec`, "s");
    resposta = () => ({ status: 200, corpo: JSON.stringify({ ok: false, erro: "nao_autorizado" }) });
    await expect(armazenamento.salvar(registro)).rejects.toThrow(/nao_autorizado/);
    resposta = () => ({ status: 500, corpo: "{}" });
    await expect(armazenamento.salvar(registro)).rejects.toThrow(/500/);
    resposta = () => ({ status: 200, corpo: "<html>login</html>" });
    await expect(armazenamento.salvar(registro)).rejects.toThrow(/JSON/);
  });
});

describe("escolha do destino", () => {
  it("não inventa destino em produção sem configuração", () => {
    expect(obterArmazenamento(lerConfigServidor({ NODE_ENV: "production" } as NodeJS.ProcessEnv))).toBeNull();
  });

  it("usa arquivo por padrão em desenvolvimento", () => {
    expect(obterArmazenamento(lerConfigServidor({ NODE_ENV: "development" } as NodeJS.ProcessEnv))?.nome).toBe("arquivo");
  });

  it("exige URL https e segredo para o webhook", () => {
    const base = { NODE_ENV: "production", PEDIDOS_DESTINO: "webhook" } as NodeJS.ProcessEnv;
    expect(obterArmazenamento(lerConfigServidor({ ...base, PEDIDOS_WEBHOOK_URL: "https://script.google.com/x/exec" }))).toBeNull();
    expect(
      obterArmazenamento(lerConfigServidor({ ...base, PEDIDOS_WEBHOOK_URL: "http://exemplo.com/exec", PEDIDOS_WEBHOOK_SEGREDO: "s" })),
    ).toBeNull();
    expect(
      obterArmazenamento(lerConfigServidor({ ...base, PEDIDOS_WEBHOOK_URL: "https://script.google.com/x/exec", PEDIDOS_WEBHOOK_SEGREDO: "s" }))?.nome,
    ).toBe("webhook");
  });
});
