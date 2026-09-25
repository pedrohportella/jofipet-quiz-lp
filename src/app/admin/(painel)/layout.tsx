import Link from 'next/link';
import Image from 'next/image';

export default function AdminPainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-white shadow-jofi-1">
        <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/brand/jofi/variant-7.svg"
              alt="Jofi"
              width={90}
              height={36}
              className="h-8 w-auto"
            />
            <span className="text-sm font-semibold text-neutral-500">/ Admin</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/admin" className="text-neutral-700 hover:text-primary">
              Dashboard
            </Link>
            <Link href="/admin/leads" className="text-neutral-700 hover:text-primary">
              Leads
            </Link>
            <Link
              href="/admin/crm/inbox"
              className="text-neutral-700 hover:text-primary"
            >
              💬 Inbox
            </Link>
            <Link
              href="/admin/crm/kanban"
              className="text-neutral-700 hover:text-primary"
            >
              🗂 Kanban
            </Link>
            <Link
              href="/admin/analytics/quiz"
              className="text-neutral-700 hover:text-primary"
            >
              📊 Análise Quiz
            </Link>
            <Link href="/" className="text-neutral-500 hover:text-neutral-900">
              Ver site →
            </Link>
            <form action="/api/admin-auth/logout" method="post">
              <button type="submit" className="text-neutral-500 hover:text-neutral-900">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-wide px-6 py-8">{children}</main>
    </>
  );
}
