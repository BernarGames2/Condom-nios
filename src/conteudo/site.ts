/**
 * Todo o texto da página inicial fica aqui, separado dos componentes.
 * Para mudar uma frase, edite este arquivo; o layout não precisa mudar.
 *
 * Regras deste conteúdo (vêm do roteiro do projeto):
 * - o software ainda não existe: nada aqui pode dizer que existe;
 * - nada de números, depoimentos ou clientes inventados;
 * - demonstrações sempre marcadas como fictícias;
 * - nenhuma promessa de conformidade com normas.
 */

import type { NomeIcone } from "@/componentes/ui/Icone";

export const meta = {
  titulo: "Condomínios | Controle de Manutenções Preventivas",
  descricao:
    "Organize os prazos de manutenção dos seus condomínios com um calendário gratuito e ajude a construir uma gestão mais organizada.",
  nome: "Condomínios",
};

export const ancoras = {
  problema: "problema",
  comoFunciona: "como-funciona",
  demonstracao: "demonstracao",
  paraQuem: "para-quem-e",
  solicitar: "solicitar",
  recursos: "recursos",
  perguntas: "perguntas",
  privacidade: "privacidade",
} as const;

export const navegacao = [
  { rotulo: "Como funciona", ancora: ancoras.comoFunciona },
  { rotulo: "Recursos", ancora: ancoras.recursos },
  { rotulo: "Para quem é", ancora: ancoras.paraQuem },
] as const;

export const cta = {
  cabecalho: "Solicitar calendário grátis",
  cabecalhoCurto: "Calendário grátis",
};

export const hero = {
  sobretitulo: "Manutenção preventiva de condomínios",
  titulo: ["Manutenções em dia.", "Condomínios sob controle."],
  subtitulo:
    "Organize os prazos de manutenção, acompanhe os laudos e mantenha um histórico claro do que foi feito em cada condomínio.",
  botaoPrincipal: "Quero meu calendário grátis",
  botaoSecundario: "Conhecer a proposta",
  auxiliar: "Comece com uma planilha gratuita. A plataforma digital está em fase de validação.",
};

/** Ilustração do topo: painel de demonstração. Tudo fictício. */
export const painelDemo = {
  titulo: "Carteira de condomínios",
  selo: "Demonstração · dados fictícios",
  referencia: "2026-10-20",
  contagens: { em_dia: 21, proximo: 3, atrasado: 1 },
  janelaDias: { inicio: -10, fim: 60 },
  prazos: [
    { item: "Elevadores", servico: "revisão periódica", condominio: "Jardim Central", vencimento: "2026-10-18" },
    { item: "Gerador", servico: "manutenção", condominio: "Jardim Central", vencimento: "2026-10-25" },
    { item: "Caixa d'água", servico: "limpeza", condominio: "Jardim Central", vencimento: "2026-11-05" },
    { item: "Bombas de recalque", servico: "manutenção", condominio: "Residencial Aurora", vencimento: "2026-11-12" },
    { item: "Extintores", servico: "inspeção", condominio: "Edifício Monte Azul", vencimento: "2026-11-30" },
    { item: "Portões automáticos", servico: "manutenção", condominio: "Residencial Aurora", vencimento: "2026-12-14" },
  ],
  historico: [
    { item: "Extintores", servico: "recarga", condominio: "Residencial Aurora", data: "2026-10-14" },
    { item: "Portões automáticos", servico: "ajuste", condominio: "Edifício Monte Azul", data: "2026-10-09" },
  ],
};

export const problema = {
  sobretitulo: "O problema",
  titulo: "Uma planilha pode organizar os prazos. Mas quem acompanha o que vence amanhã?",
  itens: [
    {
      icone: "calendario-intervalo" as NomeIcone,
      titulo: "Prazos espalhados",
      texto:
        "Cada equipamento e cada serviço tem a sua periodicidade: elevadores, bombas, gerador, reservatórios, sistemas de incêndio, laudos. As datas ficam em contratos, e-mails e planilhas diferentes.",
    },
    {
      icone: "relogio" as NomeIcone,
      titulo: "Falta de visibilidade",
      texto:
        "Sem uma visão única, é difícil ver rápido o que está perto de vencer ou já passou do prazo, principalmente quando são vários prédios.",
    },
    {
      icone: "prancheta" as NomeIcone,
      titulo: "Prestação de contas",
      texto:
        "Na hora de mostrar ao conselho o que foi feito, reunir os registros e o histórico de manutenção de cada prédio pode tomar tempo.",
    },
  ],
  fechamento:
    "O objetivo do Condomínios é transformar esse controle em um processo mais organizado e fácil de acompanhar.",
};

