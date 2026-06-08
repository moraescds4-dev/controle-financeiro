import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/investimentos → lista todas os investimentos
export async function GET() {
  try {
    const investimentos = await prisma.investimento.findMany({ orderBy: { data: "desc" } });
    return NextResponse.json(investimentos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não foi possível listar os investimentos." }, { status: 500 });
  }
}

// POST /api/investimentos → cria um investimento
export async function POST(request: Request) {
  try {
    const { descricao, valor, tipo, instituicao, moeda } = await request.json();

    if (!descricao || valor === undefined || !tipo) {
      return NextResponse.json(
        { erro: "descricao, valor e tipo são obrigatórios." },
        { status: 400 }
      );
    }

    const novoInvestimento = await prisma.investimento.create({
      data: { descricao, valor, tipo, instituicao, moeda: moeda ?? "BRL" },
    });

    return NextResponse.json(novoInvestimento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não foi possível criar o investimento." }, { status: 500 });
  }
}