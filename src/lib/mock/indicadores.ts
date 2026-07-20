import type { IndicadorConfig } from './perfis';

export type StatusIndicador = 'otimo' | 'regular' | 'critico';

export const STATUS_LABEL: Record<StatusIndicador, string> = {
  otimo: 'Ótimo', regular: 'Regular', critico: 'Crítico',
};

/** Hash determinístico para gerar variação mensal realista */
function hashStr(str: string): number {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h;
}

/**
 * Gera valor mock que varia por MÊS (YYYY-MM), simulando padrões reais:
 * - Janeiro: valores mais baixos (férias)
 * - Março-Maio: valores altos (campanhas)
 * - Dezembro: valores baixos (fim de ano)
 * - Variação de ±15% entre meses consecutivos
 */
export function valorMock(perfilId: string, ind: IndicadorConfig, mes?: string): number {
  const base = hashStr(`${perfilId}:${ind.id}`);
  const mesHash = mes ? hashStr(mes) : 0;

  // Tendência sazonal
  const mesNum = mes ? parseInt(mes.split('-')[1] || '1') : 7;
  const sazonal = Math.sin((mesNum - 1) * Math.PI / 6) * 8; // ±8% sazonal

  // Progresso gradual ao longo do ano (simula melhoria)
  const progresso = mes ? (hashStr(mes + ':prog') % 10) : 0;

  if (ind.escala10) return Math.round((5 + ((base + mesHash + sazonal) % 46) / 10 + progresso / 20) * 10) / 10;
  if (ind.invertido) return Math.max(3, Math.min(30, 5 + ((base + mesHash) % 26) - sazonal / 2));
  return Math.max(30, Math.min(98, 45 + ((base + mesHash) % 51) + sazonal + progresso));
}

/** Tendência do indicador nos últimos 3 meses */
export function tendencia(perfilId: string, ind: IndicadorConfig, mesAtual: string): 'subindo' | 'estavel' | 'caindo' {
  const atual = valorMock(perfilId, ind, mesAtual);
  const anterior = valorMock(perfilId, ind, mesAnterior(mesAtual));
  const diff = ind.invertido ? anterior - atual : atual - anterior;
  if (diff > 5) return 'subindo';
  if (diff < -5) return 'caindo';
  return 'estavel';
}

/** Ícone da tendência */
export function iconeTendencia(t: 'subindo' | 'estavel' | 'caindo', invertido: boolean): string {
  if (invertido) return t === 'subindo' ? '🔴' : t === 'caindo' ? '🟢' : '➡️';
  return t === 'subindo' ? '🟢' : t === 'caindo' ? '🔴' : '➡️';
}

/** Gera array dos últimos N meses no formato YYYY-MM */
export function ultimosMeses(n: number): string[] {
  const hoje = new Date();
  const meses: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}

function mesAnterior(mes: string): string {
  const [a, m] = mes.split('-').map(Number);
  if (m === 1) return `${a - 1}-12`;
  return `${a}-${String(m - 1).padStart(2, '0')}`;
}

export function statusDoIndicador(valor: number, ind: IndicadorConfig): StatusIndicador {
  const ratio = ind.invertido ? ind.meta / Math.max(valor, 1) : valor / ind.meta;
  if (ratio >= 1) return 'otimo';
  if (ratio >= 0.7) return 'regular';
  return 'critico';
}

export function progressoPercentual(valor: number, ind: IndicadorConfig): number {
  const base = ind.escala10 ? 10 : 100;
  return Math.min(100, Math.round((valor / base) * 100));
}

export function formatarValor(valor: number, ind: IndicadorConfig): string {
  if (ind.escala10) return valor.toFixed(1).replace('.', ',');
  return `${Math.round(valor)}%`;
}

export function formatarMeta(ind: IndicadorConfig): string {
  if (ind.escala10) return ind.meta.toFixed(1).replace('.', ',');
  return `${ind.meta}%`;
}

/** Gera dica contextual baseada no status e tendência do indicador */
export function dicaIndicador(codigo: string, valor: number, meta: number, status: StatusIndicador, trend: 'subindo' | 'estavel' | 'caindo', invertido: boolean): string {
  const pct = Math.round(valor);
  const nomes: Record<string, string> = {
    C1:'Acesso',C2:'Desenvolvimento infantil',C3:'Gestação e puerpério',C4:'Diabetes (HbA1c)',C5:'Hipertensão (PA)',C6:'Pessoa idosa',C7:'Prevenção do câncer',
    B1:'1ª consulta odontológica',B2:'Tratamento concluído',B3:'Taxa de exodontia',B4:'Gestantes odontológico',B5:'Escovação supervisionada',B6:'Fluoretação',
    M1:'Atendimentos',M2:'Ações interprofissionais',CAD:'Cadastro',ACOMP:'Acompanhamento',
  };
  const nome = nomes[codigo] || codigo;
  if (status === 'otimo') return `✅ ${nome}: ${pct}% — acima da meta de ${meta}%. Continue assim!`;
  if (status === 'regular') return `⚠️ ${nome}: ${pct}% — próximo da meta. ${trend==='caindo'?'Cuidado: tendência de queda. ':''}${trend==='subindo'?'Está melhorando! ':''}Mantenha o foco.`;
  return `🔴 ${nome}: ${pct}% — abaixo da meta (${meta}%). ${trend==='subindo'?'Está subindo — continue! ':'Priorize este indicador. '}Verifique o checklist.`;
}
