-- Extensões utilitárias
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- Camada de domínio
create schema if not exists erp;

-- =========================
-- Enums de negócio
-- =========================
create type erp.parceiro_tipo as enum ('CLIENTE','FORNECEDOR','TRANSPORTADORA');
create type erp.produto_tipo  as enum ('INSUMO','PRODUTO_ACABADO','SERVICO');
create type erp.mov_tipo      as enum ('E','S');
create type erp.status_pedido as enum ('ABERTO','APROVADO','FATURADO','CANCELADO');
create type erp.status_receb  as enum ('ABERTO','CONFERIDO','FECHADO','CANCELADO');
create type erp.status_titulo as enum ('ABERTO','LIQUIDADO','CANCELADO');
create type erp.status_exped  as enum ('ABERTO','SEPARADO','EXPEDIDO','CANCELADO');

-- =========================
-- Função genérica de updated_at
-- =========================
create or replace function erp.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =========================
-- 1) Cadastros base
-- =========================
create table if not exists erp.empresas (
  id          uuid primary key default gen_random_uuid(),
  nome        text        not null,
  cnpj        char(14)    unique,
  email       text,
  telefone    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger t_empresas_uat before update on erp.empresas
for each row execute function erp.set_updated_at();

create table if not exists erp.unidades (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references erp.empresas(id) on delete cascade,
  nome        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ix_unidades_empresa on erp.unidades(empresa_id);
create trigger t_unidades_uat before update on erp.unidades
for each row execute function erp.set_updated_at();

create table if not exists erp.usuarios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references erp.empresas(id) on delete cascade,
  nome        text not null,
  email       text not null,
  perfil      text, -- ex.: ADMIN, FINANCEIRO, COMERCIAL...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (empresa_id, email)
);
create index if not exists ix_usuarios_empresa on erp.usuarios(empresa_id);
create trigger t_usuarios_uat before update on erp.usuarios
for each row execute function erp.set_updated_at();

create table if not exists erp.parceiros (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references erp.empresas(id) on delete cascade,
  tipo         erp.parceiro_tipo not null,
  razao_social text not null,
  cnpj_cpf     text,
  ie           text,
  email        text,
  telefone     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists ix_parceiros_empresa on erp.parceiros(empresa_id);
create index if not exists ix_parceiros_tipo on erp.parceiros(tipo);
create trigger t_parceiros_uat before update on erp.parceiros
for each row execute function erp.set_updated_at();

create table if not exists erp.enderecos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references erp.empresas(id) on delete cascade,
  parceiro_id uuid references erp.parceiros(id) on delete set null,
  tipo        text not null, -- FISCAL/ENTREGA/COBRANCA...
  logradouro  text,
  cidade      text,
  uf          char(2),
  cep         char(8),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ix_enderecos_emp on erp.enderecos(empresa_id);
create index if not exists ix_enderecos_parc on erp.enderecos(parceiro_id);
create trigger t_enderecos_uat before update on erp.enderecos
for each row execute function erp.set_updated_at();

create table if not exists erp.produtos (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references erp.empresas(id) on delete cascade,
  sku             text not null,
  descricao       text not null,
  unidade_medida  text not null, -- ex.: UN, KG, M2...
  ncm             text,
  tipo            erp.produto_tipo not null default 'INSUMO',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (empresa_id, sku)
);
create index if not exists ix_produtos_emp on erp.produtos(empresa_id);
create trigger t_produtos_uat before update on erp.produtos
for each row execute function erp.set_updated_at();

create table if not exists erp.locais_estoque (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references erp.empresas(id) on delete cascade,
  codigo      text not null,
  descricao   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (empresa_id, codigo)
);
create index if not exists ix_locais_emp on erp.locais_estoque(empresa_id);
create trigger t_locais_uat before update on erp.locais_estoque
for each row execute function erp.set_updated_at();

create table if not exists erp.centros_custos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references erp.empresas(id) on delete cascade,
  codigo      text not null,
  descricao   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (empresa_id, codigo)
);
create index if not exists ix_cc_emp on erp.centros_custos(empresa_id);
create trigger t_cc_uat before update on erp.centros_custos
for each row execute function erp.set_updated_at();

create table if not exists erp.plano_contas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references erp.empresas(id) on delete cascade,
  codigo      text not null,
  descricao   text,
  natureza    text, -- ex.: RECEITA/DESPESA/ATIVO/PASSIVO...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (empresa_id, codigo)
);
create index if not exists ix_pc_emp on erp.plano_contas(empresa_id);
create trigger t_pc_uat before update on erp.plano_contas
for each row execute function erp.set_updated_at();
