import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/rendas/[id] → uma renda
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const renda = await prisma.renda.findUnique({ where: { id } });
    if (!renda) return NextResponse.json({ erro: "Renda não encontrada." }, { status: 404 });
    return NextResponse.json(renda);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao buscar a renda." }, { status: 500 });
  }
}

// PATCH /api/rendas/[id] → atualiza
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dados = await request.json();
    const atualizada = await prisma.renda.update({ where: { id }, data: dados });
    return NextResponse.json(atualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao atualizar a renda." }, { status: 500 });
  }
}

// DELETE /api/rendas/[id] → exclui
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.renda.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao excluir a renda." }, { status: 500 });
  }
}