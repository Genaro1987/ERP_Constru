import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const pedidoId = request.nextUrl.searchParams.get("pedidoId");

  if (!pedidoId) {
    return falha("Informe o pedidoId", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("itens_pedido_compra")
    .select("*")
    .eq("pedido_compra_id", pedidoId);

  if (error) {
    return falha(`Falha ao listar itens do pedido: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}
