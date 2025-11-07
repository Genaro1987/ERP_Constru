create extension if not exists "pgcrypto" with schema public;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  ie text,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  email text not null,
  perfil text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (empresa_id, email)
);

create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  tipo text not null,
  razao_social text not null,
  cnpj_cpf text not null,
  ie text,
  email text,
  telefone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists parceiros_empresa_idx on public.parceiros(empresa_id);

create table if not exists public.enderecos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  parceiro_id uuid not null references public.parceiros(id) on delete cascade,
  tipo text not null,
  logradouro text not null,
  cidade text not null,
  uf char(2) not null,
  cep text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  sku text not null,
  descricao text not null,
  unidade_medida text not null,
  ncm text,
  tipo text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (empresa_id, sku)
);

create table if not exists public.locais_estoque (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  codigo text not null,
  descricao text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (empresa_id, codigo)
);

create table if not exists public.centros_custos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  codigo text not null,
  descricao text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (empresa_id, codigo)
);

create table if not exists public.plano_contas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  codigo text not null,
  descricao text not null,
  natureza text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (empresa_id, codigo)
);

create table if not exists public.mov_estoque (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  data date not null,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  local_id uuid not null references public.locais_estoque(id) on delete restrict,
  tipo char(1) not null check (tipo in ('E','S')),
  quantidade numeric(18,4) not null,
  custo_unitario numeric(18,4) not null,
  documento_tipo text not null,
  documento_id uuid not null,
  observacao text,
  created_at timestamp with time zone default now()
);

create index if not exists mov_estoque_empresa_produto_local_idx on public.mov_estoque(empresa_id, produto_id, local_id);

create table if not exists public.saldos_estoque (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  local_id uuid not null references public.locais_estoque(id) on delete restrict,
  quantidade numeric(18,4) not null default 0,
  custo_medio numeric(18,4) not null default 0,
  updated_at timestamp with time zone default now(),
  unique (empresa_id, produto_id, local_id)
);

create table if not exists public.pedidos_compra (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  parceiro_id uuid not null references public.parceiros(id) on delete restrict,
  data date not null,
  status text not null,
  condicao_pagto text,
  obs text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.itens_pedido_compra (
  id uuid primary key default gen_random_uuid(),
  pedido_compra_id uuid not null references public.pedidos_compra(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade numeric(18,4) not null,
  preco_unit numeric(18,4) not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.recebimentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  pedido_compra_id uuid references public.pedidos_compra(id) on delete set null,
  parceiro_id uuid not null references public.parceiros(id) on delete restrict,
  data date not null,
  numero_doc text not null,
  status text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.itens_recebimento (
  id uuid primary key default gen_random_uuid(),
  recebimento_id uuid not null references public.recebimentos(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade numeric(18,4) not null,
  preco_unit numeric(18,4) not null,
  local_id uuid not null references public.locais_estoque(id) on delete restrict,
  created_at timestamp with time zone default now()
);

create table if not exists public.contas_pagar (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  parceiro_id uuid not null references public.parceiros(id) on delete restrict,
  documento text not null,
  parcela integer not null,
  vencimento date not null,
  valor numeric(18,4) not null,
  status text not null,
  centro_custo_id uuid references public.centros_custos(id) on delete set null,
  plano_contas_id uuid references public.plano_contas(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists contas_pagar_empresa_idx on public.contas_pagar(empresa_id);
create index if not exists contas_pagar_status_idx on public.contas_pagar(status);
