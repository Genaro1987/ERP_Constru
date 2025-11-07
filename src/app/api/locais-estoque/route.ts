import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { localEstoqueSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");

  let query = supabaseAdmin
    .from("locais_estoque")
    .select("*")
    .order("codigo", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar locais de estoque: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = localEstoqueSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("locais_estoque")
    .insert({
      empresa_id: parse.data.empresaId,
      codigo: parse.data.codigo,
      descricao: parse.data.descricao,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar local de estoque: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
