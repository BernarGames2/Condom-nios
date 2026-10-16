import type { ConfigServidor } from "@/lib/config";
import { criarArmazenamentoArquivo } from "./arquivo";
import { criarArmazenamentoWebhook } from "./webhook";
import type { Armazenamento } from "./tipos";

export type { Armazenamento, RegistroPedido, ResultadoGravacao } from "./tipos";

/**
 * Escolhe onde gravar os pedidos. Devolve null quando nada está configurado:
 * nesse caso a rota responde que o formulário ainda não está disponível,
 * em vez de fingir que gravou.
 */
export function obterArmazenamento(config: ConfigServidor): Armazenamento | null {
  if (config.destino === "arquivo") return criarArmazenamentoArquivo(config.arquivo);
  if (config.destino === "webhook") {
    if (!config.webhookUrl || !config.webhookSegredo) return null;
    try {
      const url = new URL(config.webhookUrl);
      const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (url.protocol !== "https:" && !local) return null;
    } catch {
      return null;
    }
    return criarArmazenamentoWebhook(config.webhookUrl, config.webhookSegredo);
  }
  return null;
}
