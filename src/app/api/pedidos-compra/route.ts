import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { pedidoCompraSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const empresaId = params.get("empresaId");
  const status = params.get("status");

  let query = supabaseAdmin
    .from("pedidos_compra")
    .select("*, itens_pedido_compra(*)")
    .order("data", { ascending: false });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar pedidos de compra: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = pedidoCompraSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data: pedido, error } = await supabaseAdmin
    .from("pedidos_compra")
    .insert({
      empresa_id: parse.data.empresaId,
      parceiro_id: parse.data.parceiroId,
      data: parse.data.data,
      status: parse.data.status,
      condicao_pagto: parse.data.condicaoPagamento,
      obs: parse.data.observacao,
    })
    .select()
    .single();

  if (error || !pedido) {
    return falha(`Falha ao criar pedido de compra: ${error?.message ?? "desconhecida"}`, 500);
  }

  const itensInsert = parse.data.itens.map((item) => ({
    pedido_compra_id: pedido.id,
    produto_id: item.produtoId,
    quantidade: item.quantidade,
    preco_unit: item.precoUnitario,
  }));

  const { data: itens, error: itensError } = await supabaseAdmin
    .from("itens_pedido_compra")
    .insert(itensInsert)
    .select();

  if (itensError) {
    return falha(`Pedido criado, mas falhou ao registrar itens: ${itensError.message}`, 500);
  }

  return sucesso({ ...pedido, itens }, 201);
}
