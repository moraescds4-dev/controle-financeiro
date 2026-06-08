import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/investimentos/[id] → um investimento
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const investimentos = await prisma.investimento.findUnique({ where: { id } });
    if (!investimentos) return NextResponse.json({ erro: "Investimento não encontrado." }, { status: 404 });
    return NextResponse.json(investimentos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao buscar o investimento." }, { status: 500 });
  }
}

// PATCH /api/investimentos/[id] → atualiza
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dados = await request.json();
    const atualizada = await prisma.investimento.update({ where: { id }, data: dados });
    return NextResponse.json(atualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao atualizar o investimento." }, { status: 500 });
  }
}

// DELETE /api/investimentos/[id] → exclui
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.investimento.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao excluir o investimento." }, { status: 500 });
  }
}