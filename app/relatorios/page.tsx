"use client";

import { useEffect, useRef, useState } from "react";
import GraficoComparativo from "@/app/components/GraficoComparativo";
import { formatarMoeda } from "@/lib/formato";
import { montarRelatorio } from "@/lib/relatorio/relatorio";
import type { RelatorioMensal } from "@/lib/relatorio/tipos";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Lancamento = { valor: string; categoria?: string; tipo?: string; data: string; descricao: string };
type LancamentoComData = {
  data: string;
};

function estaNoMesAtual(data: string) {
  const hoje = new Date();
  const dataItem = new Date(data);

  return (
    dataItem.getMonth() === hoje.getMonth() &&
    dataItem.getFullYear() === hoje.getFullYear()
  );
}

function obterMesLabel() {
  const hoje = new Date();

  return hoje.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function formatarDataCurta(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

async function buscarLista(url: string) {
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar ${url}`);
  }

  const dados = await resposta.json();

  if (Array.isArray(dados)) {
    return dados;
  }

  if (Array.isArray(dados.rendas)) {
    return dados.rendas;
  }

  if (Array.isArray(dados.debitos)) {
    return dados.debitos;
  }

  if (Array.isArray(dados.investimentos)) {
    return dados.investimentos;
  }

  return [];
}

export default function RelatoriosPage() {
  const [rendas, setRendas] = useState<Lancamento[]>([]);
  const [debitos, setDebitos] = useState<Lancamento[]>([]);
  const [investimentos, setInvestimentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mes, setMes] = useState<"atual" | "anterior">("atual");
  const graficoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [r, d, i] = await Promise.all([
          fetch("/api/rendas").then((res) => res.json()),
          fetch("/api/debitos").then((res) => res.json()),
          fetch("/api/investimentos").then((res) => res.json()),
        ]);
        setRendas(r);
        setDebitos(d);
        setInvestimentos(i);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) return <p>Carregando…</p>;

  const hoje = new Date();
  const alvo = new Date(hoje.getFullYear(), hoje.getMonth() - (mes === "anterior" ? 1 : 0), 1);
  const bruto = alvo.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mesLabel = bruto.charAt(0).toUpperCase() + bruto.slice(1);

  const doMes = (lista: Lancamento[]) =>
    lista.filter((item) => {
      const dt = new Date(item.data);
      return dt.getFullYear() === alvo.getFullYear() && dt.getMonth() === alvo.getMonth();
    });

  const relatorio = montarRelatorio({
    rendas: doMes(rendas),
    debitos: doMes(debitos),
    investimentos: doMes(investimentos),
    mesLabel,
  });

   const comparativo = [
   { nome: "Rendas", total: relatorio.panorama.rendas, cor: "#16a34a" },
   { nome: "Débitos", total: relatorio.panorama.debitos, cor: "#dc2626" },
   { nome: "Investido", total: relatorio.panorama.investido, cor: "#2563eb" },
   ];

   const abaClasse = (ativo: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
      ativo
        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        : "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
    }`;

   async function exportarPdf() {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margem = 14;
  const larguraUtil = pdf.internal.pageSize.getWidth() - margem * 2;
  let y = margem; // posição vertical atual; vai descendo conforme desenhamos

  // --- Título ---
  pdf.setFontSize(16);
  pdf.text(`Relatório — ${relatorio.mesLabel}`, margem, y);
  y += 10;

  // --- Gráfico (a única parte fotografada) ---
  const elemento = graficoRef.current;
  if (elemento) {
    const html = document.documentElement;
    const eraEscuro = html.classList.contains("dark");
    if (eraEscuro) html.classList.remove("dark");
    try {
      const imagem = await toPng(elemento, { backgroundColor: "#ffffff", pixelRatio: 2 });
      const props = pdf.getImageProperties(imagem);
      const alturaImg = (props.height * larguraUtil) / props.width;
      pdf.addImage(imagem, "PNG", margem, y, larguraUtil, alturaImg);
      y += alturaImg + 8;
    } finally {
      if (eraEscuro) html.classList.add("dark");
    }
  }

  // --- Panorama (tabela de 4 linhas) ---
  autoTable(pdf, {
    startY: y,
    head: [["Panorama", "Valor"]],
    body: [
      ["Rendas", formatarMoeda(relatorio.panorama.rendas)],
      ["Débitos", formatarMoeda(relatorio.panorama.debitos)],
      ["Investido", formatarMoeda(relatorio.panorama.investido)],
      ["Saldo", formatarMoeda(relatorio.panorama.saldo)],
    ],
    margin: { left: margem, right: margem },
    columnStyles: { 1: { halign: "right" } },
  });

  // --- Uma tabela por seção, com os itens ---
  relatorio.secoes.forEach((secao) => {
    const linhas: string[][] = [];
    secao.grupos.forEach((grupo) => {
      // linha de subtotal da categoria
      linhas.push([grupo.categoria, "", formatarMoeda(grupo.subtotal)]);
      // linhas dos itens
      grupo.itens.forEach((item) => {
        linhas.push([formatarDataCurta(item.data), item.descricao, formatarMoeda(Number(item.valor))]);
      });
    });

    autoTable(pdf, {
      head: [[`${secao.titulo}`, "", formatarMoeda(secao.total)]],
      body: linhas,
      margin: { left: margem, right: margem },
      columnStyles: { 2: { halign: "right" } },
    });
  });

  pdf.save(`relatorio-${relatorio.mesLabel}.pdf`);
}


  return (
    <main style={{ padding: "32px" }}>
      <h1>Relatório — {relatorio.mesLabel}</h1>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setMes("atual")} className={abaClasse(mes === "atual")}>Mês atual</button>
          <button onClick={() => setMes("anterior")} className={abaClasse(mes === "anterior")}>Mês anterior</button>
          <button onClick={exportarPdf} className="mb-6 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium">
  Exportar PDF
</button>
        </div>
        
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <div style={{ border: "1px solid #ddd", padding: "16px" }}>
          <strong>Rendas</strong>
          <p>{formatarMoeda(relatorio.panorama.rendas)}</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "16px" }}>
          <strong>Débitos</strong>
          <p>{formatarMoeda(relatorio.panorama.debitos)}</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "16px" }}>
          <strong>Investido</strong>
          <p>{formatarMoeda(relatorio.panorama.investido)}</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "16px" }}>
          <strong>Saldo</strong>
          <p>{formatarMoeda(relatorio.panorama.saldo)}</p>
        </div>
      </section>

       <div ref={graficoRef}>
         <GraficoComparativo dados={comparativo} mostrarTooltip={false} />
       </div>
       
      <section style={{ marginTop: "32px" }}>
       {relatorio.secoes.map((secao) => (
      <section
        key={secao.titulo}
        style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0 }}>{secao.titulo}</h2>
        <strong>{formatarMoeda(secao.total)}</strong>
      </div>

      {secao.grupos.length === 0 ? (
        <p style={{ opacity: 0.7 }}>Sem lançamentos neste mês.</p>
      ) : (
        secao.grupos.map((grupo) => (
          <div
            key={grupo.categoria}
            style={{
              borderTop: "1px solid #eee",
              paddingTop: "14px",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>{grupo.categoria}</h3>
              <span>{formatarMoeda(grupo.subtotal)}</span>
            </div>

            {grupo.itens.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) 110px",
                  gap: "12px",
                  padding: "8px 0",
                  borderTop: "1px solid #f2f2f2",
                }}
              >
                <span>{formatarDataCurta(item.data)}</span>
                <span>{item.descricao}</span>
                <strong style={{ textAlign: "right" }}>
                  {formatarMoeda(item.valor)}
                  </strong>
                </div>
              ))}
              </div>
            ))
          )}
        </section>
      ))}
    </section>
</main>
  );
}