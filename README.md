# ERP Constru BFF

Base mínima em Next.js (API Routes com App Router) para suportar o fluxo operacional solicitado (cadastros, estoque e compras) integrada ao Supabase. A estrutura foi pensada para facilitar o deploy na Vercel com gatilho pelo GitHub.

## Pré-requisitos

- Node.js 18.18+ (mesma versão utilizada pela Vercel)
- Conta Supabase com projeto provisionado
- GitHub conectado à Vercel

## Como rodar localmente

```bash
npm install
npm run dev
```

Crie um arquivo `.env.local` copiando os valores de `.env.example` e usando a chave **Service Role** do Supabase (necessária para operações server-side).

## Estrutura principal

```
src/
  app/
    api/                   # Endpoints RESTful por domínio
    globals.css            # Estilos simples para a landing
    layout.tsx
    page.tsx
  lib/
    estoque.ts             # Funções auxiliares de estoque
    http.ts                # Helpers para respostas HTTP consistentes
    supabaseClient.ts      # Cliente administrativo (service role)
    validation.ts          # Schemas Zod para validação de payloads
supabase/
  migrations/
    0001_schema.sql        # Script inicial das tabelas sugeridas
```

## Endpoints implementados

Todos os endpoints estão em `src/app/api/<recurso>/route.ts` e seguem o padrão `GET` para listagem e `POST` para criação/fluxo.

- `/api/empresas`
- `/api/unidades`
- `/api/usuarios`
- `/api/parceiros`
- `/api/enderecos`
- `/api/produtos`
- `/api/locais-estoque`
- `/api/centros-custos`
- `/api/plano-contas`
- `/api/mov-estoque`
- `/api/saldos-estoque`
- `/api/pedidos-compra`
- `/api/itens-pedido-compra`
- `/api/recebimentos`
- `/api/itens-recebimento`
- `/api/contas-pagar`
- `/api/health` (inclui verificação de conectividade com o Supabase)

### Fluxos automatizados

- **Recebimento → Estoque**: ao chamar `POST /api/recebimentos`, além de gravar os itens recebidos são criadas movimentações de entrada (`mov_estoque`) e os saldos (`saldos_estoque`) são atualizados automaticamente.
- **Recebimento → Financeiro**: ao enviar o array `contasPagar` no mesmo payload de recebimento, os títulos são criados em `contas_pagar`.
- **Movimentações manuais**: `POST /api/mov-estoque` aceita lançamentos diretos e recalcula o saldo médio do produto/local correspondente.

## Banco de dados (Supabase)

O arquivo `supabase/migrations/0001_schema.sql` contém a modelagem mínima sugerida, com chaves estrangeiras, índices e restrições de unicidade. Importe via Supabase CLI ou console SQL.

```bash
supabase db push --file supabase/migrations/0001_schema.sql
```

> Ajuste os tipos/colunas conforme evoluir o projeto (por exemplo, acrescentando rastreabilidade por lote, contas a receber etc.).

## Deploy na Vercel

1. Faça fork/repo no GitHub e conecte a Vercel ao repositório.
2. Configure as variáveis de ambiente na Vercel (`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`).
3. A cada push na branch principal a Vercel criará um preview ou produção conforme configuração.

## Próximos passos sugeridos

- Implementar autenticação/JWT e controle de acesso por perfil.
- Criar testes automatizados (unitários + integração) para os fluxos críticos.
- Expor documentação via Swagger ou Redoc para facilitar consumo externo.
- Complementar os endpoints com `PUT/PATCH/DELETE` para edição e inativação de cadastros.
- Adicionar tratativas transacionais (RPC/Edge Functions) para garantir atomicidade completa nos fluxos mais complexos.

## Histórico de versões

- [2024-05-15](docs/versoes/2024-05-15.md)
