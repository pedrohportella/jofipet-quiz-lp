export const metadata = {
  title: 'Admin · Jofi Quiz',
  robots: { index: false, follow: false },
};

/**
 * Casca comum do /admin. O cabeçalho com a navegação mora em (painel)/layout,
 * pra tela de login não mostrar menu de quem ainda não entrou.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-neutral-100">{children}</div>;
}