export const comoFunciona = {
  sobretitulo: "Como funciona",
  titulo: "Um calendário de manutenção predial para cada condomínio",
  introducao: "Nesta fase, o calendário é montado em planilha, a partir das informações do seu prédio.",
  etapas: [
    {
      titulo: "Organize o condomínio",
      texto:
        "Identifique os equipamentos, serviços e documentos que precisam ser acompanhados: elevadores, bombas, gerador, reservatórios, sistemas de incêndio e laudos.",
    },
    {
      titulo: "Estruture o calendário",
      texto:
        "Com a lista e as datas das últimas execuções, a planilha gratuita reúne as atividades e os vencimentos que se aplicam ao prédio.",
    },
    {
      titulo: "Acompanhe e registre",
      texto: "Mantenha o histórico dos serviços realizados e veja os próximos compromissos de cada prédio.",
    },
  ],
  aviso:
    "Hoje o calendário é entregue em planilha, que abre no Excel e no Google Planilhas. Alertas automáticos e a plataforma digital estão em planejamento e ainda não estão disponíveis.",
};

/** Tabela da demonstração. Tudo fictício. */
export const demonstracao = {
  sobretitulo: "Demonstração",
  titulo: "Cada serviço com data, responsável e situação",
  introducao:
    "Um exemplo de como o controle de laudos e manutenções de um condomínio fica organizado no calendário.",
  selo: "Dados fictícios",
  condominio: "Condomínio Jardim Central",
  referencia: "2026-10-20",
  colunas: {
    condominio: "Condomínio",
    servico: "Equipamento ou serviço",
    ultima: "Última execução",
    proximo: "Próximo vencimento",
    responsavel: "Responsável",
    situacao: "Situação",
    registro: "Registro ou observação",
  },
  linhas: [
    {
      servico: "Elevadores — revisão periódica",
      ultima: "2026-09-18",
      proximo: "2026-10-18",
      responsavel: "Empresa de manutenção de elevadores",
      registro: "Visita remarcada pela empresa. Pedir nova data por escrito.",
    },
    {
      servico: "Sistema de gerador — manutenção",
      ultima: "2026-09-25",
      proximo: "2026-10-25",
      responsavel: "Empresa de geradores",
      registro: "Combinar com o zelador o acesso à sala do gerador.",
    },
    {
      servico: "Caixa d'água — limpeza",
      ultima: "2026-05-05",
      proximo: "2026-11-05",
      responsavel: "Empresa de limpeza de reservatórios",
      registro: "Avisar os moradores sobre a interrupção da água.",
    },
    {
      servico: "Sistema de proteção contra descargas atmosféricas — inspeção",
      ultima: "2026-03-10",
      proximo: "2027-03-10",
      responsavel: "Engenheiro eletricista",
      registro: "Relatório da inspeção arquivado na pasta do condomínio.",
    },
  ],
  legenda: [
    { situacao: "em_dia", texto: "vence em mais de 30 dias" },
    { situacao: "proximo", texto: "vence em até 30 dias" },
    { situacao: "atrasado", texto: "passou da data" },
  ] as const,
  aviso:
    "Exemplo ilustrativo, com datas fictícias. Os prazos de cada prédio são definidos conforme as características do edifício, as exigências aplicáveis, a documentação técnica e a orientação dos profissionais responsáveis. O calendário organiza esses prazos; ele não substitui laudos, inspeções nem a avaliação técnica.",
};

export const rotulosSituacao = {
  em_dia: "Em dia",
  proximo: "Próximo do vencimento",
  atrasado: "Atrasado",
} as const;

export const paraQuem = {
  sobretitulo: "Para quem é",
  titulo: "Para quem cuida da manutenção de vários prédios",
  publicos: [
    {
      icone: "pessoa" as NomeIcone,
      titulo: "Síndicos profissionais",
      texto: "Organize os prazos de diferentes prédios e facilite a preparação das informações para o conselho.",
      pontos: [
        "Um calendário por prédio, sempre no mesmo formato",
        "A situação de cada item: em dia, perto de vencer ou atrasado",
        "Uma base para levar à reunião do conselho",
      ],
    },
    {
      icone: "predios" as NomeIcone,
      titulo: "Administradoras",
      texto: "Busque um padrão de acompanhamento e documentação para a sua carteira de condomínios.",
      pontos: [
        "O mesmo modelo de calendário para os prédios da carteira",
        "Responsável e registro de cada serviço no mesmo lugar",
        "Comece por um prédio e avalie antes de ampliar",
      ],
    },
  ],
  observacao:
    "Zeladores e prestadores de serviço poderão registrar os serviços executados numa futura versão digital. Por enquanto, esse registro é feito na planilha.",
};

