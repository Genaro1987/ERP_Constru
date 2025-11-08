-- 20251107_180001_init.sql
-- Baseline do ERP (schema public)

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- Garantia do schema
create schema if not exists public;

-- Utilitário: auto-update de updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

----------------------------------------------------------------------
-- TABELAS DE CADASTRO
----------------------------------------------------------------------

-- Empresas
create table if not exists public.empresas (
  empresa_id uuid primary key default gen_random_uuid(),
  cnpj varchar(14),
  razao_social text not null,
  nome_fantasia text,
  email text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_empresas_updated on public.empresas;
create trigger trg_empresas_updated before update on public.empresas
for each row execute function public.tg_set_updated_at();

-- Usuários
create table if not exists public.usuarios (
  usuario_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  nome text not null,
  email text not null unique,
  role text default 'user',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_usuarios_updated on public.usuarios;
create trigger trg_usuarios_updated before update on public.usuarios
for each row execute function public.tg_set_updated_at();

-- Endereços (genéricos, reusáveis)
create table if not exists public.enderecos (
  endereco_id uuid primary key default gen_random_uuid(),
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado char(2),
  cep varchar(8),
  pais text default 'BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_enderecos_updated on public.enderecos;
create trigger trg_enderecos_updated before update on public.enderecos
for each row execute function public.tg_set_updated_at();

-- Parceiros (clientes/fornecedores)
create table if not exists public.parceiros (
  parceiro_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  tipo text not null default 'FORNECEDOR', -- FORNECEDOR | CLIENTE | AMBOS
  documento varchar(14),                   -- CNPJ/CPF sem máscara
  razao_nome text not null,
  endereco_id uuid references public.enderecos(endereco_id),
  email text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_parceiros_empresa on public.parceiros(empresa_id);
drop trigger if exists trg_parceiros_updated on public.parceiros;
create trigger trg_parceiros_updated before update on public.parceiros
for each row execute function public.tg_set_updated_at();

-- Unidades de medida
create table if not exists public.unidades (
  unidade_id uuid primary key default gen_random_uuid(),
  codigo text not null unique, -- ex.: UN, KG, CX
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_unidades_updated on public.unidades;
create trigger trg_unidades_updated before update on public.unidades
for each row execute function public.tg_set_updated_at();

-- Produtos
create table if not exists public.produtos (
  produto_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  sku text unique,
  nome text not null,
  unidade_id uuid references public.unidades(unidade_id),
  preco_base numeric(14,2) default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_produtos_empresa on public.produtos(empresa_id);
drop trigger if exists trg_produtos_updated on public.produtos;
create trigger trg_produtos_updated before update on public.produtos
for each row execute function public.tg_set_updated_at();

----------------------------------------------------------------------
-- FINANCEIRO (Plano de Contas / Centros de Custos / AP & Recebimentos)
----------------------------------------------------------------------

-- Plano de Contas (hierárquico)
create table if not exists public.plano_contas (
  conta_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  codigo text not null,                     -- ex.: 1.1.01
  nome text not null,
  tipo text not null,                       -- ATIVO | PASSIVO | RECEITA | DESPESA | PATRIMONIO
  conta_pai_id uuid references public.plano_contas(conta_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, codigo)
);
create index if not exists ix_plano_contas_empresa on public.plano_contas(empresa_id);
drop trigger if exists trg_plano_contas_updated on public.plano_contas;
create trigger trg_plano_contas_updated before update on public.plano_contas
for each row execute function public.tg_set_updated_at();

-- Centros de Custos (hierárquico)
create table if not exists public.centros_custos (
  centro_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  codigo text not null,
  nome text not null,
  centro_pai_id uuid references public.centros_custos(centro_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, codigo)
);
create index if not exists ix_centros_custos_empresa on public.centros_custos(empresa_id);
drop trigger if exists trg_centros_custos_updated on public.centros_custos;
create trigger trg_centros_custos_updated before update on public.centros_custos
for each row execute function public.tg_set_updated_at();

-- Contas a Pagar
create table if not exists public.contas_pagar (
  pagar_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  parceiro_id uuid references public.parceiros(parceiro_id),
  documento text,                              -- NF, pedido, etc.
  emissao date,
  vencimento date,
  plano_conta_id uuid references public.plano_contas(conta_id),
  centro_id uuid references public.centros_custos(centro_id),
  valor_bruto numeric(14,2) not null default 0,
  descontos numeric(14,2) not null default 0,
  acrescimos numeric(14,2) not null default 0,
  valor_liquido numeric(14,2) generated always as (valor_bruto - descontos + acrescimos) stored,
  status text not null default 'ABERTA',       -- ABERTA | PAGA | CANCELADA
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_cp_empresa on public.contas_pagar(empresa_id);
create index if not exists ix_cp_parceiro on public.contas_pagar(parceiro_id);
drop trigger if exists trg_cp_updated on public.contas_pagar;
create trigger trg_cp_updated before update on public.contas_pagar
for each row execute function public.tg_set_updated_at();

-- Recebimentos (simples)
create table if not exists public.recebimentos (
  receb_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  parceiro_id uuid references public.parceiros(parceiro_id),
  documento text,
  data_recebimento date not null default current_date,
  valor numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_receb_empresa on public.recebimentos(empresa_id);
drop trigger if exists trg_receb_updated on public.recebimentos;
create trigger trg_receb_updated before update on public.recebimentos
for each row execute function public.tg_set_updated_at();

----------------------------------------------------------------------
-- COMPRAS & ESTOQUE
----------------------------------------------------------------------

-- Locais de Estoque
create table if not exists public.locais_estoque (
  local_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  codigo text not null,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, codigo)
);
drop trigger if exists trg_locais_updated on public.locais_estoque;
create trigger trg_locais_updated before update on public.locais_estoque
for each row execute function public.tg_set_updated_at();

-- Pedidos de Compra
create table if not exists public.pedidos_compra (
  pedido_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  parceiro_id uuid references public.parceiros(parceiro_id),
  data_pedido date not null default current_date,
  status text not null default 'ABERTO', -- ABERTO | APROVADO | RECEBENDO | FECHADO | CANCELADO
  total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_pcompra_empresa on public.pedidos_compra(empresa_id);
drop trigger if exists trg_pcompra_updated on public.pedidos_compra;
create trigger trg_pcompra_updated before update on public.pedidos_compra
for each row execute function public.tg_set_updated_at();

-- Itens do Pedido de Compra
create table if not exists public.itens_pedido_compra (
  item_id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.pedidos_compra(pedido_id) on delete cascade,
  produto_id uuid references public.produtos(produto_id),
  quantidade numeric(14,3) not null default 0,
  valor_unit numeric(14,4) not null default 0,
  valor_total numeric(14,2) generated always as (quantidade * valor_unit) stored
);
create index if not exists ix_itens_pc_pedido on public.itens_pedido_compra(pedido_id);

-- Itens de Recebimento (entrada por pedido)
create table if not exists public.itens_recebimento (
  receb_item_id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.pedidos_compra(pedido_id) on delete cascade,
  produto_id uuid references public.produtos(produto_id),
  quantidade_recebida numeric(14,3) not null default 0,
  data_recebimento date not null default current_date
);
create index if not exists ix_itens_rec_pedido on public.itens_recebimento(pedido_id);

-- Movimentações de Estoque
create table if not exists public.mov_estoque (
  mov_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  produto_id uuid references public.produtos(produto_id),
  local_id uuid references public.locais_estoque(local_id),
  tipo text not null, -- ENTRADA | SAIDA | AJUSTE
  quantidade numeric(14,3) not null,
  origem text,        -- ex.: PEDIDO_COMPRA, AJUSTE_MANUAL
  referencia text,    -- ex.: número do pedido/documento
  created_at timestamptz not null default now()
);
create index if not exists ix_mov_empresa on public.mov_estoque(empresa_id);
create index if not exists ix_mov_produto on public.mov_estoque(produto_id);

-- Saldos de Estoque (snapshot por produto/local)
create table if not exists public.saldos_estoque (
  saldo_id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(empresa_id) on delete cascade,
  produto_id uuid references public.produtos(produto_id),
  local_id uuid references public.locais_estoque(local_id),
  saldo numeric(14,3) not null default 0,
  updated_at timestamptz not null default now(),
  unique (empresa_id, produto_id, local_id)
);

----------------------------------------------------------------------
-- HEALTHCHECK
----------------------------------------------------------------------

create table if not exists public.healthcheck (
  id bigserial primary key,
  tag text not null default 'erp_construcao',
  created_at timestamptz not null default now()
);

comment on table public.healthcheck is 'Sonda de migração e disponibilidade (CI)';
comment on table public.saldos_estoque is 'Saldo consolidado por produto/local';
