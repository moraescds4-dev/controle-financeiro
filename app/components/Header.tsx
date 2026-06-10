"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  return (
    <header>
      <div className="flex items-center justify-between p-5 max-w-md mx-auto">
        <Link href="/" className="text-xl font-bold">Controle Financeiro</Link>
        <button
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="rounded-full border border-gray-200 w-10 h-10 flex items-center justify-center text-xl"
        >
          ☰
        </button>
      </div>

      {/* Fundo escuro — só existe quando o menu está aberto; clicar nele fecha */}
      {aberto && <div onClick={fechar} className="fixed inset-0 bg-black/40 z-40" />}

      {/* A gaveta */}
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300
          ${aberto ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="font-semibold">Menu</span>
          <button onClick={fechar} aria-label="Fechar menu" className="text-xl">✕</button>
        </div>

        <ul className="p-2">
          <li><Link href="/" onClick={fechar} className="block rounded-lg px-3 py-3 hover:bg-gray-100">Início</Link></li>
          <li><Link href="/lancamentos" onClick={fechar} className="block rounded-lg px-3 py-3 hover:bg-gray-100">Lançamentos</Link></li>
          <li><span className="block rounded-lg px-3 py-3 text-gray-400">Gráficos (em breve)</span></li>
          <li><span className="block rounded-lg px-3 py-3 text-gray-400">Relatórios (em breve)</span></li>
        </ul>
      </nav>
    </header>
  );
}