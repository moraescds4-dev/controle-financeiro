import { gerarDicas } from "./motor";
import { describe, it, expect } from "vitest";
import {
  gastouMaisDoQueGanhou,
  categoriaDevorouMetadeDaRenda,
  gastouMaisQueMesAnterior,
} from "./regras";
import { ResumoFinanceiro } from "./tipos";

// Um resumo "vazio" como base. Cada teste sobrescreve só o que importa.
const resumoBase: ResumoFinanceiro = {
  totalRendas: 0,
  totalDebitos: 0,
  totalInvestido: 0,
  saldo: 0,
  debitosPorCategoria: {},
  mesLabel: "junho",
  anterior: {
    totalRendas: 0,
    totalDebitos: 0,
    totalInvestido: 0,
  },
};

// Fábrica: devolve o resumo base com os campos do teste por cima.
function fazerResumo(
  parcial: Partial<ResumoFinanceiro>
): ResumoFinanceiro {
  return { ...resumoBase, ...parcial };
}

describe("gastouMaisDoQueGanhou", () => {
  it("dispara quando os débitos superam as rendas", () => {
    const resumo = fazerResumo({
      totalRendas: 3000,
      totalDebitos: 4000,
    });

    const dica = gastouMaisDoQueGanhou(resumo);

    expect(dica).not.toBeNull();
    expect(dica?.id).toBe("gastou-mais-do-que-ganhou");
    expect(dica?.severidade).toBe("alerta");
  });

  it("não dispara quando as rendas cobrem os débitos", () => {
    const resumo = fazerResumo({
      totalRendas: 3000,
      totalDebitos: 2000,
    });

    expect(gastouMaisDoQueGanhou(resumo)).toBeNull();
  });

  it("não dispara quando débitos e rendas são iguais (o limite)", () => {
    const resumo = fazerResumo({
      totalRendas: 3000,
      totalDebitos: 3000,
    });

    expect(gastouMaisDoQueGanhou(resumo)).toBeNull();
  });
});

describe("categoriaDevorouMetadeDaRenda", () => {
  it("dispara quando uma categoria passa de 50% da renda", () => {
    const resumo = fazerResumo({
      totalRendas: 3000,
      debitosPorCategoria: {
        Moradia: 2000,
      },
    });

    const dica = categoriaDevorouMetadeDaRenda(resumo);

    expect(dica).not.toBeNull();
    expect(dica?.id).toBe("categoria-devorou-metade-da-renda");
  });

  it("não dispara quando a categoria fica abaixo de 50%", () => {
    const resumo = fazerResumo({
      totalRendas: 3000,
      debitosPorCategoria: {
        Moradia: 1200,
      },
    });

    expect(categoriaDevorouMetadeDaRenda(resumo)).toBeNull();
  });

  it("não dispara quando a categoria está exatamente em 50% (limite)", () => {
    const resumo = fazerResumo({
      totalRendas: 3000,
      debitosPorCategoria: {
        Moradia: 1500,
      },
    });

    expect(categoriaDevorouMetadeDaRenda(resumo)).toBeNull();
  });
});

describe("gastouMaisQueMesAnterior", () => {
  it("dispara quando o mês anterior tem movimento e os gastos aumentam", () => {
    const resumo = fazerResumo({
      totalDebitos: 1500,
      anterior: {
        totalRendas: 3000,
        totalDebitos: 1000,
        totalInvestido: 0,
      },
    });

    const dica = gastouMaisQueMesAnterior(resumo);

    expect(dica).not.toBeNull();
    expect(dica?.id).toBe("gastou-mais-que-mes-anterior");
  });

  it("não dispara quando o mês anterior está vazio", () => {
    const resumo = fazerResumo({
      totalDebitos: 1500,
      anterior: {
        totalRendas: 0,
        totalDebitos: 0,
        totalInvestido: 0,
      },
    });

    expect(gastouMaisQueMesAnterior(resumo)).toBeNull();
  });

  it("não dispara quando gastou menos ou igual ao mês anterior", () => {
    const resumo = fazerResumo({
      totalDebitos: 1000,
      anterior: {
        totalRendas: 3000,
        totalDebitos: 1000,
        totalInvestido: 0,
      },
    });

    expect(gastouMaisQueMesAnterior(resumo)).toBeNull();
  });
});

describe("gerarDicas (o motor)", () => {
  it("não gera nenhuma dica quando o mês não teve movimento", () => {
    const resumo = fazerResumo({}); // tudo zerado
    expect(gerarDicas(resumo)).toEqual([]);
  });

  it("ordena as dicas por prioridade (alerta antes de info)", () => {
    // renda zerada + débitos => dispara alerta(s); e há movimento => dispara o info "resumo do mês"
    const resumo = fazerResumo({ totalRendas: 0, totalDebitos: 500 });
    const severidades = gerarDicas(resumo).map((d) => d.severidade);

    expect(severidades[0]).toBe("alerta");
    expect(severidades.at(-1)).toBe("info");
    
  });

  it("não limita por severidade: deixa passar mais de uma dica da mesma severidade", () => {
    // este resumo dispara DOIS alertas: gastouMaisDoQueGanhou e rendaZeradaComGastos
    const resumo = fazerResumo({ totalRendas: 0, totalDebitos: 500 });
    const alertas = gerarDicas(resumo).filter((d) => d.severidade === "alerta");

    expect(alertas.length).toBeGreaterThan(1);

  });
});

