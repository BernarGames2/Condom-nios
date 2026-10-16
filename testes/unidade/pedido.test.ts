import { describe, expect, it } from "vitest";
import {
  emailValido,
  lerOrigem,
  montarMensagemPedido,
  telefoneValido,
  validarPedido,
  type Pedido,
} from "@/lib/pedido";

const valido = {
  nome: "Ana Souza",
  email: "ana@administradora.com.br",
  perfil: "administradora",
  quantidade: "6-15",
};

describe("validarPedido", () => {
  it("aceita o mínimo obrigatório e preenche os opcionais vazios", () => {
    const r = validarPedido(valido);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pedido).toEqual({
      nome: "Ana Souza",
      email: "ana@administradora.com.br",
      perfil: "administradora",
      quantidade: "6-15",
      empresa: "",
      dificuldade: "",
      telefone: "",
      comentario: "",
      aceitaNovidades: false,
    });
  });

  it("explica em português cada campo obrigatório que falta", () => {
    const r = validarPedido({});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erros).toEqual({
      nome: "Informe seu nome.",
      email: "Informe seu e-mail.",
      perfil: "Escolha o seu perfil.",
      quantidade: "Escolha quantos condomínios você administra.",
    });
  });

  it("recusa e-mail sem formato válido", () => {
    for (const email of ["ana", "ana@", "ana@empresa", "ana @empresa.com", "ana@empresa..com", "a@b.c"]) {
      const r = validarPedido({ ...valido, email });
      expect(r.ok, email).toBe(false);
      if (!r.ok) expect(r.erros.email).toMatch(/Confira o e-mail/);
    }
  });

  it("recusa opções que não existem na lista", () => {
    const r = validarPedido({ ...valido, perfil: "hacker", quantidade: "99", dificuldade: "nada" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.erros).sort()).toEqual(["dificuldade", "perfil", "quantidade"]);
  });

  it("normaliza espaços, caracteres de controle e o domínio do e-mail", () => {
    const r = validarPedido({
      ...valido,
      nome: "  Ana\u0000   Souza\n ",
      email: " Ana@Administradora.COM.BR ",
      empresa: "Gestão\tPredial  Ltda",
      comentario: "Linha 1\r\n\r\n\r\n\r\nLinha 2\u200B",
      aceitaNovidades: "on",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pedido.nome).toBe("Ana Souza");
    expect(r.pedido.email).toBe("Ana@administradora.com.br");
    expect(r.pedido.empresa).toBe("Gestão Predial Ltda");
    expect(r.pedido.comentario).toBe("Linha 1\n\nLinha 2");
    expect(r.pedido.aceitaNovidades).toBe(true);
  });

  it("respeita os limites de tamanho", () => {
    const r = validarPedido({ ...valido, nome: "a".repeat(121), comentario: "b".repeat(1001) });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erros.nome).toMatch(/120/);
    expect(r.erros.comentario).toMatch(/1\.000/);
  });

  it("aceita entradas que não são objeto sem quebrar", () => {
    expect(validarPedido(null).ok).toBe(false);
    expect(validarPedido("texto").ok).toBe(false);
    expect(validarPedido({ nome: 123, email: ["x"] }).ok).toBe(false);
  });
});

describe("telefoneValido e emailValido", () => {
  it("aceita telefones brasileiros com DDD e internacionais com +", () => {
    for (const t of ["(11) 91234-5678", "11 3456-7890", "+55 11 91234-5678", "5511912345678", "+351 912 345 678"]) {
      expect(telefoneValido(t), t).toBe(true);
    }
    for (const t of ["1234", "91234-5678", "(11) 9123-45678-99", "abc", "11 91234-5678 ramal 2"]) {
      expect(telefoneValido(t), t).toBe(false);
    }
  });

  it("valida e-mails comuns", () => {
    expect(emailValido("sindico.profissional+obras@gmail.com")).toBe(true);
    expect(emailValido("contato@adm-predial.com.br")).toBe(true);
    expect(emailValido("x@-dominio.com")).toBe(false);
  });
});

describe("lerOrigem", () => {
  it("lê a origem do # ou dos parâmetros do link", () => {
    expect(lerOrigem("#grupo", "")).toBe("grupo");
    expect(lerOrigem("", "?origem=anuncio")).toBe("anuncio");
    expect(lerOrigem("", "?utm_source=LinkedIn")).toBe("linkedin");
    expect(lerOrigem("#solicitar", "?utm_source=indicacao")).toBe("indicacao");
  });

  it("ignora valores desconhecidos", () => {
    expect(lerOrigem("#como-funciona", "")).toBeNull();
    expect(lerOrigem("#<script>", "?origem=qualquer")).toBeNull();
  });
});

describe("montarMensagemPedido", () => {
  it("monta o e-mail que a rotina diária sabe ler", () => {
    const pedido: Pedido = {
      nome: "Ana Souza",
      email: "ana@administradora.com.br",
      perfil: "sindico_profissional",
      quantidade: "2-5",
      empresa: "Souza Gestão",
      dificuldade: "vencimentos",
      telefone: "(11) 91234-5678",
      comentario: "O laudo do para-raios venceu e a multa foi de R$ 1.200.",
      aceitaNovidades: true,
    };
    expect(montarMensagemPedido(pedido, "grupo")).toBe(
      [
        "Olá! Quero o calendário de manutenção grátis.",
        "",
        "Nome: Ana Souza",
        "E-mail profissional: ana@administradora.com.br",
        "Perfil: Síndico profissional",
        "Condomínios que administro: 2 a 5",
        "Administradora ou empresa: Souza Gestão",
        "Principal dificuldade: Controlar os vencimentos",
        "Telefone: (11) 91234-5678",
        "",
        "Comentário:",
        "O laudo do para-raios venceu e a multa foi de R$ 1.200.",
        "",
        "Quero receber novidades sobre o Condomínios: Sim",
        "Como cheguei à página: Grupo de síndicos",
      ].join("\n"),
    );
  });

  it("omite os campos opcionais vazios", () => {
    const r = validarPedido(valido);
    if (!r.ok) throw new Error("devia ser válido");
    const texto = montarMensagemPedido(r.pedido, null);
    expect(texto).not.toMatch(/Administradora ou empresa|Telefone|Comentário|Principal dificuldade/);
    expect(texto).toMatch(/Como cheguei à página: Não informado/);
    expect(texto).toMatch(/novidades sobre o Condomínios: Não/);
  });
});
