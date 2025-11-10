import Link from "next/link";

const highlights = [
  {
    title: "Deploy sem atrito",
    description:
      "Pipeline já otimizado para publicação na Vercel com ambientes de preview e produção em poucos cliques.",
  },
  {
    title: "Design responsivo",
    description:
      "Componentes cuidadosamente pensados para telas desktop e mobile, mantendo a identidade vermelho e branco.",
  },
  {
    title: "Stack moderna",
    description:
      "Next.js 14, Supabase e componentes acessíveis prontos para acelerar a criação do ERP da construção civil.",
  },
];

const metrics = [
  { label: "Tempo médio de setup", value: "≤ 10 min" },
  { label: "Pipelines pré-configurados", value: "2" },
  { label: "Usuários piloto", value: "8" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Bem-vindo ao ERP Constru</span>
          <h1 className="hero__title">
            Sua jornada para um backoffice inteligente começa com uma interface
            moderna e pronta para a Vercel.
          </h1>
          <p className="hero__description">
            Centralize dados da obra, conecte Supabase em minutos e distribua
            atualizações de forma contínua. Este front-end inicial estabelece a
            experiência visual que guiará todo o ERP da construção civil.
          </p>
          <div className="hero__actions">
            <Link href="/usuarios/novo" className="primary-button">
              Incluir primeiro usuário
            </Link>
            <Link href="#diferenciais" className="secondary-button">
              Ver diferenciais
            </Link>
          </div>
        </div>
        <div className="hero__card">
          <div className="tag">Status • Pré-lançamento</div>
          <p>
            Interface otimizada para carregar rápido, mesmo em conexões 3G, e
            entregar a mesma experiência em todos os dispositivos.
          </p>
          <div className="metrics">
            {metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <span className="metric__label">{metric.label}</span>
                <span className="metric__value">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="highlights">
        {highlights.map((highlight) => (
          <article className="highlight-card" key={highlight.title}>
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
