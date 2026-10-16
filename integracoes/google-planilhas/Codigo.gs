/**
 * Condomínios: recebe os pedidos do site e grava numa planilha do Google.
 *
 * Instalação passo a passo em LEIAME.md (nesta mesma pasta).
 *
 * Propriedades do script (Configurações do projeto > Propriedades do script):
 *   SEGREDO       obrigatório. O mesmo valor de PEDIDOS_WEBHOOK_SEGREDO no site.
 *   AVISAR_EMAIL  opcional. Se preenchido, cada pedido novo gera um e-mail de aviso
 *                 para este endereço, com "Responder" indo direto para o interessado.
 */

var NOME_ABA = 'Pedidos';
var COLUNAS = [
  'Recebido em',
  'ID',
  'Nome',
  'E-mail',
  'Perfil',
  'Condomínios',
  'Administradora ou empresa',
  'Principal dificuldade',
  'Telefone',
  'Comentário',
  'Aceita novidades',
  'Origem',
  'Último contato',
];

var ROTULOS = {
  perfil: { sindico_profissional: 'Síndico profissional', administradora: 'Administradora', outro: 'Outro' },
  quantidade: { '1': '1', '2-5': '2 a 5', '6-15': '6 a 15', '16-30': '16 a 30', '30+': 'Mais de 30' },
  dificuldade: {
    vencimentos: 'Controlar os vencimentos',
    documentos: 'Organizar documentos e laudos',
    servicos: 'Registrar serviços realizados',
    relatorios: 'Preparar relatórios para o conselho',
    varios_predios: 'Acompanhar vários prédios',
    outro: 'Outro',
  },
  origem: {
    grupo: 'Grupo de síndicos',
    anuncio: 'Anúncio no Facebook ou Instagram',
    linkedin: 'LinkedIn',
    email: 'E-mail',
    indicacao: 'Indicação de alguém',
  },
};

/** Recebe o pedido enviado pelo site (rota /api/pedidos). */
function doPost(e) {
  var trava = LockService.getScriptLock();
  try {
    trava.waitLock(10000);
    var corpo = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var propriedades = PropertiesService.getScriptProperties();
    var segredo = propriedades.getProperty('SEGREDO');
    if (!segredo || corpo.segredo !== segredo) return responder({ ok: false, erro: 'nao_autorizado' });

    var p = corpo.pedido || {};
    if (!p.id || !p.nome || !p.email) return responder({ ok: false, erro: 'dados_incompletos' });

    var aba = obterAba();
    if (idJaGravado(aba, p.id)) return responder({ ok: true, repetido: true });

    aba.appendRow([
      p.recebidoEm ? new Date(p.recebidoEm) : new Date(),
      seguro(p.id),
      seguro(p.nome),
      seguro(p.email),
      rotulo('perfil', p.perfil),
      rotulo('quantidade', p.quantidade),
      seguro(p.empresa),
      rotulo('dificuldade', p.dificuldade),
      seguro(p.telefone),
      seguro(p.comentario),
      p.aceitaNovidades ? 'Sim' : 'Não',
      p.origem ? rotulo('origem', p.origem) : 'Não informado',
      '',
    ]);

    var aviso = propriedades.getProperty('AVISAR_EMAIL');
    if (aviso) avisarPorEmail(aviso, p);

    return responder({ ok: true });
  } catch (erro) {
    // Sem dados pessoais no registro de execução.
    console.error('Falha ao gravar pedido: ' + (erro && erro.message));
    return responder({ ok: false, erro: 'falha' });
  } finally {
    try {
      trava.releaseLock();
    } catch (semTrava) {
      // a trava não chegou a ser obtida
    }
  }
}

/** Abrir o endereço do aplicativo no navegador mostra se a instalação deu certo. */
function doGet() {
  return responder({ ok: true, servico: 'condominios-pedidos' });
}

/**
 * Retenção: apaga pedidos com mais de 12 meses desde o último contato
 * (ou desde o recebimento, se "Último contato" estiver vazio).
 * Programe um acionador mensal para esta função (veja LEIAME.md).
 */
function apagarPedidosAntigos() {
  var aba = obterAba();
  var limite = new Date();
  limite.setMonth(limite.getMonth() - 12);
  var ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return;
  var valores = aba.getRange(2, 1, ultimaLinha - 1, COLUNAS.length).getValues();
  // de baixo para cima, para os números das linhas não mudarem durante a exclusão
  for (var i = valores.length - 1; i >= 0; i--) {
    var recebido = valores[i][0] instanceof Date ? valores[i][0] : null;
    var contato = valores[i][12] instanceof Date ? valores[i][12] : null;
    var referencia = contato && (!recebido || contato > recebido) ? contato : recebido;
    if (referencia && referencia < limite) aba.deleteRow(i + 2);
  }
}

function obterAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    aba.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
    aba.getRange('M:M').setNumberFormat('dd/mm/yyyy');
  }
  return aba;
}

function idJaGravado(aba, id) {
  var ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return false;
  var ids = aba.getRange(2, 2, ultimaLinha - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return true;
  }
  return false;
}

/** Evita que um texto começando com =, +, - ou @ vire fórmula na planilha. */
function seguro(valor) {
  var texto = valor === undefined || valor === null ? '' : String(valor);
  return /^[=+\-@\t\r]/.test(texto) ? "'" + texto : texto;
}

function rotulo(grupo, valor) {
  var opcoes = ROTULOS[grupo] || {};
  return opcoes[valor] || seguro(valor);
}

function avisarPorEmail(destino, p) {
  var linhas = [
    'Olá! Quero o calendário de manutenção grátis.',
    '',
    'Nome: ' + p.nome,
    'E-mail profissional: ' + p.email,
    'Perfil: ' + rotulo('perfil', p.perfil),
    'Condomínios que administro: ' + rotulo('quantidade', p.quantidade),
  ];
  if (p.empresa) linhas.push('Administradora ou empresa: ' + p.empresa);
  if (p.dificuldade) linhas.push('Principal dificuldade: ' + rotulo('dificuldade', p.dificuldade));
  if (p.telefone) linhas.push('Telefone: ' + p.telefone);
  if (p.comentario) linhas.push('', 'Comentário:', p.comentario);
  linhas.push('', 'Quero receber novidades sobre o Condomínios: ' + (p.aceitaNovidades ? 'Sim' : 'Não'));
  linhas.push('Como cheguei à página: ' + (p.origem ? rotulo('origem', p.origem) : 'Não informado'));
  linhas.push('', '(Pedido enviado pelo formulário do site. Responda este e-mail para falar direto com a pessoa.)');

  MailApp.sendEmail({
    to: destino,
    subject: 'Quero o calendário grátis (pelo site)',
    replyTo: p.email,
    body: linhas.join('\n'),
  });
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
