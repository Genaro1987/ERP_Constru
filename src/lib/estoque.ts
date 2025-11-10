import { supabaseAdmin } from "@/lib/supabaseClient";
import { movimentoEstoqueSchema } from "@/lib/validation";

export async function registrarMovimento(payload: unknown) {
  const parse = movimentoEstoqueSchema.safeParse(payload);
  if (!parse.success) {
    return {
      ok: false as const,
      mensagem: parse.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const { data: movimento, error } = await supabaseAdmin
    .from("mov_estoque")
    .insert({
      empresa_id: parse.data.empresaId,
      data: parse.data.data,
      produto_id: parse.data.produtoId,
      local_id: parse.data.localId,
      tipo: parse.data.tipo,
      quantidade: parse.data.quantidade,
      custo_unitario: parse.data.custoUnitario,
      documento_tipo: parse.data.documentoTipo,
      documento_id: parse.data.documentoId,
      observacao: parse.data.observacao,
    })
    .select()
    .single();

  if (error) {
    return { ok: false as const, mensagem: error.message };
  }

  const saldo = await recalcularSaldo(
    parse.data.empresaId,
    parse.data.produtoId,
    parse.data.localId
  );

  if (!saldo.ok) {
    return { ok: false as const, mensagem: saldo.mensagem };
  }

  return { ok: true as const, movimento, saldo: saldo.saldo };
}

export async function recalcularSaldo(
  empresaId: string,
  produtoId: string,
  localId: string
) {
  const { data, error } = await supabaseAdmin
    .from("mov_estoque")
    .select("tipo, quantidade, custo_unitario")
    .eq("empresa_id", empresaId)
    .eq("produto_id", produtoId)
    .eq("local_id", localId);

  if (error) {
    return { ok: false as const, mensagem: error.message };
  }

  const movimentos = data ?? [];

  let totalEntradas = 0;
  let totalSaidas = 0;
  let custoTotalEntradas = 0;

  for (const item of movimentos) {
    if (item.tipo === "E") {
      totalEntradas += item.quantidade;
      custoTotalEntradas += item.quantidade * item.custo_unitario;
    } else {
      totalSaidas += item.quantidade;
    }
  }

  const quantidade = totalEntradas - totalSaidas;
  const custoMedio = totalEntradas > 0 ? custoTotalEntradas / totalEntradas : 0;

  const { data: saldo, error: upsertError } = await supabaseAdmin
    .from("saldos_estoque")
    .upsert(
      {
        empresa_id: empresaId,
        produto_id: produtoId,
        local_id: localId,
        quantidade,
        custo_medio: custoMedio,
      },
      {
        onConflict: "empresa_id,produto_id,local_id",
      }
    )
    .select()
    .single();

  if (upsertError) {
    return { ok: false as const, mensagem: upsertError.message };
  }

  return { ok: true as const, saldo };
}
