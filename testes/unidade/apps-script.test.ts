import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Roda integracoes/google-planilhas/Codigo.gs com imitações dos serviços do Google
 * (planilha, propriedades, trava, e-mail). Não substitui o teste na conta do Google,
 * mas confere a lógica: segredo, gravação, duplicados, fórmulas e retenção.
 */
type Linha = unknown[];

function criarAmbiente(propriedades: Record<string, string>) {
  const linhas: Linha[] = [];
  const emails: Record<string, unknown>[] = [];
  let abaCriada = false;

  const aba = {
    appendRow: (linha: Linha) => linhas.push(linha),
    getLastRow: () => linhas.length,
    setFrozenRows: () => undefined,
    deleteRow: (numero: number) => linhas.splice(numero - 1, 1),
    getRange: (linha: number | string, coluna?: number, total?: number, colunas?: number) => ({
      setFontWeight: () => undefined,
      setNumberFormat: () => undefined,
      getValues: () =>
        linhas
          .slice((linha as number) - 1, (linha as number) - 1 + (total ?? 0))
          .map((l) => l.slice((coluna ?? 1) - 1, (coluna ?? 1) - 1 + (colunas ?? 1))),
    }),
  };

  const contexto = vm.createContext({
    console: { error: () => undefined },
    Date,
    JSON,
    String,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: () => (abaCriada ? aba : null),
        insertSheet: () => {
          abaCriada = true;
          return aba;
        },
      }),
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (nome: string) => propriedades[nome] ?? null }) },
    LockService: { getScriptLock: () => ({ waitLock: () => undefined, releaseLock: () => undefined }) },
    MailApp: { sendEmail: (mensagem: Record<string, unknown>) => emails.push(mensagem) },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (texto: string) => ({ setMimeType: () => ({ texto }) }),
    },
  });
  vm.runInContext(readFileSync(path.resolve("integracoes/google-planilhas/Codigo.gs"), "utf8"), contexto);

  const chamar = (corpo: unknown) =>
    JSON.parse((contexto.doPost({ postData: { contents: JSON.stringify(corpo) } }) as { texto: string }).texto);
  return { contexto, linhas, emails, chamar };
}

const pedido = {
  id: "3f1c2a9e-8b7d-4c6e-9f00-1a2b3c4d5e6f",
  recebidoEm: "2026-10-16T15:00:00.000Z",
  origem: "grupo",
  nome: "Ana Souza",
  email: "ana@administradora.com.br",
  perfil: "administradora",
  quantidade: "6-15",
  empresa: "=HYPERLINK(\"http://x\")",
  dificuldade: "relatorios",
  telefone: "+55 11 91234-5678",
  comentario: "",
  aceitaNovidades: true,
};

describe("script da planilha do Google", () => {
  let ambiente: ReturnType<typeof criarAmbiente>;
  beforeEach(() => {
    ambiente = criarAmbiente({ SEGREDO: "s3gr3do", AVISAR_EMAIL: "dono@exemplo.com" });
  });

  it("recusa pedido sem o segredo certo e não grava nada", () => {
    expect(ambiente.chamar({ segredo: "errado", pedido })).toEqual({ ok: false, erro: "nao_autorizado" });
    expect(ambiente.linhas).toHaveLength(0);
  });

  it("grava cabeçalho e linha com rótulos em português e avisa por e-mail", () => {
    expect(ambiente.chamar({ segredo: "s3gr3do", pedido })).toEqual({ ok: true });
    expect(ambiente.linhas[0]?.[0]).toBe("Recebido em");
    const linha = ambiente.linhas[1] ?? [];
    expect(linha.slice(1, 12)).toEqual([
      pedido.id,
      "Ana Souza",
      "ana@administradora.com.br",
      "Administradora",
      "6 a 15",
      "'=HYPERLINK(\"http://x\")",
      "Preparar relatórios para o conselho",
      "'+55 11 91234-5678",
      "",
      "Sim",
      "Grupo de síndicos",
    ]);
    expect(ambiente.emails).toHaveLength(1);
    expect(ambiente.emails[0]).toMatchObject({ to: "dono@exemplo.com", replyTo: "ana@administradora.com.br" });
    expect(String(ambiente.emails[0]?.body)).toContain("Condomínios que administro: 6 a 15");
  });

  it("não duplica o mesmo id", () => {
    ambiente.chamar({ segredo: "s3gr3do", pedido });
    expect(ambiente.chamar({ segredo: "s3gr3do", pedido })).toEqual({ ok: true, repetido: true });
    expect(ambiente.linhas).toHaveLength(2);
  });

  it("apaga pedidos com mais de 12 meses desde o último contato", () => {
    ambiente.chamar({ segredo: "s3gr3do", pedido: { ...pedido, id: "a", recebidoEm: "2020-01-01T00:00:00Z" } });
    ambiente.chamar({ segredo: "s3gr3do", pedido: { ...pedido, id: "b", recebidoEm: new Date().toISOString() } });
    ambiente.chamar({ segredo: "s3gr3do", pedido: { ...pedido, id: "c", recebidoEm: "2020-01-01T00:00:00Z" } });
    // "c" teve contato recente: fica
    const linhaC = ambiente.linhas[3];
    if (linhaC) linhaC[12] = new Date();
    ambiente.contexto.apagarPedidosAntigos();
    expect(ambiente.linhas.slice(1).map((l) => l[1])).toEqual(["b", "c"]);
  });
});
