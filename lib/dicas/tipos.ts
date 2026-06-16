// src/lib/dicas/tipos.ts

export type SeveridadeDica = "alerta" | "atencao" | "positivo" | "info";

export type Dica = {
  id: string;                 // identificador estável da dica
  severidade: SeveridadeDica; // define a cor/ícone no card depois
  titulo: string;
  mensagem: string;
};

// Os números já mastigados que as regras vão analisar.
export type ResumoFinanceiro = {
  totalRendas: number;
  totalDebitos: number;
  totalInvestido: number;
  saldo: number;
  debitosPorCategoria: Record<string, number>; // { "Moradia": 1200, "Lazer": 300 }
  mesLabel: string;                             // ex.: "junho"
};

// Uma regra: olha o resumo e devolve uma Dica, OU null se não se aplica.
export type Regra = (resumo: ResumoFinanceiro) => Dica | null;