import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { unidadeSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");

  let query = supabaseAdmin.from("unidades").select("*").order("nome", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar unidades: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = unidadeSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("unidades")
    .insert({
      empresa_id: parse.data.empresaId,
      nome: parse.data.nome,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar unidade: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
