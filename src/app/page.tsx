import Link from "next/link";

const recursos = [
  {
    titulo: "Documentação da API",
    descricao: "Conheça os endpoints REST criados para o fluxo operacional mínimo.",
    href: "#api",
  },
  {
    titulo: "Modelagem Supabase",
    descricao: "Estrutura inicial de tabelas para importar via Supabase CLI.",
    href: "#supabase",
  },
  {
    titulo: "Configuração",
    descricao: "Guia rápido para rodar localmente, conectar Supabase e publicar na Vercel.",
    href: "#configuracao",
  },
];

export default function Home() {
  return (
    <main>
      <h1>ERP Constru • BFF Next.js</h1>
      <p>
        Este projeto oferece a base mínima para construir um ERP enxuto com Next.js,
        Supabase e deploy contínuo via Vercel.
      </p>
      <section style={{ display: "grid", gap: "1.5rem", marginTop: "2rem" }}>
        {recursos.map((recurso) => (
          <article
            key={recurso.titulo}
            style={{
              border: "1px solid rgba(148, 163, 184, 0.4)",
              borderRadius: "1rem",
              padding: "1.5rem",
              background: "rgba(15, 23, 42, 0.75)",
            }}
          >
            <h2>{recurso.titulo}</h2>
            <p>{recurso.descricao}</p>
            <Link href={recurso.href} style={{ color: "#38bdf8" }}>
              Ver detalhes
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
