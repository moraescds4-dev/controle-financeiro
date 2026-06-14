"use client";

import { useState, FormEvent } from "react";

type Tipo = "renda" | "debito" | "investimento";

// Uma config por tipo — o formulário lê daqui e se adapta
const CONFIG = {
  renda: {
    titulo: "Nova Renda",
    endpoint: "/api/rendas",
    campoTexto: "categoria",
    rotulo: "Categoria",
    placeholder: "ex.: salário, freelance",
    temInstituicao: false,
    cor: "text-green-600",
  },
  debito: {
    titulo: "Novo Débito",
    endpoint: "/api/debitos",
    campoTexto: "categoria",
    rotulo: "Categoria",
    placeholder: "ex.: moradia, alimentação",
    temInstituicao: false,
    cor: "text-red-600",
  },
  investimento: {
    titulo: "Novo Investimento",
    endpoint: "/api/investimentos",
    campoTexto: "tipo",
    rotulo: "Tipo",
    placeholder: "ex.: renda fixa, ações, cripto",
    temInstituicao: true,
    cor: "text-blue-600",
  },
};

export default function FormularioLancamento({
  tipo,
  onFechar,
  onSalvo,
}: {
  tipo: Tipo;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const config = CONFIG[tipo];

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [textoCategoria, setTextoCategoria] = useState(""); // categoria OU tipo
  const [instituicao, setInstituicao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e: FormEvent) {
    e.preventDefault(); // impede o navegador de recarregar a página

    if (!descricao || !valor || !textoCategoria) {
      setErro(`Preencha descrição, valor e ${config.rotulo.toLowerCase()}.`);
      return;
    }

    // monta o corpo conforme o tipo
    const corpo: Record<string, unknown> = {
      descricao,
      valor: Number(valor),
      [config.campoTexto]: textoCategoria, // vira "categoria" ou "tipo"
    };
    if (config.temInstituicao && instituicao) {
      corpo.instituicao = instituicao;
    }

    try {
      setSalvando(true);
      setErro("");
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      onSalvo();  // avisa a home pra recarregar os dados
      onFechar(); // fecha o formulário
    } catch (err) {
      console.error(err);
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* fundo escuro — clicar fecha */}
      <div onClick={onFechar} className="absolute inset-0 bg-black/40" />

      {/* o cartão do formulário */}
      <form
        onSubmit={salvar}
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className={`text-lg font-bold mb-4 ${config.cor}`}>{config.titulo}</h2>

        <label className="block text-sm text-gray-600 mb-1">Descrição</label>
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
          placeholder="ex.: Salário de junho"
        />

        <label className="block text-sm text-gray-600 mb-1">Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
          placeholder="0,00"
        />

        <label className="block text-sm text-gray-600 mb-1">{config.rotulo}</label>
        <input
          value={textoCategoria}
          onChange={(e) => setTextoCategoria(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
          placeholder={config.placeholder}
        />

        {config.temInstituicao && (
          <>
            <label className="block text-sm text-gray-600 mb-1">
              Instituição <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-3"
              placeholder="ex.: Nubank, XP"
            />
          </>
        )}

        {erro && <p className="text-sm text-red-600 mb-3">{erro}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 rounded-lg bg-gray-900 py-2 text-white disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}