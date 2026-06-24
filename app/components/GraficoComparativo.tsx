"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type DadoComparativo = { nome: string; total: number; cor: string };

const formatar = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GraficoComparativo({ dados, mostrarTooltip = true }: { dados: DadoComparativo[]; mostrarTooltip?: boolean }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <XAxis dataKey="nome" interval={0} angle={-20} textAnchor="end" height={50} tick={{ fill: "currentColor", fontSize: 12 }} />
          <YAxis width={100} tick={{ fill: "currentColor", fontSize: 12 }} tickFormatter={(v) => formatar(Number(v))} />
          {mostrarTooltip &&<Tooltip formatter={(v) => formatar(Number(v))} contentStyle={{ borderRadius: 8 }} />}
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={70}>
            {dados.map((d) => (
              <Cell key={d.nome} fill={d.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}