import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { enderecoSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const parceiroId = request.nextUrl.searchParams.get("parceiroId");

  let query = supabaseAdmin.from("enderecos").select("*");

  if (parceiroId) {
    query = query.eq("parceiro_id", parceiroId);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar endereços: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = enderecoSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("enderecos")
    .insert({
      empresa_id: parse.data.empresaId,
      parceiro_id: parse.data.parceiroId,
      tipo: parse.data.tipo,
      logradouro: parse.data.logradouro,
      cidade: parse.data.cidade,
      uf: parse.data.uf,
      cep: parse.data.cep,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar endereço: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
