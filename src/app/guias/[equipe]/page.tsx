import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EQUIPES, EQUIPE_IDS, isEquipeId } from '@/lib/mock/equipes';
import { GUIAS } from '@/lib/mock/guias-content';
import { CheckListInterativa } from './checklist-interativa';

export function generateStaticParams() {
  return EQUIPE_IDS.map((equipe) => ({ equipe }));
}

export default async function GuiaEquipePage({ params }: { params: Promise<{ equipe: string }> }) {
  const { equipe } = await params;
  if (!isEquipeId(equipe)) notFound();
  const guia = GUIAS[equipe];
  const config = EQUIPES[equipe];

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-semibold">{guia.titulo}</h1>
        <p className="mt-3 leading-relaxed text-gray-600">{guia.introducao}</p>

        <div className="mt-8 space-y-6">
          {guia.indicadores.map((ind) => (
            <section key={ind.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="rounded-lg bg-apex-gold px-2 py-0.5 font-mono text-sm text-white">{ind.id}</span>
                O que é
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{ind.oQueE}</p>

              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Como melhorar</h3>
              <CheckListInterativa id={`${equipe}-${ind.id}`} itens={ind.comoMelhorar} />

              {/* Plano de ação sugerido */}
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">💡 Plano de ação sugerido para este mês</p>
                <p className="mt-1 text-sm text-blue-700">
                  {ind.id === 'C1' && 'Meta: aumentar acesso em 5% este mês. Foque em busca ativa de faltosos e registre TODOS os atendimentos.'}
                  {ind.id === 'C2' && 'Meta: completar puericultura das crianças que fazem 2 anos. Vincule ao calendário vacinal.'}
                  {ind.id === 'C3' && 'Meta: zero gestantes sem pré-natal. Capture no 1º trimestre via teste rápido.'}
                  {ind.id === 'C4' && 'Meta: HbA1c de todos os diabéticos atualizada. Priorize quem está há mais tempo sem exame.'}
                  {ind.id === 'C5' && 'Meta: PA aferida de todos os hipertensos. Aproveite as renovações de receita.'}
                  {ind.id === 'C6' && 'Meta: idosos com vacinação e caderneta atualizada. Faça busca ativa domiciliar.'}
                  {ind.id === 'C7' && 'Meta: zero mulheres sem colpocitologia/mamografia. Convoque por telefone + ACS.'}
                  {ind.id === 'B1' && 'Meta: aumentar primeiras consultas programadas. Reserve horários fixos na agenda.'}
                  {ind.id === 'B2' && 'Meta: concluir tratamentos abertos antes de abrir novos. Dê alta com orientação.'}
                  {ind.id === 'B3' && 'Meta: reduzir extrações. Toda extração precisa ser justificada e registrada.'}
                  {ind.id === 'B4' && 'Meta: captar gestantes para pré-natal odontológico. Integre com a equipe de enfermagem.'}
                  {ind.id === 'B5' && 'Meta: escovação supervisionada em escolas. Agende com a direção da escola.'}
                  {ind.id === 'B6' && 'Meta: fluoretação em todas as crianças atendidas. Registre cada aplicação.'}
                  {ind.id === 'M1' && 'Meta: registrar TODOS os atendimentos individuais e em grupo. Cada pessoa conta.'}
                  {ind.id === 'M2' && 'Meta: documentar ações interprofissionais. Matriciamento e PTS bem descritos contam mais.'}
                </p>
              </div>
            </section>
          ))}
        </div>

        <Link href={`/paineis/${equipe}`}
          className="mt-8 inline-block rounded-lg bg-apex-gold px-5 py-2.5 font-medium text-white hover:bg-amber-600">
          Ver painel {config.nome} →
        </Link>
      </main>
    </div>
  );
}
