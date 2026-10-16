# Condomínios: site de validação

Landing page do **Condomínios**, um projeto que ajuda síndicos profissionais e administradoras a organizar manutenções preventivas, controlar vencimentos de laudos e prestar contas ao conselho.

O software ainda não existe. O site apresenta a proposta, oferece o **calendário de manutenção grátis** (entregue em planilha) e coleta pedidos de quem quer testar. O objetivo é medir interesse real antes de construir a plataforma.

## O que está pronto e o que depende de configuração

| Parte | Situação |
|---|---|
| Página inicial com as 11 seções do roteiro, celular e computador, tema claro e escuro | Pronta e testada |
| Formulário com validação no navegador e no servidor, mensagens em português, proteção contra envio duplicado e contra robôs | Pronto e testado |
| Publicação sem configuração: sem planilha ligada, o formulário prepara um e-mail com o assunto "Quero o calendário grátis" (como na versão do Claude) | Pronta e testada |
| Gravação dos pedidos em arquivo local (`.dados/pedidos.jsonl`) | Pronta, para desenvolvimento ou servidor próprio |
| Gravação na planilha do Google (`integracoes/google-planilhas`) | Código pronto e testado com imitação do Google; **falta criar a planilha na sua conta** (10 min) |
| Política de privacidade (`/privacidade`) com retenção de 12 meses e canal para pedidos | Pronta; **confira o nome do responsável e a hospedagem antes de publicar** |
| SEO: título, descrição, Open Graph, sitemap, robots, imagem de compartilhamento | Pronto; **falta o domínio** em `NEXT_PUBLIC_SITE_URL` |
| Medição de eventos | Preparada; **nenhuma ferramenta instalada** (veja Medição) |
| Hospedagem e domínio | **Dependem de você** (veja Publicar) |
| Versão publicada no Claude (pedido por e-mail) | Gerada pelos mesmos componentes com `npm run artefato` |

## Estrutura

```
src/
  app/                    rotas do Next.js
    page.tsx              página inicial
    privacidade/page.tsx  política de privacidade
    api/pedidos/route.ts  recebe o formulário (validação, antispam, gravação)
    layout.tsx            metadados, fontes, medição
    sitemap.ts, robots.ts, icon.svg, apple-icon.png, globals.css
  conteudo/
    site.ts               TODO o texto da página (edite aqui)
    privacidade.ts        texto da política de privacidade
  componentes/            componentes visuais reutilizáveis
    secoes/               uma seção por arquivo, na ordem do roteiro
    formulario/           formulário de pedido
    demo/                 painel de demonstração (dados fictícios)
    ui/                   botões, selos, ícones, logotipo
  lib/
    pedido.ts             opções, validação e texto do pedido (navegador e servidor)
    antispam.ts           limite de tentativas, tempo mínimo, ids repetidos
    armazenamento/        onde gravar: arquivo ou webhook (planilha do Google)
    config.ts             variáveis de ambiente (segredos só no servidor)
    eventos.ts            medição sem rastreador
  artefato/               versão do Claude (gerada a partir dos mesmos componentes)
integracoes/google-planilhas/  script da planilha + passo a passo (LEIAME.md)
scripts/                  gerar a versão do Claude e as imagens
testes/unidade/           testes de lógica (Vitest)
testes/e2e/               testes no navegador (Playwright)
public/og.png             imagem de compartilhamento
```

## Rodar no seu computador

Precisa do Node.js 20.9 ou mais novo.

```bash
npm install
cp .env.example .env.local     # depois edite os valores
npm run dev                    # abre em http://localhost:3000
```

Em desenvolvimento, sem configurar nada, os pedidos vão para `.dados/pedidos.jsonl`. Essa pasta está no `.gitignore` porque tem dados pessoais.

## Variáveis de ambiente

