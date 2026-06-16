// app/components/CardDicas.tsx
"use client";

import { useEffect, useState } from "react";
import { montarResumo } from "@/lib/dicas/resumo";
import { gerarDicas } from "@/lib/dicas/motor";
import { Dica } from "@/lib/dicas/tipos";
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, CheckCircle, Info, type LucideIcon } from "lucide-react";
import { SeveridadeDica } from "@/lib/dicas/tipos";

const estiloPorSeveridade: Record<SeveridadeDica, { Icone: LucideIcon; classes: string }> = {
  alerta: {
    Icone: AlertTriangle,
    classes: "border-red-500/50 text-red-400",
  },
  
   atencao: {
    Icone: AlertCircle,
    classes: "border-yellow-500/50 text-yellow-400",
  },

  positivo: {
    Icone: CheckCircle,
    classes: "border-green-500/50 text-green-400",
  },

  info: {
    Icone: Info,
    classes: "border-blue-500/50 text-blue-400",
  },

};


export default function CardDicas() {
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [indice, setIndice] = useState(0); 


  useEffect(() => {
    async function carregar() {
      try {
        // AJUSTE os caminhos pros MESMOS endpoints que seu CardSaldo já chama
        const [rendas, debitos, investimentos] = await Promise.all([
          fetch("/api/rendas").then((r) => r.json()),
          fetch("/api/debitos").then((r) => r.json()),
          fetch("/api/investimentos").then((r) => r.json()),
        ]);

        const resumo = montarResumo(rendas, debitos, investimentos);
        setDicas(gerarDicas(resumo));
      } catch (erro) {
        console.error("Falha ao carregar dicas:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) return <p>Analisando suas finanças...</p>;

  if (dicas.length === 0) {
    return <p>Nenhuma observação para este mês.</p>;
  }

  const total = dicas.length;
  const naIntro = indice === 0;
  const dicaAtual = naIntro ? null : dicas[indice - 1];
  const Icone = dicaAtual ? estiloPorSeveridade[dicaAtual.severidade].Icone : null;
  const classes = dicaAtual ? estiloPorSeveridade[dicaAtual.severidade].classes : "";

  const anterior = () => {
  setIndice((i) => Math.max(0, i - 1));
  };

  const proximo = () => {
  setIndice((i) => Math.min(total, i + 1));
  };

   return (
    <div>
      {naIntro && (
        <div className="p-3">
          <p className="font-semibold">
            Tenho {total} {total === 1 ? "dica" : "dicas"} pra você
          </p>
          <p className="text-sm opacity-80">É só ir passando pro lado.</p>
        </div>
      )}

      {dicaAtual && Icone && (
        <div className={`border rounded-lg p-3 flex gap-3 ${classes}`}>
          <Icone size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{dicaAtual.titulo}</p>
            <p className="text-sm opacity-80">{dicaAtual.mensagem}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={anterior}
          disabled={indice === 0}
          aria-label="Anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full text-purple-400 border border-purple-500/50 hover:bg-purple-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
         <ChevronLeft size={22} />
        </button>

        <span className="text-xs opacity-70">{naIntro ? "" : `${indice} de ${total}`}</span>

        <button
          onClick={proximo}
          disabled={indice === total}
          aria-label="Próximo"
          className="flex h-10 w-10 items-center justify-center rounded-full text-purple-400 border border-purple-500/50 hover:bg-purple-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
         <ChevronRight size={22} />
        </button>
      </div>

      <p className="text-xs opacity-60 mt-2">
        Observações educativas, não recomendação financeira.
      </p>
    </div>
  );
}