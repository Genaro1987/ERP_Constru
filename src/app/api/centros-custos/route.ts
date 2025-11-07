import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { centroCustoSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");

  let query = supabaseAdmin
    .from("centros_custos")
    .select("*")
    .order("codigo", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar centros de custo: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = centroCustoSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("centros_custos")
    .insert({
      empresa_id: parse.data.empresaId,
      codigo: parse.data.codigo,
      descricao: parse.data.descricao,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar centro de custo: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
