# Gravar os pedidos numa planilha do Google

O site envia cada pedido para um pequeno script do Google, que grava uma linha numa planilha da sua conta. A planilha e o script são grátis. Leva uns 10 minutos.

## 1. Criar a planilha e o script

1. Em [planilhas.google.com](https://docs.google.com/spreadsheets), crie uma planilha vazia chamada **Condomínios — pedidos**.
2. No menu da planilha, abra **Extensões > Apps Script**.
3. Apague o código que aparece, cole todo o conteúdo de `Codigo.gs` (desta pasta) e clique em **Salvar**.

## 2. Configurar o segredo e o aviso por e-mail

1. No Apps Script, clique na engrenagem **Configurações do projeto**.
2. Em **Propriedades do script**, adicione:
   - `SEGREDO`: uma frase longa e aleatória (por exemplo, 40 letras e números). Guarde-a: ela vai também no site.
   - `AVISAR_EMAIL` (opcional): o e-mail que deve receber um aviso a cada pedido novo.

## 3. Publicar como aplicativo da web

1. Clique em **Implantar > Nova implantação**.
2. Em **Tipo**, escolha **App da Web**.
3. **Executar como:** Eu. **Quem pode acessar:** Qualquer pessoa.
4. Clique em **Implantar** e autorize o acesso à planilha (e ao e-mail, se usar `AVISAR_EMAIL`).
5. Copie o **URL do app da Web** (termina em `/exec`).

Abra esse endereço no navegador: deve aparecer `{"ok":true,"servico":"condominios-pedidos"}`.

> "Qualquer pessoa" só significa que o site consegue chamar o script. Sem o `SEGREDO` correto, o script recusa o pedido e não grava nada.

## 4. Ligar o site à planilha

Nas variáveis de ambiente da hospedagem (ou no `.env.local`):

```
PEDIDOS_DESTINO=webhook
PEDIDOS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
PEDIDOS_WEBHOOK_SEGREDO=a mesma frase do passo 2
```

Publique de novo o site e faça um pedido de teste. A linha aparece na aba **Pedidos**. Apague a linha de teste depois.

## 5. Apagar pedidos antigos automaticamente (retenção de 12 meses)

1. No Apps Script, abra **Acionadores** (ícone de relógio) > **Adicionar acionador**.
2. Função: `apagarPedidosAntigos`. Origem do evento: **Baseado no tempo**. Tipo: **Mensal**.
3. Salve.

A função apaga linhas com mais de 12 meses desde o **Último contato**. Se essa coluna estiver vazia, conta a partir do recebimento. Preencha **Último contato** quando conversar com a pessoa de novo.

## Atualizar o script depois

Depois de editar o código, vá em **Implantar > Gerenciar implantações**, edite a implantação e escolha **Nova versão**. Assim o endereço `/exec` continua o mesmo.

## Pedido de exclusão de dados

Se alguém pedir para apagar os dados, apague a linha da pessoa na planilha e os e-mails dela no Gmail, e responda confirmando em até 15 dias, como diz a política de privacidade.
