// lib/dicas/resumo.ts
import { ResumoFinanceiro } from "./tipos";

// formato cru que chega das APIs (valor vem como string; data como ISO)
type LancamentoCru = {
  valor: string | number;
  categoria?: string; // débitos e rendas têm categoria
  data: string;
};

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function montarResumo(
  rendas: LancamentoCru[],
  debitos: LancamentoCru[],
  investimentos: LancamentoCru[],
  dataRef: Date = new Date()
): ResumoFinanceiro {
  const mes = dataRef.getMonth();
  const ano = dataRef.getFullYear();

  // agora filtra por um mês/ano QUALQUER (reutilizável)
  const doPeriodo = (lista: LancamentoCru[], m: number, a: number) =>
    lista.filter((l) => {
      const d = new Date(l.data);
      return d.getMonth() === m && d.getFullYear() === a;
    });

  const somar = (lista: LancamentoCru[]) =>
    lista.reduce((acc, l) => acc + Number(l.valor), 0);

  // ───── mês atual ─────
  const rendasMes = doPeriodo(rendas, mes, ano);
  const debitosMes = doPeriodo(debitos, mes, ano);
  const investimentosMes = doPeriodo(investimentos, mes, ano);

  const totalRendas = somar(rendasMes);
  const totalDebitos = somar(debitosMes);
  const totalInvestido = somar(investimentosMes);

  const debitosPorCategoria: Record<string, number> = {};
  debitosMes.forEach((d) => {
    const categoria = d.categoria ?? "Outros";
    debitosPorCategoria[categoria] =
      (debitosPorCategoria[categoria] ?? 0) + Number(d.valor);
  });

  // ───── mês anterior ─────
  // em janeiro (mês 0), o anterior é dezembro (11) do ano passado
  const mesAnterior = mes === 0 ? 11 : mes - 1;
  const anoAnterior = mes === 0 ? ano - 1 : ano;

  const anterior = {
    totalRendas: somar(doPeriodo(rendas, mesAnterior, anoAnterior)),
    totalDebitos: somar(doPeriodo(debitos, mesAnterior, anoAnterior)),
    totalInvestido: somar(doPeriodo(investimentos, mesAnterior, anoAnterior)),
  };

  return {
    totalRendas,
    totalDebitos,
    totalInvestido,
    saldo: totalRendas - totalDebitos - totalInvestido,
    debitosPorCategoria,
    mesLabel: MESES[mes],
    anterior,
  };
}