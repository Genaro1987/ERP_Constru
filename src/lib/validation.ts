import { z } from "zod";

const id = z.string().uuid({ message: "Informe um UUID válido" });
const cnpj = z
  .string()
  .min(14, "CNPJ deve conter 14 caracteres")
  .max(18, "CNPJ inválido")
  .optional();
const cpfCnpj = z
  .string()
  .min(11, "Documento deve conter no mínimo 11 dígitos")
  .max(18, "Documento inválido");

export const empresaSchema = z.object({
  nome: z.string().min(3),
  cnpj,
  inscricaoEstadual: z.string().optional(),
  email: z.string().email().optional(),
});

export const unidadeSchema = z.object({
  empresaId: id,
  nome: z.string().min(2),
});

export const usuarioSchema = z.object({
  empresaId: id,
  nome: z.string().min(3),
  email: z.string().email(),
  perfil: z.enum(["admin", "operacional", "financeiro", "consulta"]),
});

export const parceiroSchema = z.object({
  empresaId: id,
  tipo: z.enum(["cliente", "fornecedor", "transportadora"]),
  razaoSocial: z.string().min(3),
  cnpjCpf: cpfCnpj,
  inscricaoEstadual: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().min(8).optional(),
});

export const enderecoSchema = z.object({
  empresaId: id,
  parceiroId: id,
  tipo: z.enum(["faturamento", "entrega", "cobranca", "outro"]),
  logradouro: z.string().min(3),
  cidade: z.string().min(3),
  uf: z.string().length(2),
  cep: z.string().min(8).max(9),
});

export const produtoSchema = z.object({
  empresaId: id,
  sku: z.string().min(3),
  descricao: z.string().min(3),
  unidadeMedida: z.string().min(1),
  ncm: z.string().optional(),
  tipo: z.enum(["insumo", "produto_acabado", "servico"]),
});

export const localEstoqueSchema = z.object({
  empresaId: id,
  codigo: z.string().min(2),
  descricao: z.string().min(3),
});

export const centroCustoSchema = z.object({
  empresaId: id,
  codigo: z.string().min(2),
  descricao: z.string().min(3),
});

export const planoContasSchema = z.object({
  empresaId: id,
  codigo: z.string().min(2),
  descricao: z.string().min(3),
  natureza: z.enum(["credito", "debito"]),
});

export const movimentoEstoqueSchema = z.object({
  empresaId: id,
  data: z.string(),
  produtoId: id,
  localId: id,
  tipo: z.enum(["E", "S"]),
  quantidade: z.number().positive(),
  custoUnitario: z.number().nonnegative(),
  documentoTipo: z.string().min(2),
  documentoId: z.string().uuid(),
  observacao: z.string().optional(),
});

export const saldoEstoqueSchema = z.object({
  empresaId: id,
  produtoId: id,
  localId: id,
  quantidade: z.number(),
  custoMedio: z.number(),
});

export const pedidoCompraSchema = z.object({
  empresaId: id,
  parceiroId: id,
  data: z.string(),
  status: z.enum(["rascunho", "aprovado", "finalizado", "cancelado"]),
  condicaoPagamento: z.string().optional(),
  observacao: z.string().optional(),
  itens: z
    .array(
      z.object({
        produtoId: id,
        quantidade: z.number().positive(),
        precoUnitario: z.number().nonnegative(),
      })
    )
    .min(1),
});

export const recebimentoSchema = z.object({
  empresaId: id,
  pedidoCompraId: id.optional(),
  parceiroId: id,
  data: z.string(),
  numeroDocumento: z.string().min(1),
  status: z.enum(["pendente", "conferido", "finalizado"]),
  itens: z
    .array(
      z.object({
        produtoId: id,
        quantidade: z.number().positive(),
        precoUnitario: z.number().nonnegative(),
        localId: id,
      })
    )
    .min(1),
  contasPagar: z
    .array(
      z.object({
        documento: z.string().min(1),
        parcela: z.number().int().positive(),
        vencimento: z.string(),
        valor: z.number().positive(),
        centroCustoId: id.optional(),
        planoContasId: id.optional(),
      })
    )
    .optional(),
});

export const contaPagarSchema = z.object({
  empresaId: id,
  parceiroId: id,
  documento: z.string().min(1),
  parcela: z.number().int().positive(),
  vencimento: z.string(),
  valor: z.number().positive(),
  status: z.enum(["aberto", "pago", "cancelado"]).default("aberto"),
  centroCustoId: id.optional(),
  planoContasId: id.optional(),
});

export type EmpresaPayload = z.infer<typeof empresaSchema>;
export type UnidadePayload = z.infer<typeof unidadeSchema>;
export type UsuarioPayload = z.infer<typeof usuarioSchema>;
export type ParceiroPayload = z.infer<typeof parceiroSchema>;
export type EnderecoPayload = z.infer<typeof enderecoSchema>;
export type ProdutoPayload = z.infer<typeof produtoSchema>;
export type LocalEstoquePayload = z.infer<typeof localEstoqueSchema>;
export type CentroCustoPayload = z.infer<typeof centroCustoSchema>;
export type PlanoContasPayload = z.infer<typeof planoContasSchema>;
export type MovimentoEstoquePayload = z.infer<typeof movimentoEstoqueSchema>;
export type SaldoEstoquePayload = z.infer<typeof saldoEstoqueSchema>;
export type PedidoCompraPayload = z.infer<typeof pedidoCompraSchema>;
export type RecebimentoPayload = z.infer<typeof recebimentoSchema>;
export type ContaPagarPayload = z.infer<typeof contaPagarSchema>;
