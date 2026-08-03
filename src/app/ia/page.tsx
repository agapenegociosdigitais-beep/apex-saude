import { AppShell } from '@/components/app-shell'
import { equipeDoUsuario } from '@/lib/data/perfil'
import { IaClient } from './ia-client'

export const dynamic = 'force-dynamic'

export default async function IaPage() {
  const minhaEquipe = await equipeDoUsuario()
  return (
    <AppShell active="ia">
      <IaClient minhaEquipe={minhaEquipe} />
    </AppShell>
  )
}
