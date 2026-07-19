import Image from 'next/image';
import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/brand/logo-icon.png" alt="ÁPEX" width={32} height={32} className="rounded" />
        <span className="font-display text-lg font-semibold text-apex-ink">ÁPEX Saúde</span>
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold text-apex-ink">
        Política de Privacidade e LGPD
      </h1>
      <p className="mt-2 text-sm text-apex-muted">Última atualização: julho de 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-apex-text">
        <section>
          <h2 className="font-display text-xl font-semibold text-apex-ink">1. Dados que tratamos</h2>
          <p className="mt-2">
            O ÁPEX Saúde trata exclusivamente <strong>dados agregados de indicadores</strong> da
            Atenção Primária à Saúde (quantidades e percentuais por equipe). Não exibimos nem
            armazenamos dados pessoais de pacientes identificáveis. Dos usuários do sistema
            (profissionais e gestores), tratamos apenas: nome, e-mail institucional, perfil e município.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-apex-ink">2. Base legal</h2>
          <p className="mt-2">
            Execução de políticas públicas (Art. 7º, III e Art. 11, II, a, da Lei 13.709/2018 —
            LGPD), no contexto da gestão dos indicadores da NT 6/2025 - DEAPS/SAPS/MS.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-apex-ink">3. Segurança</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Isolamento por município garantido no banco (Row Level Security)</li>
            <li>Acesso autenticado via link mágico, sem senhas armazenadas</li>
            <li>Credenciais de integração (PEC) criptografadas e nunca expostas em APIs</li>
            <li>Tráfego integralmente criptografado (TLS)</li>
            <li>Auditoria de operações sensíveis (sincronizações e alterações)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-apex-ink">4. Direitos do titular</h2>
          <p className="mt-2">
            Usuários podem solicitar acesso, correção ou exclusão de seus dados cadastrais a
            qualquer momento pelo e-mail do encarregado (DPO) indicado pelo município contratante.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-apex-ink">5. Retenção</h2>
          <p className="mt-2">
            Indicadores históricos são mantidos para análise de séries temporais enquanto durar o
            contrato com o município. Ao término, os dados são exportados ao município e removidos
            em até 90 dias.
          </p>
        </section>
      </div>
    </main>
  );
}
