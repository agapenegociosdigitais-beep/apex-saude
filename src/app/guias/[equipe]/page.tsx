import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { EQUIPES, EQUIPE_IDS, isEquipeId } from '@/lib/mock/equipes'
import { GUIAS } from '@/lib/mock/guias-content'
import { CheckListInterativa } from './checklist-interativa'

export function generateStaticParams() {
  return EQUIPE_IDS.map((equipe) => ({ equipe }))
}

const PLANOS: Record<string, string> = {
  C1: 'Meta: aumentar acesso em 5% este mês. Foque em busca ativa de faltosos e registre TODOS os atendimentos.',
  C2: 'Meta: completar puericultura das crianças que fazem 2 anos. Vincule ao calendário vacinal.',
  C3: 'Meta: zero gestantes sem pré-natal. Capture no 1º trimestre via teste rápido.',
  C4: 'Meta: HbA1c de todos os diabéticos atualizada. Priorize quem está há mais tempo sem exame.',
  C5: 'Meta: PA aferida de todos os hipertensos. Aproveite as renovações de receita.',
  C6: 'Meta: idosos com vacinação e caderneta atualizada. Faça busca ativa domiciliar.',
  C7: 'Meta: zero mulheres sem colpocitologia/mamografia. Convoque por telefone + ACS.',
  B1: 'Meta: aumentar primeiras consultas programadas. Reserve horários fixos na agenda.',
  B2: 'Meta: concluir tratamentos abertos antes de abrir novos. Dê alta com orientação.',
  B3: 'Meta: reduzir extrações. Toda extração precisa ser justificada e registrada.',
  B4: 'Meta: captar gestantes para pré-natal odontológico. Integre com a equipe de enfermagem.',
  B5: 'Meta: escovação supervisionada em escolas. Agende com a direção da escola.',
  B6: 'Meta: fluoretação em todas as crianças atendidas. Registre cada aplicação.',
  M1: 'Meta: registrar TODOS os atendimentos individuais e em grupo. Cada pessoa conta.',
  M2: 'Meta: documentar ações interprofissionais. Matriciamento e PTS bem descritos contam mais.',
}

export default async function GuiaEquipePage({ params }: { params: Promise<{ equipe: string }> }) {
  const { equipe } = await params
  if (!isEquipeId(equipe)) notFound()
  const guia = GUIAS[equipe]
  const config = EQUIPES[equipe]

  return (
    <AppShell active="painel">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">{guia.titulo}</h1>
        <p className="mt-2 text-on-surface-variant leading-relaxed max-w-3xl">{guia.introducao} <Link href={`/paineis/${equipe}`} className="text-primary underline">Ver dados reais (Fase 2) →</Link></p>
      </header>

      <div className="space-y-5 max-w-3xl">
        {guia.indicadores.map((ind) => (
          <section
            key={ind.id}
            className="rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-ambient"
          >
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-on-surface">
              <span className="rounded-lg bg-secondary text-on-secondary px-2 py-0.5 font-mono text-sm">
                {ind.id}
              </span>
              O que é
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{ind.oQueE}</p>

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Como melhorar
            </h3>
            <CheckListInterativa id={`${equipe}-${ind.id}`} itens={ind.comoMelhorar} />

            {PLANOS[ind.id] && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary-fixed/20 p-4">
                <p className="text-sm font-semibold text-primary">Plano de ação sugerido</p>
                <p className="mt-1 text-sm text-on-surface-variant">{PLANOS[ind.id]}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <Link
        href={`/paineis/${equipe}`}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-container transition-colors"
      >
        Ver painel {config.nome}
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </Link>
    </AppShell>
  )
}
