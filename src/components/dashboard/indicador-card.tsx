import type { IndicadorConfig } from '@/lib/mock/perfis';
import {
  STATUS_LABEL,
  formatarMeta,
  formatarValor,
  progressoPercentual,
  type StatusIndicador,
} from '@/lib/mock/indicadores';

const STATUS_STYLES: Record<StatusIndicador, { badge: string; bar: string }> = {
  otimo: { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  regular: { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  critico: { badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
};

interface IndicadorCardProps {
  indicador: IndicadorConfig;
  valor: number;
  status: StatusIndicador;
}

export function IndicadorCard({ indicador, valor, status }: IndicadorCardProps) {
  const styles = STATUS_STYLES[status];

  return (
    <div className="rounded-xl border border-apex-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-apex-ink">{indicador.nome}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl text-apex-ink">{formatarValor(valor, indicador)}</p>
      <p className="mt-1 text-sm text-apex-muted">
        Meta {formatarMeta(indicador)} · Peso {indicador.peso}
        {indicador.invertido ? ' · menor é melhor' : ''}
      </p>
      <div className="mt-3 h-2 rounded-full bg-apex-surface">
        <div
          className={`h-2 rounded-full ${styles.bar}`}
          style={{ width: `${progressoPercentual(valor, indicador)}%` }}
        />
      </div>
    </div>
  );
}
