import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-outline-variant/40 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <BrandLogo size="md" href="/" />
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
          Política de Privacidade e LGPD
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">Última atualização: julho de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="text-lg font-semibold text-on-surface">1. Dados que tratamos</h2>
            <p className="mt-2">
              O ÁPEX Saúde trata exclusivamente <strong>dados agregados de indicadores</strong> da
              Atenção Primária à Saúde. Não exibimos nem armazenamos dados pessoais de pacientes
              identificáveis. Dos usuários: nome, e-mail institucional, perfil e município.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface">2. Base legal</h2>
            <p className="mt-2">
              Execução de políticas públicas (Art. 7º, III e Art. 11, II, a, da Lei 13.709/2018 —
              LGPD), no contexto da gestão dos indicadores da NT 6/2025 - DEAPS/SAPS/MS.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface">3. Segurança</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Isolamento por município (Row Level Security)</li>
              <li>Acesso autenticado</li>
              <li>Credenciais de integração criptografadas</li>
              <li>Tráfego TLS</li>
              <li>Auditoria de operações sensíveis</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface">4. Direitos do titular</h2>
            <p className="mt-2">
              Usuários podem solicitar acesso, correção ou exclusão de dados cadastrais pelo e-mail
              do encarregado (DPO) do município contratante.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-on-surface">5. Retenção</h2>
            <p className="mt-2">
              Indicadores históricos são mantidos enquanto durar o contrato. Ao término, exportados
              ao município e removidos em até 90 dias.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