| Variável | Para quê | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Endereço público (metadados, sitemap, robots). Na Vercel e na Netlify, sem ela, vale o endereço que elas criam | `https://www.seudominio.com.br` |
| `NEXT_PUBLIC_CONTATO_EMAIL` | Contato no rodapé, na política e destino dos pedidos por e-mail (padrão: `arantesbernardo432@gmail.com`) | `contato@seudominio.com.br` |
| `NEXT_PUBLIC_RESPONSAVEL` | Quem responde pelos dados na política (padrão: `Bernardo`; troque pela empresa e CNPJ quando existirem) | `Bernardo` |
| `NEXT_PUBLIC_HOSPEDAGEM` | Nome da hospedagem na política (padrão: detecta Vercel ou Netlify) | `Vercel` |
| `MODO_FORMULARIO` | Força `email` ou `servidor` (padrão: `servidor` só quando há destino configurado) | vazio |
| `PEDIDOS_DESTINO` | `webhook` (planilha) ou `arquivo` | `webhook` |
| `PEDIDOS_WEBHOOK_URL` | Endereço `/exec` do script da planilha | `https://script.google.com/macros/s/…/exec` |
| `PEDIDOS_WEBHOOK_SEGREDO` | Segredo combinado com o script (só no servidor) | frase longa e aleatória |
| `PEDIDOS_ARQUIVO` | Caminho do arquivo, se `PEDIDOS_DESTINO=arquivo` | `.dados/pedidos.jsonl` |
| `ORIGENS_PERMITIDAS` | Outros domínios autorizados a enviar o formulário | vazio |
| `PEDIDOS_LIMITE_TENTATIVAS` | Envios por IP a cada 10 minutos (padrão 6) | vazio |

As variáveis `NEXT_PUBLIC_` entram na página no momento do build: depois de mudar, publique de novo.

Em produção, sem destino configurado, o formulário **prepara um e-mail** que a própria pessoa envia, com o assunto "Quero o calendário grátis" e os campos no formato que a rotina diária lê. Ele nunca diz que o pedido foi recebido nesse modo. Com a planilha ligada (`PEDIDOS_DESTINO=webhook`), o pedido é gravado pelo servidor e só então aparece "Solicitação recebida!". Se a rota `/api/pedidos` for chamada sem destino, ela responde 503 em vez de fingir que gravou.

## Testes

```bash
npm test                 # lógica: validação, antispam, gravação, rota, configuração, script da planilha
npm run preparar:e2e     # compila o site com gravação, o site sem planilha e a versão do Claude
npm run test:e2e         # navegador: computador, celular e site sem planilha
```

Os testes no navegador cobrem: ordem das seções, links internos, metadados, rolagem lateral, erros no console, menu do celular, perguntas frequentes pelo teclado, erros do formulário em português, envio válido gravado no arquivo, duplo clique, erro do servidor, envio rápido demais, envio sem JavaScript, API recusando outro site, acessibilidade (axe) nos temas claro e escuro, o pedido por e-mail no site sem planilha e a versão do Claude.

## Publicar

O site sobe **sem nenhuma variável de ambiente**. Nesse caso, o formulário prepara o pedido por e-mail, a política de privacidade cita a hospedagem certa e o endereço vem da própria hospedagem. A planilha do Google pode ser ligada depois.

### Vercel

