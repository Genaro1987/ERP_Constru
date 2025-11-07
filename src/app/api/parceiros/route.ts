import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { parceiroSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");
  const tipo = request.nextUrl.searchParams.get("tipo");

  let query = supabaseAdmin
    .from("parceiros")
    .select("*")
    .order("razao_social", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar parceiros: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = parceiroSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("parceiros")
    .insert({
      empresa_id: parse.data.empresaId,
      tipo: parse.data.tipo,
      razao_social: parse.data.razaoSocial,
      cnpj_cpf: parse.data.cnpjCpf,
      ie: parse.data.inscricaoEstadual,
      email: parse.data.email,
      telefone: parse.data.telefone,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar parceiro: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
