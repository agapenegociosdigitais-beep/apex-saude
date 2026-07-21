import type { IndicadorConfig } from '@/lib/mock/perfis';
import {
  STATUS_LABEL,
  formatarMeta,
  formatarValor,
  progressoPercentual,
  type StatusIndicador,
} from '@/lib/mock/indicadores';

const STATUS_STYLES: Record<StatusIndicador, { badge: string; bar: string; dot: string }> = {
  otimo: {
    badge: 'bg-primary-fixed/50 text-on-primary-fixed',
    bar: 'bg-surface-tint',
    dot: 'bg-primary-fixed-dim',
  },
  regular: {
    badge: 'bg-secondary-fixed/60 text-on-secondary-fixed',
    bar: 'bg-secondary',
    dot: 'bg-secondary-container',
  },
  critico: {
    badge: 'bg-error-container text-on-error-container',
    bar: 'bg-error',
    dot: 'bg-error',
  },
};

interface IndicadorCardProps {
  indicador: IndicadorConfig;
  valor: number;
  status: StatusIndicador;
}

export function IndicadorCard({ indicador, valor, status }: IndicadorCardProps) {
  const styles = STATUS_STYLES[status];
  const pct = progressoPercentual(valor, indicador);

  return (
    <div className="bg-surface rounded-xl p-card-padding shadow-ambient border border-outline-variant/20 flex flex-col gap-4">
      <div className="flex justify-between items-center gap-2">
        <h4 className="font-title-lg text-title-lg text-on-surface">{indicador.nome}</h4>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded font-label-md text-[10px] ${styles.badge}`}>
            {STATUS_LABEL[status]}
          </span>
          <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
        </div>
      </div>
      <div>
        <span className="font-headline-lg text-headline-lg text-on-surface">
          {formatarValor(valor, indicador)}
        </span>
        <p className="font-label-md text-[11px] text-on-surface-variant mt-0.5">
          Meta {formatarMeta(indicador)} · Peso {indicador.peso}
          {indicador.invertido ? ' · menor é melhor' : ''}
        </p>
      </div>
      <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
