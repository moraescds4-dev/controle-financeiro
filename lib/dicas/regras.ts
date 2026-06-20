
import { Regra, ResumoFinanceiro } from "./tipos";

const formatarBRL = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// só comparam se o mês passado teve algum movimento
const temDadosMesAnterior = (resumo: ResumoFinanceiro) =>
  resumo.anterior.totalRendas > 0 ||
  resumo.anterior.totalDebitos > 0 ||
  resumo.anterior.totalInvestido > 0;

export const gastouMaisQueMesAnterior: Regra = (resumo) => {
  if (!temDadosMesAnterior(resumo)) return null;
  if (resumo.totalDebitos <= resumo.anterior.totalDebitos) return null;
  const diferenca = resumo.totalDebitos - resumo.anterior.totalDebitos;
  return {
    id: "gastou-mais-que-mes-anterior",
    severidade: "atencao",
    titulo: "Você gastou mais que no mês passado",
    mensagem: `Seus débitos em ${resumo.mesLabel} estão ${formatarBRL(diferenca)} acima do mês anterior.`,
  };
};

const investiuMaisQueMesAnterior: Regra = (resumo) => {
  if (!temDadosMesAnterior(resumo)) return null;
  if (resumo.totalInvestido <= resumo.anterior.totalInvestido) return null;
  const diferenca = resumo.totalInvestido - resumo.anterior.totalInvestido;
  return {
    id: "investiu-mais-que-mes-anterior",
    severidade: "positivo",
    titulo: "Você investiu mais que no mês passado",
    mensagem: `Você aplicou ${formatarBRL(diferenca)} a mais em ${resumo.mesLabel} do que no mês anterior. Continue assim!`,
  };
};

const apertouOsGastos: Regra = (resumo) => {
  if (!temDadosMesAnterior(resumo)) return null;
  if (resumo.totalDebitos >= resumo.anterior.totalDebitos) return null;
  const diferenca = resumo.anterior.totalDebitos - resumo.totalDebitos;
  return {
    id: "apertou-os-gastos",
    severidade: "positivo",
    titulo: "Você apertou os gastos",
    mensagem: `Seus débitos em ${resumo.mesLabel} estão ${formatarBRL(diferenca)} abaixo do mês anterior. Bom controle!`,
  };
};

// REGRA 1 (molde): gastou mais do que ganhou no mês
export const gastouMaisDoQueGanhou: Regra = (resumo) => {
  if (resumo.totalDebitos <= resumo.totalRendas) return null; // não se aplica
  const diferenca = resumo.totalDebitos - resumo.totalRendas;
  return {
    id: "gastou-mais-do-que-ganhou",
    severidade: "alerta",
    titulo: "Você gastou mais do que ganhou",
    mensagem: `Em ${resumo.mesLabel}, seus débitos superaram as rendas em ${formatarBRL(diferenca)}.`,
  };
};

//REGRA 2
const naoDestinouNadaPraInvestir: Regra = (resumo) => {
  // não se aplica
  if (resumo.totalRendas <= 0 || resumo.totalInvestido > 0) {
    return null;
  }

  return {
    id: "nao-destinou-nada-pra-investir",
    severidade: "atencao",
    titulo: "Você não destinou nada para investir",
    mensagem:
      "Você deve tentar investir, mesmo que uma pequena quantia todos os meses, para se preparar para o futuro.",
  };
};

//REGRA 3
const categoriaDeGastoPesouDemais: Regra = (resumo) => {
  // evita divisão por zero
  if (resumo.totalRendas <= 0) return null;

  for (const [categoria, valor] of Object.entries(resumo.debitosPorCategoria)) {
    const percentual = (valor / resumo.totalRendas) * 100;

    if (percentual > 30 && percentual <= 50) {
      return {
        id: "categoria-de-gasto-pesou-demais",
        severidade: "atencao",
        titulo: "Uma categoria de gasto pesou demais",
        mensagem: `A categoria "${categoria}" representou ${percentual.toFixed(
          1
        )}% da sua renda em ${resumo.mesLabel}.`,
      };
    }
  }

  return null;
};

// REGRA 4
const comprometeuAlemDaRenda: Regra = (resumo) => {
  
  if (resumo.totalDebitos > resumo.totalRendas) return null;


  if (resumo.saldo >= 0) return null;

  return {
    id: "comprometeu-alem-da-renda",
    severidade: "atencao",
    titulo: "Você comprometeu mais do que ganhou",
    mensagem: `Em ${resumo.mesLabel}, somando gastos e investimentos, você usou ${formatarBRL(Math.abs(resumo.saldo))} além da sua renda — provavelmente puxando da reserva.`,
  };
};

// REGRA 5
export const categoriaDevorouMetadeDaRenda: Regra = (resumo) => {
  if (resumo.totalRendas <= 0) return null;

  for (const [categoria, valor] of Object.entries(resumo.debitosPorCategoria)) {
    const percentual = (valor / resumo.totalRendas) * 100;

    if (percentual > 50) {
      return {
        id: "categoria-devorou-metade-da-renda",
        severidade: "alerta",
        titulo: "Uma categoria devorou metade da sua renda",
        mensagem: `A categoria "${categoria}" consumiu ${percentual.toFixed(1)}% da sua renda em ${resumo.mesLabel}.`,
      };
    }
  }

  return null;
};

