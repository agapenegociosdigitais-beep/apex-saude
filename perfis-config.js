/**
 * PERFIS-CONFIG.JS
 *
 * Arquivo único compartilhado entre dashboard-profissional.html e ia-profissional.html
 * Define: indicadores, métricas, checklist, alertas e impacto de cada um dos 12 perfis
 *
 * Data: 16 de abril de 2026
 * Status: Fonte de verdade única sobre os perfis
 */

const PERFIS_CONFIG = {
  // ════════════════════════════════════════════════════════════
  // GRUPO eSF/eAP — 4 PERFIS
  // ════════════════════════════════════════════════════════════

  medico: {
    nome: 'Médico',
    equipe: 'eSF / eAP',
    icon: '👨‍⚕️',

    // Indicadores para IA (mesmos que perfilConfigs + perfisData)
    indicadores: [
      { id: 'C4', nome: 'C4 – Diabetes', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C5', nome: 'C5 – Hipertensão', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C6', nome: 'C6 – Pessoa Idosa', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C7', nome: 'C7 – Prevenção do Câncer', peso: 2, meta: 75, invertido: false, escala10: false }
    ],

    // Métricas que dashboard gerencia
    metricas: { c4: 0, c5: 0, c6: 0, c7: 0 },

    // Checklist
    checklist: [
      'Verificar lista de diabéticos sem HbA1c',
      'Revisar hipertensos sem PA registrada',
      'Conferir idosos sem vacinação atualizada',
      'Organizar convocação para colpocitologia/mamografia'
    ],

    // Impacto contextualizado
    impacto: 'Seus <strong>indicadores de crônicos (C4, C5, C6, C7)</strong> definem 60% da nota da equipe eSF. C7 com Peso 2 é crítico — uma mulher sem colpo/mamografia pode zerar sua contribuição por 60 meses.',

    // Links
    links: [
      { label: 'Painel eSF/eAP', url: 'painel-esf.html' },
      { label: 'Guia de Indicadores', url: 'guia-esf.html' }
    ]
  },

  enfermeiro: {
    nome: 'Enfermeiro',
    equipe: 'eSF / eAP',
    icon: '👩‍⚕️',
    indicadores: [
      { id: 'C1', nome: 'C1 – Acesso', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C2', nome: 'C2 – Desenvolvimento Infantil', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'C3', nome: 'C3 – Gestação e Puerpério', peso: 2, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { c2: 0, c3: 0, c1: 0, comp2: 0 },
    checklist: [
      'Revisar lista de gestantes sem consultas',
      'Verificar puérperas até 42 dias acompanhadas',
      'Conferir crianças completando 2 anos',
      'Registrar citopatológicos no período'
    ],
    impacto: 'Você é <strong>responsável por C2 e C3 (Peso 2 cada)</strong> — gestação, puericultura e puerpério são eixos que definem a classificação. Sem sua ação, a equipe não sai do Suficiente.',
    links: [
      { label: 'Painel eSF/eAP', url: 'painel-esf.html' },
      { label: 'Guia de C2/C3', url: 'guia-esf.html' }
    ]
  },

  tecnico: {
    nome: 'Técnico de Enfermagem',
    equipe: 'eSF / eAP',
    icon: '🩺',
    indicadores: [
      { id: 'C4', nome: 'C4 – Diabetes (Glicemia)', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C5', nome: 'C5 – Hipertensão (PA)', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C6', nome: 'C6 – Idoso (Vacinação)', peso: 1, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { pa: 0, glicemia: 0, vacina: 0, pendentes: 0 },
    checklist: [
      'Registrar HOJE os procedimentos de hoje',
      'Revisar PA de todos os hipertensos do dia',
      'Aplicar vacinas conforme rotina',
      'Conferir registros de glicemia'
    ],
    impacto: 'Você <strong>alimenta os indicadores</strong> que o médico calcula. Sem seu registro diário, não há dados. A regra é: <strong>procedimento feito sem registro = ZERO</strong>.',
    links: [
      { label: 'Painel eSF/eAP', url: 'painel-esf.html' }
    ]
  },

  acs: {
    nome: 'ACS',
    equipe: 'eSF / eAP',
    icon: '🏘️',
    indicadores: [
      { id: 'CAD', nome: 'Dimensão Cadastro', peso: 1, meta: 85, invertido: false, escala10: false },
      { id: 'ACOMP', nome: 'Dimensão Acompanhamento', peso: 1, meta: 85, invertido: false, escala10: false },
      { id: 'C1', nome: 'C1 – Acesso (Busca Ativa)', peso: 1, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { visitas: 0, cadastros: 0, faltosos: 0, sync: 0 },
    checklist: [
      'Registrar visita ANTES de sair de campo',
      'Atualizar cadastros de famílias visitadas',
      'Identificar faltosos para busca ativa',
      'Sincronizar app ao chegar na UBS'
    ],
    impacto: 'Você é o <strong>elo entre a comunidade e a UBS</strong>. Seus cadastros e acompanhamentos alimentam todos os indicadores. Tentativa de visita também conta — registre tudo.',
    links: [
      { label: 'Painel eSF/eAP', url: 'painel-esf.html' }
    ]
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO eMulti — 5 PERFIS
  // ════════════════════════════════════════════════════════════

  psicologo: {
    nome: 'Psicólogo',
    equipe: 'eMulti',
    icon: '🧠',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos por Pessoa', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Interprofissionais', peso: 4, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { m1: 0, m2: 0 },
    checklist: [
      'Registrar cada atendimento individual',
      'Documentar PTS (Plano Terapêutico Singular)',
      'Matriciar casos com médico/enfermeiro',
      'Realizar grupos (cada participante = 1 atendimento)'
    ],
    impacto: 'Você contribui com <strong>M1 (Peso 6) e M2 (Peso 4)</strong> — sendo M1 a maior parte. PTS bem documentada = alta valor M2. Grupos ampliam significativamente M1.',
    links: [
      { label: 'Painel eMulti', url: 'painel-emulti.html' }
    ]
  },

  fisio: {
    nome: 'Fisioterapeuta',
    equipe: 'eMulti',
    icon: '🏃',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos por Pessoa', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Conjuntas', peso: 4, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { m1: 0, m2: 0 },
    checklist: [
      'Registrar atendimentos individuais',
      'Organizar grupos de reabilitação (amplificador de M1)',
      'Realizar visitas domiciliares',
      'Documentar atendimentos compartilhados'
    ],
    impacto: 'Você <strong>multiplica M1 com grupos de reabilitação</strong> — 20 pessoas em 1 grupo = 20 atendimentos. M2 por ações interprofissionais documentadas.',
    links: [
      { label: 'Painel eMulti', url: 'painel-emulti.html' }
    ]
  },

  nutricionista: {
    nome: 'Nutricionista',
    equipe: 'eMulti',
    icon: '🥗',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos/Grupos', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Interprofissionais', peso: 4, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { m1: 0, m2: 0 },
    checklist: [
      'Registrar consultas nutricionais',
      'Organizar grupos de alimentação',
      'Acompanhar gestantes (pré-natal nutricional)',
      'Documentar ações com médico para diabéticos/hipertensos'
    ],
    impacto: 'Você contribui para <strong>M1 e M2</strong> e impacta indiretamente <strong>C4 e C5</strong> ao melhorar adesão de diabéticos e hipertensos. Cada membro em grupo = 1 atendimento M1.',
    links: [
      { label: 'Painel eMulti', url: 'painel-emulti.html' }
    ]
  },

  assistente: {
    nome: 'Assistente Social',
    equipe: 'eMulti',
    icon: '🤝',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos Individuais', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Intersetoriais', peso: 4, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { m1: 0, m2: 0 },
    checklist: [
      'Registrar atendimentos individuais',
      'Articular com CRAS e CREAS',
      'Participar de reuniões de rede',
      'Encaminhar famílias vulneráveis'
    ],
    impacto: 'Você é <strong>guardião das ações intersetoriais (M2)</strong> — cada articulação documentada com CRAS, CREAS ou escolas conta. Isso representa 40% da sua nota.',
    links: [
      { label: 'Painel eMulti', url: 'painel-emulti.html' }
    ]
  },

  farmaceutico: {
    nome: 'Farmacêutico',
    equipe: 'eMulti',
    icon: '💊',
    indicadores: [
      { id: 'M1', nome: 'M1 – Consultas Farmacêuticas', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Discussões de Caso', peso: 4, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { m1: 0, m2: 0 },
    checklist: [
      'Registrar consultas farmacêuticas',
      'Revisar polifarmácia em idosos',
      'Discutir prescrições com médico',
      'Organizar grupos de uso racional'
    ],
    impacto: 'Você contribui para <strong>M1 e M2</strong> e impacta <strong>C4 e C5</strong> ao melhorar adesão de diabéticos e hipertensos. Discussões com médico bem documentadas = alto M2.',
    links: [
      { label: 'Painel eMulti', url: 'painel-emulti.html' }
    ]
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO eSB — 1 PERFIL
  // ════════════════════════════════════════════════════════════

  dentista: {
    nome: 'Dentista',
    equipe: 'eSB',
    icon: '🦷',
    indicadores: [
      { id: 'B1', nome: 'B1 – 1ª Consulta Programada', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'B2', nome: 'B2 – Tratamento Concluído', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'B3', nome: 'B3 – Taxa de Exodontia', peso: 2, meta: 25, invertido: true, escala10: false },
      { id: 'B4', nome: 'B4 – Procedimentos Preventivos', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'B5', nome: 'B5 – Escovação Supervisionada', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'B6', nome: 'B6 – TRA', peso: 1, meta: 75, invertido: false, escala10: false }
    ],
    metricas: { b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, b6: 0 },
    checklist: [
      'Revisar taxa de extração (meta: abaixo de 15%)',
      'Aumentar primeiras consultas programadas',
      'Dar conclusão a tratamentos em aberto',
      'Realizar escovação supervisionada em escolas',
      'Aplicar fluoreto em crianças'
    ],
    impacto: 'Seus <strong>indicadores B1-B6</strong> definem toda a nota eSB. <strong>B3 (Taxa de extração) é invertido</strong> — MENOR é melhor. Uma alta taxa de extração pode zerar B3.',
    links: [
      { label: 'Painel eSB', url: 'painel-esb.html' },
      { label: 'Guia eSB', url: 'guia-esb.html' }
    ]
  },

  // ════════════════════════════════════════════════════════════
  // GRUPO GESTÃO — 2 PERFIS
  // ════════════════════════════════════════════════════════════

  coordenador: {
    nome: 'Coordenador de UBS',
    equipe: 'Gestão',
    icon: '📋',
    indicadores: [
      { id: 'C3', nome: 'Nota C3 (0-10)', peso: 1, meta: 7.5, invertido: false, escala10: true },
      { id: 'C2', nome: 'Nota C2 (0-10)', peso: 1, meta: 8.5, invertido: false, escala10: true }
    ],
    metricas: { c2: 0, c3: 0, equipes: 0 },
    checklist: [
      'Cobrar registros de profissionais (dias 1-5)',
      'Consolidar dados no sistema (dias 6-8)',
      'Reunião de equipe para revisar indicadores (dia 8)',
      'Enviar ao Siaps até dia 10 — IMPRORROGÁVEL'
    ],
    impacto: 'Você é o <strong>guardião do prazo e da integridade dos dados</strong>. Um envio atrasado ao Siaps zera aquele mês. Uma reunião de equipe no dia 8 é o que mais protege a nota.',
    links: [
      { label: 'Painel eMulti', url: 'painel-emulti.html' },
      { label: 'Painel eSF/eAP', url: 'painel-esf.html' },
      { label: 'Painel eSB', url: 'painel-esb.html' },
      { label: 'Dashboard Gerencial', url: 'gerencial.html' }
    ]
  },

  gestor: {
    nome: 'Gestor Municipal',
    equipe: 'Secretaria de Saúde',
    icon: '🏛️',
    indicadores: [
      { id: 'MED_C3', nome: 'Média C3 do município (0-10)', peso: 1, meta: 7.5, invertido: false, escala10: true },
      { id: 'MED_C2', nome: 'Média C2 do município (0-10)', peso: 1, meta: 8.5, invertido: false, escala10: true }
    ],
    metricas: { totalEquipes: 0, otimo: 0, regular: 0, repasse: 0 },
    checklist: [
      'Revisar notas de todas as equipes mensalmente',
      'Identificar equipes em Regular e acionar',
      'Confirmar envio ao Siaps de TODAS (até dia 10)',
      'Calcular repasse e informar ao financeiro',
      'Apresentar evolução em reunião de gestão'
    ],
    impacto: 'Sua <strong>visão consolidada protege o repasse financeiro do município</strong>. Uma equipe em Regular perde até 75% do incentivo federal — sua intervenção a tempo vale muito.',
    links: [
      { label: 'Dashboard Gerencial', url: 'gerencial.html' },
      { label: 'Painel Admin', url: 'admin.html' }
    ]
  }
};

// ════════════════════════════════════════════════════════════
// FUNÇÃO HELPER: Obter apenas indicadores para IA
// ════════════════════════════════════════════════════════════
function getIndicadoresIA(perfilId) {
  const perfil = PERFIS_CONFIG[perfilId];
  return perfil ? perfil.indicadores : [];
}

// ════════════════════════════════════════════════════════════
// FUNÇÃO HELPER: Obter apenas métricas para dashboard
// ════════════════════════════════════════════════════════════
function getMetricasDashboard(perfilId) {
  const perfil = PERFIS_CONFIG[perfilId];
  return perfil ? perfil.metricas : {};
}

// ════════════════════════════════════════════════════════════
// FUNÇÃO HELPER: Carregar métricas do localStorage
// ════════════════════════════════════════════════════════════
function carregarMetricasDoLocalStorage(perfilId) {
  const key = `apex_dash_${perfilId}_metricas`;
  const padroes = getMetricasDashboard(perfilId);
  const salvo = localStorage.getItem(key);
  return salvo ? JSON.parse(salvo) : padroes;
}

// ════════════════════════════════════════════════════════════
// FUNÇÃO HELPER: Obter produção acumulada dos últimos N dias
// ════════════════════════════════════════════════════════════
function obterProducaoAcumulada(perfilId, dias = 90) {
  const hoje = new Date();
  const acumulado = {};
  const perfil = PERFIS_CONFIG[perfilId];

  // Inicializar com zero
  Object.keys(perfil.metricas).forEach(k => acumulado[k] = 0);

  // Somar os últimos N dias
  for (let i = 0; i < dias; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const key = `apex_prod_${perfilId}_${dateKey}`;
    const prod = localStorage.getItem(key);
    if (prod) {
      const dados = JSON.parse(prod);
      Object.keys(dados).forEach(k => {
        if (acumulado.hasOwnProperty(k)) {
          acumulado[k] += parseFloat(dados[k]) || 0;
        }
      });
    }
  }

  return acumulado;
}

// ════════════════════════════════════════════════════════════
// FUNÇÃO HELPER: Calcular 3 últimos meses de produção acumulada
// ════════════════════════════════════════════════════════════
function obterUltimos3Meses(perfilId) {
  const hoje = new Date();
  const meses = [];

  for (let i = 2; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const proximoMes = new Date(data.getFullYear(), data.getMonth() + 1, 1);
    const ultimoDiaMes = new Date(proximoMes.getTime() - 1);

    const acumulado = {};
    const perfil = PERFIS_CONFIG[perfilId];
    Object.keys(perfil.metricas).forEach(k => acumulado[k] = 0);

    // Somar todos os dias do mês
    for (let d = new Date(data); d <= ultimoDiaMes; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d).toISOString().split('T')[0];
      const key = `apex_prod_${perfilId}_${dateKey}`;
      const prod = localStorage.getItem(key);
      if (prod) {
        const dados = JSON.parse(prod);
        Object.keys(dados).forEach(k => {
          if (acumulado.hasOwnProperty(k)) {
            acumulado[k] += parseFloat(dados[k]) || 0;
          }
        });
      }
    }

    meses.push({
      mes: data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      mesIndex: data.getMonth(),
      acumulado
    });
  }

  return meses;
}