export const calendario = {
  sobretitulo: "Calendário gratuito",
  titulo: "Comece a organizar as manutenções do seu condomínio gratuitamente.",
  descricao:
    "Solicite o calendário inicial do Condomínios e ajude a testar uma forma mais simples de acompanhar os prazos de manutenção.",
  beneficios: [
    "Organização centralizada dos prazos",
    "Visão das próximas atividades",
    "Estrutura para registrar serviços executados",
    "Base inicial para organizar a prestação de contas",
  ],
  passosTitulo: "Depois do pedido",
  passos: {
    servidor: [
      "Você envia o pedido por este formulário.",
      "Respondemos no e-mail informado e pedimos a lista de equipamentos e as datas das últimas manutenções de um prédio.",
      "Montamos o calendário na planilha e enviamos para você.",
    ],
    email: [
      "Você preenche o pedido e o envia por e-mail.",
      "Respondemos no mesmo e-mail e pedimos a lista de equipamentos e as datas das últimas manutenções de um prédio.",
      "Montamos o calendário na planilha e enviamos para você.",
    ],
  },
  condicoes: "Sem custo, sem cartão de crédito e sem assinatura. Nesta fase, montamos o calendário de um prédio.",
};

export const formulario = {
  titulo: "Pedido do calendário grátis",
  obrigatorios: "Os campos marcados como opcionais podem ficar em branco.",
  campos: {
    nome: { rotulo: "Nome", autocomplete: "name" },
    email: { rotulo: "E-mail profissional", ajuda: "O e-mail que você usa no trabalho.", autocomplete: "email" },
    perfil: { rotulo: "Perfil" },
    quantidade: { rotulo: "Quantos condomínios você administra, aproximadamente?" },
    empresa: { rotulo: "Nome da administradora ou empresa", autocomplete: "organization" },
    dificuldade: { rotulo: "Principal dificuldade no controle de manutenções", vazio: "Escolha uma opção" },
    telefone: { rotulo: "Telefone para contato", ajuda: "Com DDD. Pode ser WhatsApp.", autocomplete: "tel" },
    comentario: {
      rotulo: "Comentário adicional",
      ajuda: "Por exemplo: qual manutenção atrasou por último, quanto custou ou como vocês controlam hoje.",
    },
    novidades: {
      rotulo: "Quero receber por e-mail novidades sobre o Condomínios.",
      ajuda: "Opcional. Você pode cancelar quando quiser.",
    },
  },
  opcional: "opcional",
  botao: "Solicitar calendário grátis",
  enviando: "Enviando…",
  privacidade: "Usamos seus dados só para responder a este pedido e montar o calendário.",
  privacidadeLink: "Política de privacidade",
  resumoErros: (quantidade: number) =>
    quantidade === 1 ? "Confira o campo destacado abaixo." : `Confira os ${quantidade} campos destacados abaixo.`,
  sucesso: {
    titulo: "Solicitação recebida!",
    texto:
      "Obrigado pelo interesse no Condomínios. Vamos analisar sua solicitação e entrar em contato pelo e-mail informado.",
  },
  erros: {
    rapido: "O envio foi rápido demais. Espere alguns segundos e tente de novo.",
    limite: "Recebemos muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.",
    indisponivel: "O formulário ainda não está pronto para receber pedidos.",
    falha: "Não conseguimos registrar seu pedido agora. Tente de novo em alguns minutos.",
    rede: "Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.",
    geral: "Algo deu errado ao enviar. Tente de novo em alguns minutos.",
    alternativa: (email: string) => `Se preferir, escreva para ${email}.`,
  },
  semScript: "Para enviar o pedido por aqui, ative o JavaScript do navegador.",
  /** Usado só na versão publicada no Claude, onde o pedido sai por e-mail. */
  envioPorEmail: {
    botao: "Preparar o e-mail do pedido",
    titulo: "Falta um passo: envie o e-mail",
    texto:
      "Nesta página o pedido sai pelo seu e-mail. A mensagem já está pronta: abra no Gmail ou no seu aplicativo de e-mail e envie.",
    para: "Para",
    assunto: "Assunto",
    mensagem: "Mensagem",
    copiar: "Copiar",
    copiado: "Copiado",
    copiarFalhou: "Selecionado. Use Ctrl+C ou Copiar do celular.",
    abrirGmail: "Abrir no Gmail",
    abrirApp: "Abrir no aplicativo de e-mail",
    editar: "Voltar e editar",
    depois: "Depois de enviar, você recebe a resposta no seu e-mail, em dias úteis.",
    semApp: "Se o aplicativo de e-mail não abrir, copie o endereço, o assunto e a mensagem.",
  },
};

