import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { recebimentoSchema } from "@/lib/validation";
import { falha, sucesso } from "@/lib/http";
import { registrarMovimento } from "@/lib/estoque";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const empresaId = params.get("empresaId");
  const status = params.get("status");

  let query = supabaseAdmin
    .from("recebimentos")
    .select("*, itens_recebimento(*)")
    .order("data", { ascending: false });

  if (empresaId) {
    query = query.eq("empresa_id", empresaId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return falha(`Falha ao listar recebimentos: ${error.message}`, 500);
  }

  return sucesso(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parse = recebimentoSchema.safeParse(body);

  if (!parse.success) {
    return falha(parse.error.issues.map((issue) => issue.message).join(", "));
  }

  const { data: recebimento, error } = await supabaseAdmin
    .from("recebimentos")
    .insert({
      empresa_id: parse.data.empresaId,
      pedido_compra_id: parse.data.pedidoCompraId,
      parceiro_id: parse.data.parceiroId,
      data: parse.data.data,
      numero_doc: parse.data.numeroDocumento,
      status: parse.data.status,
    })
    .select()
    .single();

  if (error || !recebimento) {
    return falha(`Falha ao criar recebimento: ${error?.message ?? "desconhecida"}`, 500);
  }

  const itensInsert = parse.data.itens.map((item) => ({
    recebimento_id: recebimento.id,
    produto_id: item.produtoId,
    quantidade: item.quantidade,
    preco_unit: item.precoUnitario,
    local_id: item.localId,
  }));

  const { data: itens, error: itensError } = await supabaseAdmin
    .from("itens_recebimento")
    .insert(itensInsert)
    .select();

  if (itensError) {
    return falha(`Recebimento criado, mas falhou ao registrar itens: ${itensError.message}`, 500);
  }

  for (const item of itens ?? []) {
    const movimento = await registrarMovimento({
      empresaId: recebimento.empresa_id,
      data: recebimento.data,
      produtoId: item.produto_id,
      localId: item.local_id,
      tipo: "E",
      quantidade: item.quantidade,
      custoUnitario: item.preco_unit,
      documentoTipo: "recebimento",
      documentoId: recebimento.id,
      observacao: `Recebimento ${recebimento.numero_doc}`,
    });

    if (!movimento.ok) {
      return falha(`Item registrado, mas falhou ao gerar movimento: ${movimento.mensagem}`, 500);
    }
  }

  if (parse.data.contasPagar && parse.data.contasPagar.length > 0) {
    const contasInsert = parse.data.contasPagar.map((conta) => ({
      empresa_id: recebimento.empresa_id,
      parceiro_id: recebimento.parceiro_id,
      documento: conta.documento,
      parcela: conta.parcela,
      vencimento: conta.vencimento,
      valor: conta.valor,
      status: "aberto",
      centro_custo_id: conta.centroCustoId,
      plano_contas_id: conta.planoContasId,
    }));

    const { error: contasError } = await supabaseAdmin
      .from("contas_pagar")
      .insert(contasInsert);

    if (contasError) {
      return falha(
        `Recebimento e estoque concluídos, mas falhou ao lançar títulos: ${contasError.message}`,
        500
      );
    }
  }

  return sucesso({ ...recebimento, itens }, 201);
}
