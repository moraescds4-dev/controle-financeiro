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
  dataRef: Date = new Date() // mês de referência; padrão = agora
): ResumoFinanceiro {
  const mes = dataRef.getMonth();      // 0 = janeiro ... 11 = dezembro
  const ano = dataRef.getFullYear();

  // mantém só os lançamentos do mês/ano de referência
  const doMes = (lista: LancamentoCru[]) =>
    lista.filter((l) => {
      const d = new Date(l.data);
      return d.getMonth() === mes && d.getFullYear() === ano;
    });

  const rendasMes = doMes(rendas);
  const debitosMes = doMes(debitos);
  const investimentosMes = doMes(investimentos);

  // soma SEMPRE convertendo string -> número
  const somar = (lista: LancamentoCru[]) =>
    lista.reduce((acc, l) => acc + Number(l.valor), 0);

  const totalRendas = somar(rendasMes);
  const totalDebitos = somar(debitosMes);
  const totalInvestido = somar(investimentosMes);


  const debitosPorCategoria: Record<string, number> = {};

debitosMes.forEach((d) => {
  const categoria = d.categoria ?? "Outros";
  debitosPorCategoria[categoria] =
    (debitosPorCategoria[categoria] ?? 0) + Number(d.valor);
});

  return {
    totalRendas,
    totalDebitos,
    totalInvestido,
    saldo: totalRendas - totalDebitos - totalInvestido,
    debitosPorCategoria,
    mesLabel: MESES[mes],
  };
}