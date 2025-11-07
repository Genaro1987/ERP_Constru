import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { empresaSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("empresas")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    return falha(`Falha ao listar empresas: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = empresaSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("empresas")
    .insert({
      nome: parse.data.nome,
      cnpj: parse.data.cnpj,
      ie: parse.data.inscricaoEstadual,
      email: parse.data.email,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar empresa: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
