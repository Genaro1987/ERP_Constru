-- migration: healthcheck (safe to run multiple times)
create schema if not exists public;

create table if not exists public.healthcheck (
  id bigserial primary key,
  tag text not null default 'erp_construcao',
  created_at timestamptz not null default now()
);

-- exemplo de objeto de negócios inicial (ajuste conforme seu ERP)
create table if not exists public.empresas (
  empresa_id bigserial primary key,
  cnpj_basico varchar(8) not null,
  razao_social text not null,
  created_at timestamptz not null default now()
);

comment on table public.healthcheck is 'Sonda de migração e disponibilidade (CI)';