// REGRA 6
const rendaZeradaComGastos: Regra = (resumo) => {
  if (resumo.totalRendas > 0 || resumo.totalDebitos <= 0) return null;

  return {
    id: "renda-zerada-com-gastos",
    severidade: "alerta",
    titulo: "Você teve gastos, mas nenhuma renda registrada",
    mensagem: `Em ${resumo.mesLabel}, foram registrados ${formatarBRL(resumo.totalDebitos)} em débitos, mas nenhuma renda.`,
  };
};

// REGRA 7
const poucoFolegoNoMes: Regra = (resumo) => {
  if (resumo.totalRendas <= 0) return null;

  const percentual = (resumo.totalDebitos / resumo.totalRendas) * 100;

  if (percentual <= 70) return null;

  return {
    id: "pouco-folego-no-mes",
    severidade: "atencao",
    titulo: "Pouco fôlego no mês",
    mensagem: `Em ${resumo.mesLabel}, seus débitos consumiram ${percentual.toFixed(1)}% da sua renda.`,
  };
};

// REGRA 8
const taxaDePoupancaBaixa: Regra = (resumo) => {
  if (resumo.totalRendas <= 0 || resumo.totalInvestido === 0) return null;

  const percentual = (resumo.totalInvestido / resumo.totalRendas) * 100;

  if (percentual >= 10) return null;

  return {
    id: "taxa-de-poupanca-baixa",
    severidade: "atencao",
    titulo: "Sua taxa de investimento está baixa",
    mensagem: `Em ${resumo.mesLabel}, você investiu ${percentual.toFixed(1)}% da sua renda.`,
  };
};  

// REGRA 9
const fechouNoAzulEInvestiu: Regra = (resumo) => {
  if (resumo.saldo <= 0 || resumo.totalInvestido <= 0) return null;

  return {
    id: "fechou-no-azul-e-investiu",
    severidade: "positivo",
    titulo: "Você fechou no azul e ainda investiu",
    mensagem: `Em ${resumo.mesLabel}, você terminou com saldo positivo e investiu ${formatarBRL(resumo.totalInvestido)}.`,
  };
};

// REGRA 10
const boaTaxaDePoupanca: Regra = (resumo) => {
  if (resumo.totalRendas <= 0) return null;

  const percentual = (resumo.totalInvestido / resumo.totalRendas) * 100;

  if (percentual < 20) return null;

  return {
    id: "boa-taxa-de-poupanca",
    severidade: "positivo",
    titulo: "Boa taxa de investimento",
    mensagem: `Em ${resumo.mesLabel}, você investiu ${percentual.toFixed(1)}% da sua renda.`,
  };
};

// REGRA 11
const maiorCategoriaDeGasto: Regra = (resumo) => {
  if (resumo.totalRendas <= 0 || resumo.totalDebitos <= 0) return null;

  const categorias = Object.entries(resumo.debitosPorCategoria);

  if (categorias.length === 0) return null;

  const [categoria, valor] = categorias.reduce((maior, atual) =>
    atual[1] > maior[1] ? atual : maior
  );

  const percentual = (valor / resumo.totalRendas) * 100;

  return {
    id: "maior-categoria-de-gasto",
    severidade: "info",
    titulo: "Sua maior categoria de gasto",
    mensagem: `Em ${resumo.mesLabel}, sua maior categoria foi "${categoria}", com ${formatarBRL(valor)}, equivalente a ${percentual.toFixed(1)}% da sua renda.`,
  };
};

// REGRA 12
const resumoDoMes: Regra = (resumo) => {
  // sem nenhum movimento no mês, não há resumo a mostrar
  if (
    resumo.totalRendas === 0 &&
    resumo.totalDebitos === 0 &&
    resumo.totalInvestido === 0
  ) {
    return null;
  }

  return {
    id: "resumo-do-mes",
    severidade: "info",
    titulo: "Resumo do mês",
    mensagem: `Em ${resumo.mesLabel}, você ganhou ${formatarBRL(resumo.totalRendas)}, gastou ${formatarBRL(resumo.totalDebitos)} e investiu ${formatarBRL(resumo.totalInvestido)}.`,
  };
};

export const regras: Regra[] = [
  gastouMaisDoQueGanhou,
  naoDestinouNadaPraInvestir,
  categoriaDeGastoPesouDemais,
  comprometeuAlemDaRenda,
  categoriaDevorouMetadeDaRenda,
  rendaZeradaComGastos,
  poucoFolegoNoMes,
  taxaDePoupancaBaixa,
  fechouNoAzulEInvestiu,
  boaTaxaDePoupanca,
  maiorCategoriaDeGasto,
  resumoDoMes,
  gastouMaisQueMesAnterior,
  investiuMaisQueMesAnterior,
  apertouOsGastos,
  // suas próximas regras entram aqui ↓
];