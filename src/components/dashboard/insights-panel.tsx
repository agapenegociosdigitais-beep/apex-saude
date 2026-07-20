'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';

interface Insight {
  tipo: 'elogio' | 'alerta' | 'conselho';
  texto: string;
  indicador?: string;
}

// Gera insights contextualizados por role
function gerarInsights(role: string, perfil: string, indicadores: { codigo: string; nome: string; valor: number; meta: number; invertido: boolean }[], equipe?: string, equipes?: any[]): Insight[] {
  const insights: Insight[] = [];

  if (role === 'profissional') {
    for (const ind of indicadores) {
      const pct = ind.invertido ? (ind.meta / Math.max(ind.valor, 1)) * 100 : (ind.valor / ind.meta) * 100;
      if (pct >= 100) {
        insights.push({ tipo: 'elogio', texto: `${ind.codigo} (${ind.nome}) está em ${Math.round(ind.valor)}% — ${ind.invertido ? 'abaixo' : 'acima'} da meta de ${ind.meta}%. Continue assim! 🎉`, indicador: ind.codigo });
      } else if (pct >= 80) {
        insights.push({ tipo: 'conselho', texto: `${ind.codigo} está próximo da meta (${Math.round(ind.valor)}% de ${ind.meta}%). Pequenas ações fazem diferença.`, indicador: ind.codigo });
      } else if (pct < 70) {
        insights.push({ tipo: 'alerta', texto: `⚠️ ${ind.codigo} está em ${Math.round(ind.valor)}% — bem abaixo da meta de ${ind.meta}%. Priorize este indicador!`, indicador: ind.codigo });
      }
    }
  }

  if (role === 'coordenador' || role === 'gestor') {
    if (equipes && equipes.length > 0) {
      const boas = equipes.filter((e: any) => (e.nota || 0) >= 7.5);
      const ruins = equipes.filter((e: any) => (e.nota || 0) < 6);

      if (boas.length > 0) {
        insights.push({ tipo: 'elogio', texto: `${boas.length} equipe(s) com classificação Ótimo: ${boas.map((e: any) => e.nome).join(', ')}. Parabéns pelo trabalho! 🏆` });
      }
      if (ruins.length > 0) {
        insights.push({ tipo: 'alerta', texto: `${ruins.length} equipe(s) em Regular: ${ruins.map((e: any) => e.nome).join(', ')}. Risco de perda de repasse. Intervenha!` });
      }
      insights.push({ tipo: 'conselho', texto: role === 'gestor' ? 'Agende reunião com coordenadores das UBS com equipes abaixo da meta. Foco em indicadores de peso 2.' : 'Faça reunião de equipe dia 8. Priorize os indicadores com peso maior.' });
    }
  }

  if (insights.length === 0) {
    insights.push({ tipo: 'conselho', texto: 'Aguardando dados para gerar insights. Assim que os indicadores forem preenchidos, você verá recomendações personalizadas aqui.' });
  }

  return insights;
}

export function InsightsPanel({ indicadores, equipes }: { indicadores: { codigo: string; nome: string; valor: number; meta: number; invertido: boolean }[], equipes?: any[] }) {
  const user = useUser();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    setInsights(gerarInsights(user.role, user.perfil_id, indicadores, user.nome, equipes));
  }, [user.role, user.perfil_id, indicadores, equipes]);

  if (insights.length === 0) return null;

  const cores = { elogio: 'border-emerald-300 bg-emerald-50', alerta: 'border-red-300 bg-red-50', conselho: 'border-blue-300 bg-blue-50' };
  const icons = { elogio: '🌟', alerta: '⚠️', conselho: '💡' };

  return (
    <div className="rounded-xl border border-apex-border bg-white p-6 shadow-sm mt-6">
      <h2 className="font-display text-lg font-semibold text-apex-ink mb-4">
        🧠 Análise para {user.role === 'profissional' ? 'você' : user.role === 'coordenador' ? 'sua UBS' : 'seu município'}
      </h2>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className={`rounded-lg border ${cores[ins.tipo]} p-3`}>
            <p className="text-sm">
              <span className="font-semibold">{icons[ins.tipo]}</span> {ins.texto}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {user.role === 'profissional' ? 'Baseado nos seus indicadores. Dados atualizados mensalmente.' : 'Baseado no desempenho das equipes. Atualizado após cada consolidação.'}
      </p>
    </div>
  );
}
