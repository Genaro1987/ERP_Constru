import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { produtoSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");
  const tipo = request.nextUrl.searchParams.get("tipo");

  let query = supabaseAdmin
    .from("produtos")
    .select("*")
    .order("descricao", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar produtos: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = produtoSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("produtos")
    .insert({
      empresa_id: parse.data.empresaId,
      sku: parse.data.sku,
      descricao: parse.data.descricao,
      unidade_medida: parse.data.unidadeMedida,
      ncm: parse.data.ncm,
      tipo: parse.data.tipo,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar produto: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
