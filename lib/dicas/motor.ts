import { Dica, ResumoFinanceiro, SeveridadeDica } from "./tipos";
import { regras } from "./regras";

const PRIORIDADE: Record<SeveridadeDica, number> = {
  alerta: 0,
  atencao: 1,
  positivo: 2,
  info: 3,
};

export function gerarDicas(resumo: ResumoFinanceiro): Dica[] {
  return regras
    .map((regra) => regra(resumo))
    .filter((dica): dica is Dica => dica !== null)
    .sort((a, b) => PRIORIDADE[a.severidade] - PRIORIDADE[b.severidade]);
  // se quiser limitar, adiciona no fim: .slice(0, 5)
}