"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormularioLancamento from "./components/FormularioLancamento";
import CardDicas from "./components/CardDicas";

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
  const [mostrarDicas, setMostrarDicas] = useState(false);

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

  const saldo = somar(rendas) - somar(debitos) - somar(investimentos);
  const positivo = saldo >= 0;

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
      {/* Card de saldo — contorno colorido conforme o saldo */}
      <div className={`rounded-2xl border-2 p-6 shadow-sm ${positivo ? "border-green-500" : "border-red-500"}`}>
        <div className="flex items-start justify-between">
          <span className="text-sm text-gray-500">Seu Saldo Atual</span>
          <button
            onClick={() => setMostrarSaldo((v) => !v)}
            aria-label={mostrarSaldo ? "Ocultar saldo" : "Mostrar saldo"}
            className="text-gray-400 hover:text-gray-600"
          >
            {mostrarSaldo ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <p className={`mt-2 text-4xl font-bold ${positivo ? "text-green-600" : "text-red-600"}`}>
          {mostrarSaldo ? formatar(saldo) : "R$ ••••••"}
        </p>

        <p className="mt-3 text-right text-sm text-gray-400">BRL</p>
      </div>

      {/* Botões de cadastro rápido — layout em triângulo, igual ao mockup */}
      <div className="relative mx-auto mt-12 h-56 w-64">
        {/* $ azul — topo, centro */}
        <button
          onClick={() => setFormAberto("investimento")}
          aria-label="Novo investimento"
          className="absolute left-1/2 top-0 -translate-x-1/2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-500 bg-white dark:bg-gray-900 text-3xl font-light text-blue-600 shadow-[0_0_18px_rgba(59,130,246,0.45)] transition hover:scale-105"
        >
          $
        </button>

        {/* − vermelho — base, esquerda */}
        <button
          onClick={() => setFormAberto("debito")}
          aria-label="Novo débito"
          className="absolute bottom-0 left-0 flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-500 bg-white dark:bg-gray-900 text-3xl font-light text-red-600 shadow-[0_0_18px_rgba(239,68,68,0.45)] transition hover:scale-105"
        >
          −
        </button>

        {/* + verde — base, direita */}
        <button
          onClick={() => setFormAberto("renda")}
          aria-label="Nova renda"
          className="absolute bottom-0 right-0 flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500 bg-white dark:bg-gray-900 text-3xl font-light text-green-600 shadow-[0_0_18px_rgba(34,197,94,0.45)] transition hover:scale-105"
        >
          +
        </button>
      </div>

      {/* Botão Dicas de IA — placeholder (Fase 3) */}
      <button
       onClick={() => setMostrarDicas((v) => !v)}
       title="Dicas de IA"
       className="fixed bottom-6 right-6 flex flex-col items-center gap-1"
      >  
       <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-[0_0_18px_rgba(139,92,246,0.5)]">
         IA
       </span>
       <span className="text-xs text-gray-500">Dicas de IA</span>
      </button>

      {mostrarDicas && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border-2 border-purple-500 bg-white p-4 shadow-xl dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
           <h2 className="text-lg font-semibold text-purple-600">
             Dicas de IA
           </h2>

           <button
             onClick={() => setMostrarDicas(false)}
             className="text-sm text-gray-400 hover:text-gray-600"
             aria-label="Fechar dicas"
           >
             ✕
           </button>
          </div>

          <CardDicas />
        </div>
      )}

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