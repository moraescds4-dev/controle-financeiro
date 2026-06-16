// src/lib/dicas/motor.ts
import { Dica, ResumoFinanceiro } from "./tipos";
import { regras } from "./regras";

export function gerarDicas(resumo: ResumoFinanceiro): Dica[] {
  return regras
    .map((regra) => regra(resumo))                      // roda cada regra
    .filter((dica): dica is Dica => dica !== null);     // descarta os null
}