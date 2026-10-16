import type { Armazenamento, RegistroPedido } from "./tipos";

const TEMPO_LIMITE_MS = 10_000;

/**
 * Envia cada pedido para um endereço externo (por exemplo, o script da planilha
 * do Google em integracoes/google-planilhas). O segredo vai no corpo da
 * requisição porque o Apps Script não lê cabeçalhos personalizados.
 *
 * O pedido só conta como gravado quando o destino responde {"ok": true}.
 */
export function criarArmazenamentoWebhook(url: string, segredo: string): Armazenamento {
  return {
    nome: "webhook",
    async salvar(registro: RegistroPedido) {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segredo, pedido: registro }),
        redirect: "follow",
        signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
        cache: "no-store",
      });

      if (!resposta.ok) throw new Error(`destino respondeu ${resposta.status}`);

      let corpo: unknown;
      try {
        corpo = await resposta.json();
      } catch {
        throw new Error("destino respondeu algo que não é JSON");
      }

      const dados = (corpo ?? {}) as { ok?: unknown; repetido?: unknown; erro?: unknown };
      if (dados.ok !== true) {
        throw new Error(`destino recusou o pedido (${typeof dados.erro === "string" ? dados.erro : "sem motivo"})`);
      }
      return { repetido: dados.repetido === true };
    },
  };
}
