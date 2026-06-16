// src/lib/dicas/regras.ts
import { Regra } from "./tipos";

const formatarBRL = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// REGRA 1 (molde): gastou mais do que ganhou no mês
const gastouMaisDoQueGanhou: Regra = (resumo) => {
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

    if (percentual > 30) {
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

export const regras: Regra[] = [
  gastouMaisDoQueGanhou,
  naoDestinouNadaPraInvestir,
  categoriaDeGastoPesouDemais,
  // suas próximas regras entram aqui ↓
];