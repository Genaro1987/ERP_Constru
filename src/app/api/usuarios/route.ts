import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { usuarioSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresaId");

  let query = supabaseAdmin.from("usuarios").select("*").order("nome", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar usuários: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = usuarioSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert({
      empresa_id: parse.data.empresaId,
      nome: parse.data.nome,
      email: parse.data.email,
      perfil: parse.data.perfil,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar usuário: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
