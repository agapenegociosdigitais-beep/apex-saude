import { AppShell } from '@/components/app-shell'
import { equipesReaisPorTipo } from '@/lib/data/equipes'
import { SimuladorClient } from './simulador-client'

export const dynamic = 'force-dynamic'

function classificacaoLabel(nota: number): string {
  if (nota >= 8.5) return 'Ótimo'
  if (nota >= 7) return 'Bom'
  if (nota >= 5) return 'Suficiente'
  return 'Regular'
}

export default async function SimuladorPage() {
  // Buscar contagens reais de equipes por tipo
  const [esfs, esbs, emultis] = await Promise.all([
    equipesReaisPorTipo('esf'),
    equipesReaisPorTipo('esb'),
    equipesReaisPorTipo('emulti'),
  ])

  const equipesReais = { esf: esfs.length, esb: esbs.length, emulti: emultis.length }
  const todas = [...esfs, ...esbs, ...emultis]
  const notaMedia = todas.length > 0
    ? Math.round((todas.reduce((s, e) => s + e.nota, 0) / todas.length) * 10) / 10
    : null
  const classificacaoAtual = notaMedia !== null ? classificacaoLabel(notaMedia) : 'Suficiente'

  return (
    <AppShell active="simulador">
      <SimuladorClient
        equipesReais={equipesReais}
        notaMedia={notaMedia}
        classificacaoAtual={classificacaoAtual}
      />
    </AppShell>
  )
}
