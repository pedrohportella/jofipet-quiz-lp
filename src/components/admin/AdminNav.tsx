'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Columns3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface Item {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Dashboard só fica ativo na rota exata; as outras, em qualquer subrota. */
  exact?: boolean;
}

const ITEMS: Item[] = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', Icon: Users },
  { href: '/admin/crm/inbox', label: 'Inbox', Icon: MessageCircle },
  { href: '/admin/crm/kanban', label: 'Kanban', Icon: Columns3 },
  { href: '/admin/analytics/quiz', label: 'Análise do quiz', Icon: BarChart3 },
];

const baseItem =
  'inline-flex min-h-[40px] items-center gap-2 rounded-pill px-3.5 text-sm font-semibold transition-colors';

/**
 * Menu do painel. Fica numa barra branca logo abaixo da faixa azul: texto em
 * azul-tinta sobre branco (8,8:1), item ativo em pílula azul-tinta com texto branco.
 * Quebra de linha em vez de rolagem lateral, para o celular não vazar a página.
 */
export function AdminNav() {
  const pathname = usePathname() ?? '';
  const isActive = (i: Item) => (i.exact ? pathname === i.href : pathname.startsWith(i.href));

  return (
    <nav
      aria-label="Menu do painel"
      className="mx-auto flex max-w-wide flex-wrap items-center gap-x-1 gap-y-1 px-4 py-2 md:px-6"
    >
      {ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`${baseItem} ${
              active
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-900 hover:bg-primary-50'
            }`}
          >
            <item.Icon size={18} strokeWidth={2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      <span className="ml-auto flex items-center gap-1">
        <Link href="/" className={`${baseItem} text-neutral-700 hover:bg-primary-50`}>
          <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
          Ver site
        </Link>
        <form action="/api/admin-auth/logout" method="post">
          <button type="submit" className={`${baseItem} text-neutral-700 hover:bg-primary-50`}>
            <LogOut size={16} strokeWidth={2} aria-hidden="true" />
            Sair
          </button>
        </form>
      </span>
    </nav>
  );
}
