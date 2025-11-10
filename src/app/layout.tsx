import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Constru",
  description: "Backoffice modular para construção civil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="app-body">
        <div className="app-shell">
          <header className="app-header">
            <Link
              href="/"
              className="brand"
              aria-label="ERP Constru - página inicial"
            >
              <span className="brand__mark">EC</span>
              <span>ERP Constru</span>
            </Link>
            <nav className="nav-links" aria-label="Navegação principal">
              <Link href="/">Início</Link>
              <Link href="/usuarios/novo">Incluir usuário</Link>
            </nav>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            Pensado para escalar com Supabase e deploy contínuo na Vercel.
          </footer>
        </div>
      </body>
    </html>
  );
}
