import { obterArmazenamento, type RegistroPedido } from "@/lib/armazenamento";
import { dentroDoLimite, idJaRegistrado, idValido, lembrarId, tempoSuspeito } from "@/lib/antispam";
import { lerConfigServidor, sitePublico } from "@/lib/config";
import { lerOrigem, validarPedido, type ErrosPedido } from "@/lib/pedido";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAMANHO_MAXIMO = 16 * 1024;

type CodigoErro =
  | "formato"
  | "tamanho"
  | "origem"
  | "limite"
  | "rapido"
  | "validacao"
  | "indisponivel"
  | "falha";

function responder(status: number, corpo: { ok: boolean; erro?: CodigoErro; campos?: ErrosPedido; repetido?: boolean }) {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

function hostDaRequisicao(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return (encaminhado || request.headers.get("host") || new URL(request.url).host).toLowerCase();
}

function origemAutorizada(request: Request, permitidas: string[]): boolean {
  const origem = request.headers.get("origin");
  // Navegadores sempre mandam Origin num POST com fetch. Sem ele, não é um envio
  // entre sites (CSRF); a validação, o limite de taxa e o JSON obrigatório continuam valendo.
  if (!origem) return true;
  let host: string;
  try {
    host = new URL(origem).host.toLowerCase();
  } catch {
    return false;
  }
  const aceitos = new Set<string>([hostDaRequisicao(request)]);
  for (const endereco of [sitePublico.url, ...permitidas]) {
    try {
      aceitos.add(new URL(endereco).host.toLowerCase());
    } catch {
      // endereço mal configurado: ignora
    }
  }
  return aceitos.has(host);
}

function ipDoCliente(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "desconhecido"
  );
}

export async function POST(request: Request) {
  const config = lerConfigServidor();

  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return responder(415, { ok: false, erro: "formato" });
  }
  if (!origemAutorizada(request, config.origensPermitidas)) {
    return responder(403, { ok: false, erro: "origem" });
  }
  const tamanhoDeclarado = Number(request.headers.get("content-length") ?? "0");
  if (tamanhoDeclarado > TAMANHO_MAXIMO) {
    return responder(413, { ok: false, erro: "tamanho" });
  }

  const texto = await request.text();
  if (texto.length > TAMANHO_MAXIMO) return responder(413, { ok: false, erro: "tamanho" });

  let dados: Record<string, unknown>;
  try {
    const lido: unknown = JSON.parse(texto);
    if (!lido || typeof lido !== "object" || Array.isArray(lido)) throw new Error("não é objeto");
    dados = lido as Record<string, unknown>;
  } catch {
    return responder(400, { ok: false, erro: "formato" });
  }

  // Campo invisível para pessoas: se veio preenchido, é robô. Responde como se tivesse
  // dado certo para não ensinar o robô, mas não grava nada.
  if (typeof dados.site === "string" && dados.site.trim() !== "") {
    return responder(200, { ok: true });
  }

  if (!dentroDoLimite(ipDoCliente(request), config.limiteTentativas)) {
    return responder(429, { ok: false, erro: "limite" });
  }

  if (tempoSuspeito(dados.inicio)) {
    return responder(400, { ok: false, erro: "rapido" });
  }

  if (!idValido(dados.id)) {
    return responder(400, { ok: false, erro: "formato" });
  }
  const id = dados.id.toLowerCase();

  const validacao = validarPedido(dados);
  if (!validacao.ok) {
    return responder(400, { ok: false, erro: "validacao", campos: validacao.erros });
  }

  if (idJaRegistrado(id)) {
    return responder(200, { ok: true, repetido: true });
  }

  const armazenamento = obterArmazenamento(config);
  if (!armazenamento) {
    return responder(503, { ok: false, erro: "indisponivel" });
  }

  const origem = typeof dados.origem === "string" ? lerOrigem(dados.origem, "") : null;
  const registro: RegistroPedido = {
    ...validacao.pedido,
    id,
    recebidoEm: new Date().toISOString(),
    origem,
  };

  try {
    const resultado = await armazenamento.salvar(registro);
    lembrarId(id);
    return responder(resultado.repetido ? 200 : 201, { ok: true, repetido: resultado.repetido });
  } catch (erro) {
    // Nunca registre os dados da pessoa no log; só o motivo técnico.
    console.error(`[pedidos] falha ao gravar no destino "${armazenamento.nome}": ${(erro as Error).message}`);
    return responder(502, { ok: false, erro: "falha" });
  }
}
