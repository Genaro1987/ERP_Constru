-- Domínio
create schema if not exists financas;

create table if not exists financas.lancamentos (
  id uuid primary key default gen_random_uuid(),
  data_lcto date        not null,
  tipo      text        not null check (tipo in ('RECEITA','DESPESA')),
  area      text        not null,
  conta     text        not null,
  banco     text        not null,
  valor     numeric(12,2) not null check (valor >= 0),
  owner_id  uuid        not null,
  created_at timestamptz default now()
);

create index if not exists ix_lcto_data  on financas.lancamentos (data_lcto);
create index if not exists ix_lcto_owner on financas.lancamentos (owner_id);

-- Segurança: RLS via "GUC" de sessão (app.user_id)
alter table financas.lancamentos enable row level security;

create policy rls_select_own
  on financas.lancamentos
  for select
  using (
    current_setting('app.user_id', true) is not null
    and owner_id = current_setting('app.user_id', true)::uuid
  );

create policy rls_insert_own
  on financas.lancamentos
  for insert
  with check (
    current_setting('app.user_id', true) is not null
    and owner_id = current_setting('app.user_id', true)::uuid
  );

create policy rls_update_own
  on financas.lancamentos
  for update
  using (
    current_setting('app.user_id', true) is not null
    and owner_id = current_setting('app.user_id', true)::uuid
  )
  with check (
    current_setting('app.user_id', true) is not null
    and owner_id = current_setting('app.user_id', true)::uuid
  );

create policy rls_delete_own
  on financas.lancamentos
  for delete
  using (
    current_setting('app.user_id', true) is not null
    and owner_id = current_setting('app.user_id', true)::uuid
  );
