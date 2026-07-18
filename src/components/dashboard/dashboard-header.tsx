import Image from 'next/image';
import Link from 'next/link';

interface DashboardHeaderProps {
  nomePerfil: string;
  equipe: string;
  icon: string;
}

export function DashboardHeader({ nomePerfil, equipe, icon }: DashboardHeaderProps) {
  return (
    <header className="border-b border-apex-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo-icon.png"
            alt="ÁPEX Saúde"
            width={36}
            height={36}
            className="rounded"
          />
          <span className="font-display text-xl font-semibold text-apex-ink">
            ÁPEX Saúde
          </span>
        </Link>
        <div className="text-right">
          <p className="font-medium text-apex-ink">
            {icon} {nomePerfil}
          </p>
          <p className="text-sm text-apex-muted">{equipe}</p>
        </div>
      </div>
    </header>
  );
}
