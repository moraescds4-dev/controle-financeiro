// lib/relatorio/tipos.ts

// Uma linha da fatura
export type ItemRelatorio = {
  descricao: string;
  valor: number;   // já convertido de string→número
  data: string;    // ISO, pra ordenar e exibir
};

// Os itens de uma mesma categoria, com o subtotal
export type GrupoCategoria = {
  categoria: string;
  subtotal: number;
  itens: ItemRelatorio[];
};

// Uma entidade inteira (Rendas, Débitos ou Investimentos)
export type SecaoRelatorio = {
  titulo: string;          // "Rendas" | "Débitos" | "Investimentos"
  total: number;           // soma dos grupos da seção
  grupos: GrupoCategoria[];
};

// A fatura do mês
export type RelatorioMensal = {
  mesLabel: string;        // ex.: "Junho de 2026"
  panorama: {
    rendas: number;
    debitos: number;
    investido: number;
    saldo: number;
  };
  secoes: SecaoRelatorio[];
};