import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const recebimentoId = request.nextUrl.searchParams.get("recebimentoId");

  if (!recebimentoId) {
    return falha("Informe o recebimentoId", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("itens_recebimento")
    .select("*")
    .eq("recebimento_id", recebimentoId);

  if (error) {
    return falha(`Falha ao listar itens do recebimento: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}
