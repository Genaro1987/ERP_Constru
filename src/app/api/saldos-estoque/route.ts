import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { falha, sucesso } from "@/lib/http";
import { recalcularSaldo } from "@/lib/estoque";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const empresaId = params.get("empresaId");
  const produtoId = params.get("produtoId");
  const localId = params.get("localId");

  let query = supabaseAdmin
    .from("saldos_estoque")
    .select("*")
    .order("produto_id", { ascending: true })
    .order("local_id", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (produtoId) {
    query = query.eq("produto_id", produtoId);
  }

  if (localId) {
    query = query.eq("local_id", localId);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar saldos: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { empresaId, produtoId, localId } = body as {
    empresaId?: string;
    produtoId?: string;
    localId?: string;
  };

  if (!empresaId || !produtoId || !localId) {
    return falha("empresaId, produtoId e localId são obrigatórios");
  }

  const resultado = await recalcularSaldo(empresaId, produtoId, localId);

  if (!resultado.ok) {
    return falha(`Falha ao recalcular saldo: ${resultado.mensagem}`, 500);
  }

  return sucesso(resultado.saldo);
}
