# Fluxo de Migrações (Free plan)

1) Crie arquivos em `supabase/migrations` com padrão `YYYYMMDD_HHMMSS_nome.sql`.
2) Abra PR → revisão → merge na `main`.
3) A Action `.github/workflows/supabase-db-push.yml` roda `supabase db push --db-url $SUPABASE_DB_URL` e aplica no projeto Supabase.
4) Logs ficam no GitHub Actions. Sem terminal, 100% web.

Variáveis:
- SUPABASE_DB_URL (Secrets → Actions) = Connection string (URI) do Supabase.
- Opcional: SUPABASE_SERVICE_ROLE_KEY para scripts server-side (não usado pela Action).
