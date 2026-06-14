"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

type Lancamento = { valor: string; categoria?: string; tipo?: string; data: string };
type TipoGrafico = "comparativo" | "categoria";
type Mes = "atual" | "anterior";
type CategoriaDe = "rendas" | "debitos" | "investimentos";

const PALETAS: Record<CategoriaDe, string[]> = {
  rendas: ["#16a34a", "#22c55e", "#15803d", "#4ade80", "#166534", "#86efac"],
  debitos: ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#b91c1c", "#f97316"],
  investimentos: ["#2563eb", "#0891b2", "#7c3aed", "#0ea5e9", "#1d4ed8", "#6366f1"],
};

const ROTULO: Record<CategoriaDe, string> = {
  rendas: "Rendas",
  debitos: "Débitos",
  investimentos: "Investimentos",
};

export default function Graficos() {
  const [rendas, setRendas] = useState<Lancamento[]>([]);
  const [debitos, setDebitos] = useState<Lancamento[]>([]);
  const [investimentos, setInvestimentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [grafico, setGrafico] = useState<TipoGrafico>("comparativo");
  const [mes, setMes] = useState<Mes>("atual");
  const [categoriaDe, setCategoriaDe] = useState<CategoriaDe>("debitos");

  useEffect(() => {
    async function carregar() {
      try {
        const [r, d, i] = await Promise.all([
          fetch("/api/rendas").then((res) => res.json()),
          fetch("/api/debitos").then((res) => res.json()),
          fetch("/api/investimentos").then((res) => res.json()),
        ]);
        setRendas(r);
        setDebitos(d);
        setInvestimentos(i);
      } catch (erro) {
        console.error(erro);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const formatar = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const hoje = new Date();
  const alvo = new Date(hoje.getFullYear(), hoje.getMonth() - (mes === "anterior" ? 1 : 0), 1);
  const nomeMesBruto = alvo.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const nomeMes = nomeMesBruto.charAt(0).toUpperCase() + nomeMesBruto.slice(1);

  const doMes = (lista: Lancamento[]) =>
    lista.filter((item) => {
      const dt = new Date(item.data);
      return dt.getFullYear() === alvo.getFullYear() && dt.getMonth() === alvo.getMonth();
    });

  const rendasMes = doMes(rendas);
  const debitosMes = doMes(debitos);
  const investimentosMes = doMes(investimentos);

  const somar = (lista: Lancamento[]) =>
    lista.reduce((t, item) => t + Number(item.valor), 0);

  const comparativo = [
    { nome: "Rendas", total: somar(rendasMes), cor: "#16a34a" },
    { nome: "Débitos", total: somar(debitosMes), cor: "#dc2626" },
    { nome: "Investido", total: somar(investimentosMes), cor: "#2563eb" },
  ];

  // Lista escolhida para a quebra por categoria
  const listaCategoria =
    categoriaDe === "rendas" ? rendasMes :
    categoriaDe === "debitos" ? debitosMes :
    investimentosMes;

  const agrupado = listaCategoria.reduce((acc, item) => {
    // rendas/débitos usam "categoria"; investimentos usam "tipo"
    const chave = item.categoria ?? item.tipo ?? "Outros";
    acc[chave] = (acc[chave] ?? 0) + Number(item.valor);
    return acc;
  }, {} as Record<string, number>);
  const dadosCategoria = Object.entries(agrupado).map(([nome, total]) => ({ nome, total }));

  const temDados = rendasMes.length + debitosMes.length + investimentosMes.length > 0;
  const palavraQuebra = categoriaDe === "investimentos" ? "tipo" : "categoria";

  if (carregando) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  const abaClasse = (ativo: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
      ativo
        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        : "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
    }`;

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gráficos</h1>

      {/* Seletor de gráfico */}
      <div className="flex gap-2 mb-3">
        <button className={abaClasse(grafico === "comparativo")} onClick={() => setGrafico("comparativo")}>Comparativo</button>
        <button className={abaClasse(grafico === "categoria")} onClick={() => setGrafico("categoria")}>Por categoria</button>
      </div>

      {/* Seletor de mês */}
      <div className="flex gap-2 mb-6">
        <button className={abaClasse(mes === "atual")} onClick={() => setMes("atual")}>Mês atual</button>
        <button className={abaClasse(mes === "anterior")} onClick={() => setMes("anterior")}>Mês anterior</button>
      </div>

      {!temDados && (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500">Não há lançamentos em {nomeMes}.</p>
        </div>
      )}

      {temDados && grafico === "comparativo" && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Comparativo — {nomeMes}</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativo} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis dataKey="nome" interval={0} angle={-20} textAnchor="end" height={50} tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis width={100} tick={{ fill: "currentColor", fontSize: 12 }} tickFormatter={(v) => formatar(Number(v))} />
                <Tooltip formatter={(v) => formatar(Number(v))} contentStyle={{ borderRadius: 8 }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={70}>
                  {comparativo.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {temDados && grafico === "categoria" && (
        <section>
          {/* Sub-seletor: qual entidade quebrar */}
          <div className="flex gap-2 mb-4">
            <button className={abaClasse(categoriaDe === "rendas")} onClick={() => setCategoriaDe("rendas")}>Rendas</button>
            <button className={abaClasse(categoriaDe === "debitos")} onClick={() => setCategoriaDe("debitos")}>Débitos</button>
            <button className={abaClasse(categoriaDe === "investimentos")} onClick={() => setCategoriaDe("investimentos")}>Investimentos</button>
          </div>

          <h2 className="text-lg font-semibold mb-3">
            {ROTULO[categoriaDe]} por {palavraQuebra} — {nomeMes}
          </h2>

          {dadosCategoria.length === 0 ? (
            <p className="text-sm text-gray-400">Sem {ROTULO[categoriaDe].toLowerCase()} em {nomeMes}.</p>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosCategoria} dataKey="total" nameKey="nome" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {dadosCategoria.map((item, index) => (
                      <Cell key={item.nome} fill={PALETAS[categoriaDe][index % PALETAS[categoriaDe].length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatar(Number(v))} contentStyle={{ borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}
    </main>
  );
}