'use client'

import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { TelasGallerySection } from '@/components/landing/telas-gallery'

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-surface/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center gap-4 px-4 md:px-8 h-16 max-w-[1440px] mx-auto w-full">
          <BrandLogo size="md" href="/" priority />
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-semibold text-primary border-b-2 border-secondary pb-0.5" href="#solucoes">
              Soluções
            </a>
            <a className="text-sm text-on-surface-variant hover:text-secondary" href="#telas">
              Telas
            </a>
            <a className="text-sm text-on-surface-variant hover:text-secondary" href="#precos">
              Preços
            </a>
            <a className="text-sm text-on-surface-variant hover:text-secondary" href="#sobre">
              Sobre
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="text-sm font-semibold text-on-surface-variant hover:text-secondary px-2 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/painel"
              className="bg-primary text-on-primary px-4 sm:px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-container to-[#0b2b17] text-on-primary py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg leading-tight">
                Pare de perder repasses federais por falta de monitoramento.
              </h1>
              <p className="font-body-lg text-body-lg text-on-primary/80 max-w-xl">
                A plataforma de gestão definitiva para os 15 indicadores da APS
                (NT 6/2025).
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/painel"
                  className="bg-secondary text-on-primary px-8 py-4 rounded-lg font-title-lg text-title-lg hover:bg-secondary-container transition-colors shadow-md text-center"
                >
                  Ver demonstração
                </Link>
                <Link
                  href="/proposta"
                  className="bg-transparent border border-on-primary/30 text-on-primary px-8 py-4 rounded-lg font-title-lg text-title-lg hover:bg-on-primary/10 transition-colors text-center"
                >
                  Falar com consultor
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-[400px]">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 transform rotate-3 shadow-2xl">
                <div className="h-8 w-32 bg-white/20 rounded mb-6" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="h-24 bg-white/10 rounded-lg" />
                  <div className="h-24 bg-white/10 rounded-lg" />
                </div>
                <div className="h-32 bg-white/10 rounded-lg w-full" />
              </div>
              <div className="absolute inset-0 bg-secondary/10 backdrop-blur-md rounded-2xl border border-secondary/20 p-6 transform -rotate-2 translate-x-8 translate-y-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                      fontSize: 32,
                    }}
                  >
                    trending_up
                  </span>
                  <div className="h-6 w-24 bg-secondary/30 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-secondary/20 rounded w-full" />
                  <div className="h-4 bg-secondary/20 rounded w-5/6" />
                  <div className="h-4 bg-secondary/20 rounded w-4/6" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </section>

        {/* O Desafio Atual */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-surface" id="problema">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary">
                O Desafio Atual
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4">
                Sem monitoramento constante, os recursos escorrem pelos dedos.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-card-padding flex flex-col items-start hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  Repasse caindo sem você saber
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Atrasos na consolidação dos dados geram surpresas negativas no
                  fechamento financeiro.
                </p>
              </div>
              <div className="glass-card rounded-2xl p-card-padding flex flex-col items-start hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">visibility_off</span>
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  Indicadores no escuro
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Falta de visibilidade em tempo real impede correções de rota
                  durante o quadrimestre.
                </p>
              </div>
              <div className="glass-card rounded-2xl p-card-padding flex flex-col items-start hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">group_off</span>
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  Equipes desalinhadas
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Dificuldade em engajar os profissionais da ponta com metas
                  claras e tangíveis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-surface-container-low" id="solucoes">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary">
                Como Funciona
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4">
                Três passos simples para garantir o máximo de recursos.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-outline-variant z-0" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center mb-6 shadow-md border-4 border-surface-container-low">
                  <span className="material-symbols-outlined text-4xl">cable</span>
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  1. Conecta ao PEC
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Integração nativa e segura com o Prontuário Eletrônico do
                  Cidadão.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-secondary text-on-primary flex items-center justify-center mb-6 shadow-md border-4 border-surface-container-low">
                  <span className="material-symbols-outlined text-4xl">
                    calculate
                  </span>
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  2. Calcula notas
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Processamento inteligente baseado na NT 6/2025.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-6 shadow-md border-4 border-surface-container-low">
                  <span className="material-symbols-outlined text-4xl">
                    monetization_on
                  </span>
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  3. Projeta o repasse
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Previsão financeira clara para planejamento estratégico.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Telas — Thumbnail Carousel (screenshots ÁPEX) */}
        <TelasGallerySection />

        {/* Pricing */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-surface-container-lowest" id="precos">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary">
                Planos e Investimento
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4">
                Soluções dimensionadas para o seu município.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Essencial */}
              <div className="bg-surface rounded-2xl p-8 border border-outline-variant/30 shadow-sm">
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  Essencial
                </h3>
                <div className="font-headline-lg text-headline-lg text-primary mb-6">
                  R$ 197
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    /mês
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Dashboards Básicos',
                    'Atualização Mensal',
                    'Suporte por Email',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md"
                    >
                      <span className="material-symbols-outlined text-primary text-sm">
                        check
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/proposta"
                  className="block w-full py-3 rounded-lg border border-primary text-primary font-title-lg text-title-lg hover:bg-primary/5 transition-colors text-center"
                >
                  Assinar Essencial
                </Link>
              </div>

              {/* Profissional */}
              <div className="bg-primary text-on-primary rounded-2xl p-8 shadow-xl transform md:-translate-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-secondary text-secondary-container px-4 py-1 rounded-bl-lg font-label-md text-label-md">
                  Mais Escolhido
                </div>
                <h3 className="font-title-lg text-title-lg text-on-primary mb-2">
                  Profissional
                </h3>
                <div className="font-headline-lg text-headline-lg text-secondary mb-6">
                  R$ 497
                  <span className="font-body-md text-body-md text-on-primary/70">
                    /mês
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Todos os Indicadores (NT 6/2025)',
                    'Atualização Semanal',
                    'Simulador Financeiro',
                    'Suporte Prioritário',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-on-primary/90 font-body-md text-body-md"
                    >
                      <span className="material-symbols-outlined text-secondary text-sm">
                        check
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/proposta"
                  className="block w-full py-3 rounded-lg bg-secondary text-on-primary font-title-lg text-title-lg hover:bg-secondary-container transition-colors text-center"
                >
                  Assinar Profissional
                </Link>
              </div>

              {/* Municipal */}
              <div className="bg-surface rounded-2xl p-8 border border-outline-variant/30 shadow-sm relative">
                <div className="inline-block bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-md text-label-md mb-4 border border-outline-variant/50">
                  Inexigibilidade Art. 74
                </div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
                  Municipal
                </h3>
                <div className="font-headline-md text-headline-md text-primary mb-6">
                  Sob consulta
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Acesso Ilimitado de Usuários',
                    'Integração Direta com PEC',
                    'Consultoria Estratégica',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md"
                    >
                      <span className="material-symbols-outlined text-primary text-sm">
                        check
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/proposta"
                  className="block w-full py-3 rounded-lg border border-primary text-primary font-title-lg text-title-lg hover:bg-primary/5 transition-colors text-center"
                >
                  Falar com Consultor
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre (âncora do nav) */}
        <section className="py-16 px-4 md:px-8 bg-surface" id="sobre">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Sobre a ÁPEX Saúde</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Plataforma de gestão dos 15 indicadores oficiais da Atenção Primária à Saúde,
              alinhada à Nota Técnica 6/2025 (DEAPS/SAPS/MS). Conecta o PEC, calcula notas e
              projeta o repasse federal para secretarias e equipes da APS.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-primary w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 px-4 md:px-8 max-w-[1440px] mx-auto w-full">
          <BrandLogo size="md" href="/" onDark />
          <div className="flex flex-wrap justify-center gap-5 text-sm">
            <Link href="/privacidade" className="text-on-primary/70 hover:text-secondary-fixed">
              Privacidade
            </Link>
            <Link href="/proposta" className="text-on-primary/70 hover:text-secondary-fixed">
              Contato
            </Link>
            <Link href="/login" className="text-on-primary/70 hover:text-secondary-fixed">
              Entrar
            </Link>
          </div>
          <p className="text-sm text-on-primary/70">© 2026 ÁPEX Saúde. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
