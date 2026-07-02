import type { GrupoCategoria, ItemRelatorio } from "./tipos";

type LancamentoEntrada = {
  valor: string;
  data: string;
  descricao: string;
  categoria?: string;
  tipo?: string;
};
type ItemComCategoria = ItemRelatorio & {
  categoria: string;
};

export function agruparPorCategoria(
  itens: ItemComCategoria[]
): GrupoCategoria[] {
  const mapa = new Map<string, GrupoCategoria>();

  for (const item of itens) {
    // 1. Busca ou cria o grupo da categoria
    let grupo = mapa.get(item.categoria);

    if (!grupo) {
      grupo = {
        categoria: item.categoria,
        subtotal: 0,
        itens: [],
      };

      mapa.set(item.categoria, grupo);
    }

    // 2. Soma no subtotal
    grupo.subtotal += item.valor;

    // 3. Adiciona o item na lista
    grupo.itens.push({
      descricao: item.descricao,
      valor: item.valor,
      data: item.data,
    });
  }

  // 4. Retorna os grupos como array
  return [...mapa.values()];
}


import type {
  RelatorioMensal,
  SecaoRelatorio,
} from "./tipos";

export function montarRelatorio(dados: {
  rendas: LancamentoEntrada[];
  debitos: LancamentoEntrada[];
  investimentos: LancamentoEntrada[];
  mesLabel: string;
}): RelatorioMensal {

  const {
    rendas,
    debitos,
    investimentos,
    mesLabel,
  } = dados;

  // 1. NORMALIZAÇÃO

  const itensRendas = rendas.map((r) => ({
    descricao: r.descricao,
    valor: Number(r.valor),
    data: String (r.data),
    categoria: r.categoria ?? "Sem categoria",
  }));

  const itensDebitos = debitos.map((d) => ({
    descricao: d.descricao,
    valor: Number(d.valor),
    data: String (d.data),
    categoria: d.categoria ?? "Sem categoria",
  }));

  const itensInvestimentos = investimentos.map((i) => ({
    descricao: i.descricao,
    valor: Number(i.valor),
    data: String (i.data),
    categoria: i.tipo ?? "Sem tipo", // investimento usa tipo
  }));

  // 2. AGRUPAMENTO

  const gruposRendas =
    agruparPorCategoria(itensRendas);

  const gruposDebitos =
    agruparPorCategoria(itensDebitos);

  const gruposInvestimentos =
    agruparPorCategoria(itensInvestimentos);

  // 3. SEÇÕES

  const totalRendas = gruposRendas.reduce(
    (soma, grupo) => soma + grupo.subtotal,
    0
  );

  const totalDebitos = gruposDebitos.reduce(
    (soma, grupo) => soma + grupo.subtotal,
    0
  );

  const totalInvestimentos =
    gruposInvestimentos.reduce(
      (soma, grupo) => soma + grupo.subtotal,
      0
    );

  const secRendas: SecaoRelatorio = {
    titulo: "Rendas",
    total: totalRendas,
    grupos: gruposRendas,
  };

  const secDebitos: SecaoRelatorio = {
    titulo: "Débitos",
    total: totalDebitos,
    grupos: gruposDebitos,
  };

  const secInvestimentos: SecaoRelatorio = {
    titulo: "Investimentos",
    total: totalInvestimentos,
    grupos: gruposInvestimentos,
  };

  // 4. PANORAMA

  const panorama = {
    rendas: totalRendas,
    debitos: totalDebitos,
    investido: totalInvestimentos,
    saldo:
      totalRendas -
      totalDebitos -
      totalInvestimentos,
  };

  // 5. RELATÓRIO FINAL

  return {
    mesLabel,
    panorama,
    secoes: [
      secRendas,
      secDebitos,
      secInvestimentos,
    ],
  };
}