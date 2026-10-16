/**
 * Proteções simples contra spam e abuso do formulário.
 *
 * O controle de taxa e a memória de envios ficam na memória do processo: valem
 * por instância do servidor. Para uma página de validação, isso basta; se o
 * volume crescer, troque por um armazenamento compartilhado (Redis, por exemplo).
 */

const JANELA_TAXA_MS = 10 * 60 * 1000;
const MAXIMO_PADRAO = 6;
const VALIDADE_ID_MS = 30 * 60 * 1000;
const TEMPO_MINIMO_MS = 2000;
const TEMPO_MAXIMO_MS = 24 * 60 * 60 * 1000;
const LIMITE_ENTRADAS = 5000;

const tentativas = new Map<string, number[]>();
const idsRecentes = new Map<string, number>();

function podar<T>(mapa: Map<string, T>, expirou: (valor: T) => boolean): void {
  if (mapa.size < LIMITE_ENTRADAS) return;
  for (const [chave, valor] of mapa) {
    if (expirou(valor)) mapa.delete(chave);
  }
  // se ainda estiver cheio, descarta os mais antigos
  while (mapa.size >= LIMITE_ENTRADAS) {
    const primeira = mapa.keys().next().value;
    if (primeira === undefined) break;
    mapa.delete(primeira);
  }
}

/** Registra uma tentativa e diz se ela está dentro do limite (padrão: 6 a cada 10 minutos). */
export function dentroDoLimite(chave: string, maximo = MAXIMO_PADRAO, agora = Date.now()): boolean {
  const recentes = (tentativas.get(chave) ?? []).filter((t) => agora - t < JANELA_TAXA_MS);
  recentes.push(agora);
  tentativas.set(chave, recentes);
  podar(tentativas, (lista) => lista.every((t) => agora - t >= JANELA_TAXA_MS));
  return recentes.length <= maximo;
}

/** Envio feito rápido demais (robô) ou com horário de início inválido. */
export function tempoSuspeito(inicio: unknown, agora = Date.now()): boolean {
  if (typeof inicio !== "number" || !Number.isFinite(inicio)) return true;
  const decorrido = agora - inicio;
  return decorrido < TEMPO_MINIMO_MS || decorrido > TEMPO_MAXIMO_MS;
}

const FORMATO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function idValido(id: unknown): id is string {
  return typeof id === "string" && FORMATO_ID.test(id);
}

/** Diz se este id já foi gravado há pouco (evita registros duplicados por duplo clique ou nova tentativa). */
export function idJaRegistrado(id: string, agora = Date.now()): boolean {
  const quando = idsRecentes.get(id);
  return quando !== undefined && agora - quando < VALIDADE_ID_MS;
}

export function lembrarId(id: string, agora = Date.now()): void {
  idsRecentes.set(id, agora);
  podar(idsRecentes, (quando) => agora - quando >= VALIDADE_ID_MS);
}

/** Só para testes. */
export function limparMemoriaAntispam(): void {
  tentativas.clear();
  idsRecentes.clear();
}
