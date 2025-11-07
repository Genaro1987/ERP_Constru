create schema if not exists public;

create table if not exists public.healthcheck (
  id bigserial primary key,
  tag text not null default 'erp_construcao',
  created_at timestamptz not null default now()
);

create table if not exists public.empresas (
  empresa_id bigserial primary key,
  cnpj_basico varchar(8) not null,
  razao_social text not null,
  created_at timestamptz not null default now()
);
