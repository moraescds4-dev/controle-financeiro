"use client";

import { useEffect, useState } from "react";
import FormularioLancamento from "./components/FormularioLancamento";

type Lancamento = {
  id: string;
  descricao: string;
  valor: string;
};

type TipoForm = "renda" | "debito" | "investimento" | null;

export default function Home() {
  const [rendas, setRendas] = useState<Lancamento[]>([]);
  const [debitos, setDebitos] = useState<Lancamento[]>([]);
  const [investimentos, setInvestimentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [formAberto, setFormAberto] = useState<TipoForm>(null);

  // agora é uma função nomeada — dá pra chamar de novo depois de salvar
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

  useEffect(() => {
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
      <main className="p-10 max-w-md mx-auto">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      {/* Card de saldo */}
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

      {/* Botões de cadastro rápido */}
      <div className="mt-8 flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setFormAberto("renda")}
            aria-label="Nova renda"
            className="w-14 h-14 rounded-full bg-green-600 text-white text-2xl flex items-center justify-center shadow-md hover:bg-green-700"
          >
            +
          </button>
          <span className="text-xs text-gray-500">Renda</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setFormAberto("debito")}
            aria-label="Novo débito"
            className="w-14 h-14 rounded-full bg-red-600 text-white text-2xl flex items-center justify-center shadow-md hover:bg-red-700"
          >
            −
          </button>
          <span className="text-xs text-gray-500">Débito</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setFormAberto("investimento")}
            aria-label="Novo investimento"
            className="w-14 h-14 rounded-full bg-blue-600 text-white text-2xl flex items-center justify-center shadow-md hover:bg-blue-700"
          >
            $
          </button>
          <span className="text-xs text-gray-500">Investir</span>
        </div>
      </div>

      {/* O formulário só existe quando um tipo está selecionado */}
      {formAberto && (
        <FormularioLancamento
          tipo={formAberto}
          onFechar={() => setFormAberto(null)}
          onSalvo={carregarDados}
        />
      )}
    </main>
  );
}