import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { falha, sucesso } from "@/lib/http";
import { registrarMovimento } from "@/lib/estoque";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const empresaId = params.get("empresaId");
  const produtoId = params.get("produtoId");
  const localId = params.get("localId");

  let query = supabaseAdmin.from("mov_estoque").select("*").order("data", { ascending: false });

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
    return falha(`Falha ao listar movimentos: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const resultado = await registrarMovimento(body);

  if (!resultado.ok) {
    return falha(`Falha ao registrar movimento: ${resultado.mensagem}`, 400);
  }

  return sucesso({ movimento: resultado.movimento, saldo: resultado.saldo }, 201);
}
