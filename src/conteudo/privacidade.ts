/**
 * Política de privacidade. Ela precisa descrever o que acontece de verdade:
 * se mudar a hospedagem, o destino dos pedidos ou adicionar medição,
 * atualize este arquivo ANTES de publicar a mudança.
 *
 * canal "planilha": site próprio com o formulário gravando na planilha do Google.
 * canal "email":    o pedido sai pelo e-mail da própria pessoa (versão do Claude ou site próprio sem planilha).
 */

export type CanalPedido = "planilha" | "email";

export interface SecaoPrivacidade {
  titulo: string;
  paragrafos?: string[];
  itens?: string[];
}

export interface OpcoesPrivacidade {
  canal: CanalPedido;
  /** Quem hospeda: "Vercel", "Netlify", "Claude, da Anthropic"... */
  hospedagem: string;
  /** true na versão publicada no Claude. */
  artefato: boolean;
  responsavel: string;
  email: string;
}

export const atualizadaEm = "16/10/2026";

const linhaClaude =
  "Claude, da Anthropic, ferramenta de inteligência artificial que lê os pedidos recebidos, anota um resumo numa página interna de controle e ajuda a redigir as respostas.";

function servicos({ canal, hospedagem, artefato }: OpcoesPrivacidade): string[] {
  const lugar = artefato ? "esta página" : "o site";
  if (canal === "planilha") {
    return [
      `${hospedagem}, que hospeda ${lugar} e processa o envio do formulário.`,
      "Google Planilhas, onde o pedido é gravado.",
      "Gmail, do Google, onde chegam o aviso de cada pedido e as conversas por e-mail.",
      linhaClaude,
    ];
  }
  return [
    `${hospedagem}, que hospeda ${lugar}. ${artefato ? "A página" : "O site"} não grava o pedido: ele sai do seu próprio e-mail.`,
    "Gmail, do Google, onde o pedido e as conversas chegam.",
    linhaClaude,
  ];
}

export function secoesPrivacidade(opcoes: OpcoesPrivacidade): SecaoPrivacidade[] {
  const { responsavel, email, artefato } = opcoes;
  const quem = responsavel
    ? `Quem decide sobre o uso dos dados e responde por eles é ${responsavel}, que conduz o projeto.`
    : "Quem decide sobre o uso dos dados e responde por eles é a pessoa que conduz o projeto.";
  const contato = email
    ? `Para qualquer assunto sobre seus dados, escreva para ${email}.`
    : "O canal de contato será informado aqui antes de o site receber pedidos.";

  return [
    {
      titulo: "Quem cuida dos seus dados",
      paragrafos: [
        "O Condomínios é um projeto em fase de validação e ainda não tem empresa aberta. " + quem,
        contato,
      ],
    },
    {
      titulo: "Quais dados coletamos",
      itens: [
        "No pedido do calendário: nome, e-mail profissional, perfil e quantidade aproximada de condomínios que você administra.",
        "Se você quiser informar: nome da administradora ou empresa, principal dificuldade, telefone e comentário.",
        "Se você marcar a opção: sua autorização para receber novidades por e-mail.",
        "Como você chegou à página, quando o link indicar (por exemplo, um grupo ou um anúncio).",
        "Depois do pedido, as informações do prédio que você decidir enviar para montarmos o calendário, como equipamentos e datas de manutenção.",
      ],
      paragrafos: ["Não pedimos senha, documentos pessoais nem dados de pagamento."],
    },
    {
      titulo: "Para que usamos",
      itens: [
        "Responder ao seu pedido, montar o calendário e enviá-lo a você.",
        "Entender, nesta fase de validação, como síndicos e administradoras controlam as manutenções, para decidir se a plataforma digital deve ser construída.",
        "Enviar novidades sobre o Condomínios, só se você autorizar.",
      ],
      paragrafos: ["Não vendemos seus dados e não os usamos para publicidade."],
    },
    {
      titulo: "Por que podemos usar esses dados",
      paragrafos: [
        "Os dados do pedido são usados para atender a uma solicitação sua, como prevê a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, art. 7º, V). As novidades por e-mail dependem do seu consentimento (art. 7º, I), que você pode retirar quando quiser.",
      ],
    },
    {
      titulo: "Onde os dados ficam e quem tem acesso",
      itens: servicos(opcoes),
      paragrafos: [
        "Só o responsável pelo projeto tem acesso aos pedidos. Esses serviços são de empresas com sede nos Estados Unidos e podem guardar dados fora do Brasil, com as proteções descritas nas políticas de cada um.",
      ],
    },
    {
      titulo: "Por quanto tempo guardamos",
      paragrafos: [
        "Guardamos o pedido e as mensagens por até 12 meses depois do último contato e, então, apagamos. Se você pedir a exclusão antes disso, apagamos em até 15 dias.",
      ],
    },
    {
      titulo: "Seus direitos",
      paragrafos: [
        "Você pode pedir a qualquer momento: a confirmação de que tratamos seus dados, o acesso a eles, a correção, a exclusão, a informação sobre com quem foram compartilhados e a retirada da autorização para receber novidades. " +
          (email ? `Escreva para ${email}; ` : "Use o canal de contato acima; ") +
          "respondemos em até 15 dias.",
        "Você também pode apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD).",
      ],
    },
    {
      titulo: "Cookies e medição",
      paragrafos: [
        artefato
          ? "Esta página não instala cookies nem ferramentas de medição. O Claude, que hospeda a página, tem a própria política de privacidade."
          : "O site não usa cookies de publicidade nem ferramentas de medição de terceiros. Se isso mudar, esta política será atualizada antes.",
      ],
    },
    {
      titulo: "Segurança",
      paragrafos: [
        artefato
          ? "A página usa conexão segura (HTTPS). O acesso aos pedidos é restrito ao responsável pelo projeto."
          : "O site usa conexão segura (HTTPS). O acesso aos pedidos é restrito ao responsável pelo projeto, e os dados pessoais não aparecem em registros públicos.",
      ],
    },
    {
      titulo: "Mudanças nesta política",
      paragrafos: ["Se esta política mudar, a nova versão aparece aqui, com a data de atualização."],
    },
  ];
}