export const recursos = {
  sobretitulo: "Recursos planejados",
  titulo: "O que está em planejamento para a plataforma digital",
  introducao:
    "Estas funções ainda não existem. Quais chegam primeiro depende do que aprendermos com síndicos e administradoras sobre a gestão de manutenção predial.",
  selo: "Em planejamento",
  itens: [
    { icone: "sino" as NomeIcone, titulo: "Alertas automáticos de vencimento", texto: "Avisos antes de cada prazo, para nada passar da data." },
    { icone: "predios" as NomeIcone, titulo: "Cadastro de vários condomínios", texto: "Todos os prédios da carteira em um só lugar." },
    { icone: "historico" as NomeIcone, titulo: "Histórico de manutenções e documentos", texto: "O que foi feito, quando e por quem, com os documentos de cada serviço." },
    { icone: "anexo" as NomeIcone, titulo: "Registro de serviços com fotos e anexos", texto: "Fotos, comprovantes e relatórios junto de cada serviço." },
    { icone: "ordem" as NomeIcone, titulo: "Ordens de serviço", texto: "Pedidos de serviço com responsável, prazo e situação." },
    { icone: "cotacao" as NomeIcone, titulo: "Acompanhamento de cotações", texto: "Os orçamentos de cada serviço lado a lado, até a aprovação." },
    { icone: "relatorio" as NomeIcone, titulo: "Relatórios para o conselho", texto: "O que está em dia, o que vence e o que atrasou, num resumo para a reunião." },
    { icone: "carteira" as NomeIcone, titulo: "Visão consolidada da carteira", texto: "A situação de todos os condomínios numa única tela." },
  ],
};

export const perguntas = {
  sobretitulo: "Dúvidas",
  titulo: "Perguntas frequentes",
  itens: [
    {
      pergunta: "O Condomínios já é um software?",
      resposta: "Ainda não. O projeto está em fase de validação, e o primeiro recurso é um calendário gratuito em planilha.",
    },
    {
      pergunta: "O calendário é gratuito?",
      resposta:
        "Sim. O calendário inicial é oferecido gratuitamente durante a validação do projeto, sem cartão de crédito e sem assinatura.",
    },
    {
      pergunta: "O calendário garante que meu condomínio esteja em conformidade?",
      resposta:
        "Não. O calendário é uma ferramenta de organização. As obrigações, as periodicidades e as exigências que valem para cada prédio dependem das características do condomínio e da orientação dos profissionais competentes.",
    },
    {
      pergunta: "Posso usar para vários prédios?",
      resposta:
        "O projeto é voltado especialmente a síndicos profissionais e administradoras que cuidam de vários condomínios. Nesta fase, montamos o calendário de um prédio para você testar. Para os outros, a planilha pode ser usada seguindo a estrutura e as instruções que vêm nela.",
    },
    {
      pergunta: "Quando a plataforma será lançada?",
      resposta: "Ainda não há data. O lançamento depende dos resultados da validação com síndicos e administradoras.",
    },
    {
      pergunta: "Preciso contratar alguma coisa?",
      resposta: "Não para solicitar o calendário gratuito. Qualquer oferta comercial futura será comunicada separadamente.",
    },
    {
      pergunta: "O que vocês fazem com os meus dados?",
      resposta:
        "Usamos o que você informa só para responder ao pedido, montar o calendário e, se você autorizar, mandar novidades. Os detalhes estão na política de privacidade.",
      link: "privacidade" as const,
    },
  ],
};

export const chamadaFinal = {
  titulo: "Mais clareza sobre a manutenção de cada condomínio.",
  texto:
    "Solicite o calendário gratuito e ajude a construir uma ferramenta que faça sentido para quem administra vários prédios.",
  botao: "Quero testar o calendário",
};

export const rodape = {
  resumo: "Organização de manutenção preventiva e documentação de condomínios. Projeto em fase de validação.",
  privacidade: "Política de privacidade",
  contato: "Contato",
  aviso:
    "O Condomínios é uma ferramenta de organização. Não substitui laudos, inspeções nem a orientação técnica de profissionais habilitados.",
};
