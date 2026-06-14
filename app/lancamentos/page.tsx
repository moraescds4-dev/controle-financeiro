"use client";

import { useEffect, useState } from "react";
import ListaLancamentos from "../components/ListaLancamentos";

type Lancamento = {
  id: string;
  descricao: string;
  valor: string;
  categoria?: string;
  tipo?: string;
};

export default function Lancamentos() {
  const [rendas, setRendas] = useState<Lancamento[]>([]);
  const [debitos, setDebitos] = useState<Lancamento[]>([]);
  const [investimentos, setInvestimentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  if (carregando) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Lançamentos</h1>
      <ListaLancamentos titulo="Rendas" itens={rendas} cor="text-green-600" />
      <ListaLancamentos titulo="Débitos" itens={debitos} cor="text-red-600" />
      <ListaLancamentos titulo="Investimentos" itens={investimentos} cor="text-blue-600" />
    </main>
  );
}