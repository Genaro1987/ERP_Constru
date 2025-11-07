import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { planoContasSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");
  const natureza = request.nextUrl.searchParams.get("natureza");

  let query = supabaseAdmin
    .from("plano_contas")
    .select("*")
    .order("codigo", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (natureza) {
    query = query.eq("natureza", natureza);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar plano de contas: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = planoContasSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("plano_contas")
    .insert({
      empresa_id: parse.data.empresaId,
      codigo: parse.data.codigo,
      descricao: parse.data.descricao,
      natureza: parse.data.natureza,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar conta contábil: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
