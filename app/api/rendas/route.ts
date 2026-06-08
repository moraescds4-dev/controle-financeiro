import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/rendas → lista todas as rendas
export async function GET() {
  try {
    const rendas = await prisma.renda.findMany({ orderBy: { data: "desc" } });
    return NextResponse.json(rendas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não foi possível listar as rendas." }, { status: 500 });
  }
}

// POST /api/rendas → cria uma renda
export async function POST(request: Request) {
  try {
    const { descricao, valor, categoria, moeda } = await request.json();

    if (!descricao || valor === undefined || !categoria) {
      return NextResponse.json(
        { erro: "descricao, valor e categoria são obrigatórios." },
        { status: 400 }
      );
    }

    const novaRenda = await prisma.renda.create({
      data: { descricao, valor, categoria, moeda: moeda ?? "BRL" },
    });

    return NextResponse.json(novaRenda, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não foi possível criar a renda." }, { status: 500 });
  }
}