import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Armazenamento, RegistroPedido } from "./tipos";

/**
 * Grava cada pedido como uma linha JSON em um arquivo local.
 * Serve para desenvolvimento, testes ou um servidor próprio com disco permanente.
 * Não use em hospedagens sem disco permanente (Netlify, Vercel): o arquivo some.
 */
export function criarArmazenamentoArquivo(caminho: string): Armazenamento {
  const destino = path.resolve(caminho);
  let fila: Promise<unknown> = Promise.resolve();

  async function idsGravados(): Promise<Set<string>> {
    try {
      const conteudo = await readFile(destino, "utf8");
      const ids = new Set<string>();
      for (const linha of conteudo.split("\n")) {
        if (!linha.trim()) continue;
        try {
          const registro = JSON.parse(linha) as { id?: unknown };
          if (typeof registro.id === "string") ids.add(registro.id);
        } catch {
          // linha corrompida: ignora
        }
      }
      return ids;
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code === "ENOENT") return new Set();
      throw erro;
    }
  }

  return {
    nome: "arquivo",
    salvar(registro: RegistroPedido) {
      // uma gravação por vez, para não intercalar linhas
      const tarefa = fila.then(async () => {
        await mkdir(path.dirname(destino), { recursive: true });
        const ids = await idsGravados();
        if (ids.has(registro.id)) return { repetido: true };
        await appendFile(destino, JSON.stringify(registro) + "\n", { encoding: "utf8", mode: 0o600 });
        return { repetido: false };
      });
      fila = tarefa.catch(() => undefined);
      return tarefa;
    },
  };
}
