import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { contaPagarSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const empresaId = params.get("empresaId");
  const parceiroId = params.get("parceiroId");
  const status = params.get("status");

  let query = supabaseAdmin
    .from("contas_pagar")
    .select("*")
    .order("vencimento", { ascending: true });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (parceiroId) {
    query = query.eq("parceiro_id", parceiroId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar contas a pagar: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = contaPagarSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data, error } = await supabaseAdmin
    .from("contas_pagar")
    .insert({
      empresa_id: parse.data.empresaId,
      parceiro_id: parse.data.parceiroId,
      documento: parse.data.documento,
      parcela: parse.data.parcela,
      vencimento: parse.data.vencimento,
      valor: parse.data.valor,
      status: parse.data.status,
      centro_custo_id: parse.data.centroCustoId,
      plano_contas_id: parse.data.planoContasId,
    })
    .select()
    .single();

  if (error) {
    return falha(`Falha ao criar conta a pagar: ${error.message}`, 500);
  }

  return sucesso(data, 201);
}
