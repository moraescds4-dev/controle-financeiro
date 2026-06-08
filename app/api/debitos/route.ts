import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/debitos → lista todas os debitos
export async function GET() {
  try {
    const debitos = await prisma.debito.findMany({ orderBy: { data: "desc" } });
    return NextResponse.json(debitos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não foi possível listar os débitos." }, { status: 500 });
  }
}

// POST /api/debitos → cria um debito
export async function POST(request: Request) {
  try {
    const { descricao, valor, categoria, moeda } = await request.json();

    if (!descricao || valor === undefined || !categoria) {
      return NextResponse.json(
        { erro: "descricao, valor e categoria são obrigatórios." },
        { status: 400 }
      );
    }

    const novoDebito = await prisma.debito.create({
      data: { descricao, valor, categoria, moeda: moeda ?? "BRL" },
    });

    return NextResponse.json(novoDebito, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Não foi possível criar o débito." }, { status: 500 });
  }
}