1. Entre em [vercel.com](https://vercel.com) com a conta do GitHub.
2. Clique em **Add New > Project**, escolha o repositório `Condom-nios` e clique em **Deploy**. A Vercel reconhece o Next.js sozinha. Antes de publicar, dá para trocar o nome do projeto (ele vira o endereço).
3. O site fica em `https://<nome-do-projeto>.vercel.app`.

Atenção: o plano grátis da Vercel (Hobby) é para uso pessoal e não comercial. Um site que divulga um produto ou serviço é uso comercial e, pelas regras da Vercel, precisa do plano **Pro** (US$ 20 por mês).

### Netlify (grátis, aceita uso comercial)

1. Entre em [netlify.com](https://www.netlify.com) com a conta do GitHub.
2. Clique em **Add new site > Import an existing project**, escolha o repositório e publique. A Netlify reconhece o Next.js e usa `npm run build`.

### Ligar a planilha do Google (opcional)

Siga `integracoes/google-planilhas/LEIAME.md`. Depois cadastre `PEDIDOS_DESTINO`, `PEDIDOS_WEBHOOK_URL` e `PEDIDOS_WEBHOOK_SEGREDO` nas variáveis de ambiente da hospedagem e **publique de novo**. A partir daí o formulário grava direto na planilha.

### Domínio

1. Escolha e registre o domínio no [Registro.br](https://registro.br). Um `.com.br` custa cerca de R$ 40 por ano (preço de setembro de 2026; confira no site). Precisa de CPF ou CNPJ.
2. Na hospedagem, adicione o domínio e siga as instruções de DNS. O HTTPS é ativado automaticamente.
3. Cadastre `NEXT_PUBLIC_SITE_URL` com o domínio e publique de novo.

Sugestão: o nome "Condomínios" é uma palavra comum. Antes de pagar por domínio ou registrar marca, vale escolher um nome próprio que dê para registrar.

## Medição

Os eventos já são emitidos pelo site:

| Evento | Quando |
|---|---|
| `visualizacao_pagina` | A página abre |
| `clique_solicitar` | Clique em qualquer botão "Solicitar calendário grátis" (com o local do clique) |
| `inicio_formulario` | Primeiro toque no formulário |
| `envio_sucesso` | O servidor confirmou que gravou o pedido |
| `email_preparado` | Sem planilha: o e-mail do pedido ficou pronto para a pessoa enviar |
| `erro_formulario` | Erro de validação, do servidor ou da rede (com o tipo) |
| `clique_contato` | Clique no e-mail de contato |

Hoje eles só viram um evento `condominios:evento` dentro do navegador, e nada sai dele. Para medir de verdade, instale uma ferramenta (por exemplo Plausible ou Umami, que funcionam sem cookies) e ligue os eventos em `src/lib/eventos.ts`. **Antes disso**, atualize a política de privacidade (`src/conteudo/privacidade.ts`) e a política de segurança de conteúdo em `next.config.ts`.

O que importa medir é se o site gera pedidos de pessoas reais, e não só visitas. A coluna **Origem** da planilha diz de onde veio cada pedido: links com `#grupo`, `#anuncio`, `#linkedin`, `#email` ou `#indicacao`.

## Privacidade e LGPD

- Coleta mínima: só os campos do formulário. Sem cookies nem rastreadores.
- O texto sobre receber novidades é uma caixa separada, desmarcada por padrão.
- Os segredos ficam só no servidor. Os dados pessoais nunca vão para o log, que só registra o motivo técnico das falhas.
- Retenção: 12 meses após o último contato. O script da planilha tem a função `apagarPedidosAntigos` para rodar todo mês.
- Exclusão a pedido: apague a linha da planilha e os e-mails da pessoa, e responda em até 15 dias.
- Quando a empresa for aberta, troque o responsável pela razão social e pelo CNPJ (`NEXT_PUBLIC_RESPONSAVEL`).

## Versão publicada no Claude

`npm run artefato` gera `dist/artefato/index.html`, um arquivo único com os mesmos componentes, estilos e textos. Ele fica no ar como página do Claude enquanto o domínio não existe.

Essa página não tem servidor. O formulário valida os campos e monta um e-mail com o assunto **"Quero o calendário grátis"**. A pessoa envia pelo Gmail ou pelo aplicativo de e-mail dela. A página nunca diz que o pedido foi recebido, só que falta enviar o e-mail.

## Revisão crítica: limites conhecidos

- O limite de tentativas e a memória de envios ficam na memória de cada instância do servidor. Para uma página de validação, basta. Se aparecer spam, adicione Cloudflare Turnstile (grátis) ao formulário.
- Sem JavaScript, o formulário não envia. Ele mostra um aviso e não vaza os dados pela URL.
- As datas da demonstração são fixas e fictícias, marcadas como tal.
- A política de privacidade cita a hospedagem detectada (Vercel ou Netlify) e o canal em uso (planilha ou e-mail). Se usar outros serviços, atualize o texto antes de publicar.
- O link do Claude passa menos confiança a um público B2B do que um domínio próprio.
