"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

type FormData = {
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  observacoes: string;
};

const emptyForm: FormData = {
  nome: "",
  email: "",
  cargo: "",
  telefone: "",
  observacoes: "",
};

const sugestoesDeCargo = [
  "Engenheiro Residente",
  "Coordenador de Obras",
  "Analista Financeiro",
  "Comprador",
];

export default function NovoUsuarioPage() {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
    }, 600);
  }

  function resetForm() {
    setFormData(emptyForm);
    setHasSubmitted(false);
  }

  return (
    <section className="form-section">
      <div className="form-header">
        <span className="hero__eyebrow">Onboarding rápido</span>
        <h1>Cadastro de novo usuário</h1>
        <p>
          Registre membros da equipe para iniciar o controle operacional do ERP.
          Os dados ficam prontos para sincronizar com o Supabase e publicar na
          Vercel sem ajustes adicionais.
        </p>
      </div>

      <div className="form-layout">
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Maria de Souza"
                required
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail corporativo</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nome@erpconstru.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="cargo">Cargo</label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Selecione uma função
                </option>
                {sugestoesDeCargo.map((cargo) => (
                  <option key={cargo} value={cargo}>
                    {cargo}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="telefone">Telefone para contato</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 91234-5678"
                autoComplete="tel"
              />
            </div>

            <div className="field">
              <label htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Informe necessidades de acesso, unidades ou equipes."
                rows={3}
              />
            </div>
          </div>

          {hasSubmitted && (
            <div className="success-banner" role="status">
              ✅ Usuário preparado para sincronizar com a base Supabase.
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Limpar campos
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar usuário"}
            </button>
          </div>
        </form>

        <aside className="form-aside">
          <section>
            <h2>Fluxo de integração</h2>
            <p>
              Os dados enviados serão transformados em payload pronto para a API
              BFF e persistidos no Supabase. O deploy na Vercel replica o front
              automaticamente em cada branch.
            </p>
          </section>
          <section>
            <h2>Próximos passos</h2>
            <p>
              Adicione permissões, convide o usuário por e-mail e monitore o
              status em dashboards em tempo real.
            </p>
            <Link href="/" className="secondary-button">
              Voltar para início
            </Link>
          </section>
        </aside>
      </div>
    </section>
  );
}
