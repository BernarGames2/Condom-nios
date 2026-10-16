import type { Origem, Pedido } from "@/lib/pedido";

/** O que é gravado para cada pedido. */
export interface RegistroPedido extends Pedido {
  id: string;
  recebidoEm: string;
  origem: Origem | null;
}

export interface ResultadoGravacao {
  /** true quando o mesmo pedido (mesmo id) já tinha sido gravado. */
  repetido: boolean;
}

export interface Armazenamento {
  nome: string;
  salvar(registro: RegistroPedido): Promise<ResultadoGravacao>;
}
