// app/components/CardDicas.tsx
"use client";

import { useEffect, useState } from "react";
import { montarResumo } from "@/lib/dicas/resumo";
import { gerarDicas } from "@/lib/dicas/motor";
import { Dica } from "@/lib/dicas/tipos";
import { AlertCircle, AlertTriangle, CheckCircle, Info, type LucideIcon } from "lucide-react";
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

  return (
  <div>
    {dicas.map((dica) => {
      const { Icone, classes } = estiloPorSeveridade[dica.severidade];
      return (
        <div
          key={dica.id}
          className={`border rounded-lg p-3 mb-3 flex gap-3 ${classes}`}
        >
          <Icone size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{dica.titulo}</p>
            <p className="text-sm opacity-80">{dica.mensagem}</p>
          </div>
        </div>
      );
    })}

    <p className="text-xs opacity-60 mt-2">
      Observações educativas, não recomendação financeira.
    </p>
  </div>
);
}