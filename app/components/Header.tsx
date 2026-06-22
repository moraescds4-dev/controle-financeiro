"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [aberto, setAberto] = useState(false);
  const [escuro, setEscuro] = useState(false);
  const fechar = () => setAberto(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o tema do DOM no client; document não existe no SSR
    setEscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternarTema() {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("tema", novo ? "escuro" : "claro");
  }

  return (
    <header>
      <div className="flex items-center justify-between p-5 max-w-md mx-auto">
        <Link href="/" className="text-xl font-bold">Controle Financeiro</Link>

        <div className="flex items-center gap-2">
          <button
            onClick={alternarTema}
            aria-label="Alternar tema claro/escuro"
            className="rounded-full border border-gray-200 dark:border-gray-700 w-10 h-10 flex items-center justify-center"
          >
            {escuro ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setAberto(true)}
            aria-label="Abrir menu"
            className="rounded-full border border-gray-200 dark:border-gray-700 w-10 h-10 flex items-center justify-center text-xl"
          >
            ☰
          </button>
        </div>
      </div>

      {aberto && <div onClick={fechar} className="fixed inset-0 bg-black/40 z-40" />}

      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50
          transform transition-transform duration-300
          ${aberto ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Menu</span>
          <button onClick={fechar} aria-label="Fechar menu" className="text-xl text-gray-700 dark:text-gray-200">✕</button>
        </div>
        <ul className="p-2">
          <li><Link href="/" onClick={fechar} className="block rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Início</Link></li>
          <li><Link href="/lancamentos" onClick={fechar} className="block rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Lançamentos</Link></li>
          <li><Link href="/graficos" onClick={fechar} className="block rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Gráficos</Link></li>
          <li><Link href="/relatorios" onClick={fechar} className="block rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Relatórios</Link></li>
        </ul>
      </nav>
    </header>
  );
}