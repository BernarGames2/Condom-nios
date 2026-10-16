import { beforeEach, describe, expect, it } from "vitest";
import { dentroDoLimite, idJaRegistrado, idValido, lembrarId, limparMemoriaAntispam, tempoSuspeito } from "@/lib/antispam";
import { descreverPrazo, diasEntre, formatarData, situacaoDoPrazo } from "@/lib/datas";

describe("datas", () => {
  it("conta dias de calendário, inclusive na virada do ano", () => {
    expect(diasEntre("2026-10-20", "2026-10-18")).toBe(-2);
    expect(diasEntre("2026-10-20", "2026-11-05")).toBe(16);
    expect(diasEntre("2026-12-31", "2027-01-01")).toBe(1);
    expect(diasEntre("2026-10-20", "2027-03-10")).toBe(141);
  });

  it("formata no padrão DD/MM/AAAA", () => {
    expect(formatarData("2026-03-07")).toBe("07/03/2026");
  });

  it("classifica a situação com a janela de 30 dias", () => {
    expect(situacaoDoPrazo("2026-10-20", "2026-10-19")).toBe("atrasado");
    expect(situacaoDoPrazo("2026-10-20", "2026-10-20")).toBe("proximo");
    expect(situacaoDoPrazo("2026-10-20", "2026-11-19")).toBe("proximo");
    expect(situacaoDoPrazo("2026-10-20", "2026-11-20")).toBe("em_dia");
  });

  it("descreve o prazo em português", () => {
    expect(descreverPrazo("2026-10-20", "2026-10-18")).toBe("venceu há 2 dias");
    expect(descreverPrazo("2026-10-20", "2026-10-19")).toBe("venceu ontem");
    expect(descreverPrazo("2026-10-20", "2026-10-20")).toBe("vence hoje");
    expect(descreverPrazo("2026-10-20", "2026-10-21")).toBe("vence amanhã");
    expect(descreverPrazo("2026-10-20", "2026-10-25")).toBe("vence em 5 dias");
  });
});

describe("antispam", () => {
  beforeEach(() => limparMemoriaAntispam());

  it("aceita até o limite por janela e bloqueia o excesso", () => {
    const agora = 1_000_000;
    for (let i = 0; i < 6; i++) expect(dentroDoLimite("1.2.3.4", 6, agora + i)).toBe(true);
    expect(dentroDoLimite("1.2.3.4", 6, agora + 10)).toBe(false);
    expect(dentroDoLimite("5.6.7.8", 6, agora + 10)).toBe(true);
    // depois de 10 minutos, libera de novo
    expect(dentroDoLimite("1.2.3.4", 6, agora + 10 * 60 * 1000 + 20)).toBe(true);
  });

  it("marca envios rápidos demais ou com horário inválido", () => {
    const agora = 5_000_000;
    expect(tempoSuspeito(agora - 500, agora)).toBe(true);
    expect(tempoSuspeito(agora - 5000, agora)).toBe(false);
    expect(tempoSuspeito("ontem", agora)).toBe(true);
    expect(tempoSuspeito(undefined, agora)).toBe(true);
    expect(tempoSuspeito(agora - 2 * 24 * 60 * 60 * 1000, agora)).toBe(true);
  });

  it("reconhece ids UUID e lembra os já gravados por 30 minutos", () => {
    const id = "3f1c2a9e-8b7d-4c6e-9f00-1a2b3c4d5e6f";
    expect(idValido(id)).toBe(true);
    expect(idValido("123")).toBe(false);
    expect(idValido({})).toBe(false);
    expect(idJaRegistrado(id, 0)).toBe(false);
    lembrarId(id, 0);
    expect(idJaRegistrado(id, 29 * 60 * 1000)).toBe(true);
    expect(idJaRegistrado(id, 31 * 60 * 1000)).toBe(false);
  });
});
