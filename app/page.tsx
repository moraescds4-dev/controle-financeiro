"use client";

import { useEffect, useState } from "react";

type Lancamento = {
  id: string;
  descricao: string;
  valor: string; // Decimal chega como texto da API (de propósito)
};

export default function Home() {
  const [rendas, setRendas] = useState<Lancamento[]>([]);
  const [debitos, setDebitos] = useState<Lancamento[]>([]);
  const [investimentos, setInvestimentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  useEffect(() => {
    async function carregarDados() {
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
    carregarDados();
  }, []);

  const somar = (lista: Lancamento[]) =>
    lista.reduce((total, item) => total + Number(item.valor), 0);

  const totalRendas = somar(rendas);
  const totalDebitos = somar(debitos);
  const totalInvestimentos = somar(investimentos);
  const saldo = totalRendas - totalDebitos - totalInvestimentos;

  const formatar = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (carregando) {
    return (
      <main className="p-10">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="p-10 max-w-md mx-auto">

      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Saldo atual</span>
          <button
            onClick={() => setMostrarSaldo((v) => !v)}
            className="text-sm text-blue-600 hover:underline"
          >
            {mostrarSaldo ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        <p className={`text-3xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
          {mostrarSaldo ? formatar(saldo) : "R$ ••••••"}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-gray-500">Rendas</p>
            <p className="font-semibold text-green-600">{formatar(totalRendas)}</p>
          </div>
          <div>
            <p className="text-gray-500">Débitos</p>
            <p className="font-semibold text-red-600">{formatar(totalDebitos)}</p>
          </div>
          <div>
            <p className="text-gray-500">Investido</p>
            <p className="font-semibold text-blue-600">{formatar(totalInvestimentos)}</p>
          </div>
        </div>
      </div>
    </main>
  );
}