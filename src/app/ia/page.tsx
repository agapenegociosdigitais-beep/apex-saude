import { AppShell } from '@/components/app-shell'
import { valoresReaisDoUsuario } from '@/lib/data/dashboard'
import { IaClient } from './ia-client'

export const dynamic = 'force-dynamic'

export default async function IaPage() {
  const dados = await valoresReaisDoUsuario()

  const valorMap: Record<string, number> | null = dados
    ? Object.fromEntries(dados.valores.map(v => [v.codigo, v.valor]))
    : null

  return (
    <AppShell active="ia">
      <IaClient
        equipeNome={dados?.equipeNome ?? null}
        municipioNome={dados?.municipioNome ?? null}
        nota={dados?.nota ?? null}
        valoresReais={valorMap}
      />
    </AppShell>
  )
}
