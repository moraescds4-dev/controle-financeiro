import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/debitos/[id] → um debito
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const debitos = await prisma.debito.findUnique({ where: { id } });
    if (!debitos) return NextResponse.json({ erro: "Débito não encontrado." }, { status: 404 });
    return NextResponse.json(debitos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao buscar o débito." }, { status: 500 });
  }
}

// PATCH /api/debitos/[id] → atualiza
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dados = await request.json();
    const atualizada = await prisma.debito.update({ where: { id }, data: dados });
    return NextResponse.json(atualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao atualizar o débito." }, { status: 500 });
  }
}

// DELETE /api/debitos/[id] → exclui
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.debito.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao excluir o débito." }, { status: 500 });
  }
}