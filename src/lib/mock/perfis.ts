/**
 * PERFIS — fonte de verdade dos 12 perfis SUS.
 * Portado de apex-saude/perfis-config.js (16/04/2026) para TypeScript tipado.
 * Tags HTML removidas dos textos de impacto (React renderiza texto puro).
 */

export interface IndicadorConfig {
  id: string;
  nome: string;
  peso: number;
  meta: number;
  /** true = menor é melhor (ex.: B3 Taxa de Exodontia) */
  invertido: boolean;
  /** true = nota de 0 a 10 em vez de percentual */
  escala10: boolean;
}

export interface PerfilLink {
  label: string;
  url: string;
}

export interface PerfilConfig {
  nome: string;
  equipe: string;
  icon: string;
  indicadores: IndicadorConfig[];
  checklist: string[];
  impacto: string;
  links: PerfilLink[];
}

export const PERFIS = {
  // ═══════════ GRUPO eSF/eAP — 4 PERFIS ═══════════
  medico: {
    nome: 'Médico',
    equipe: 'eSF / eAP',
    icon: '👨‍⚕️',
    indicadores: [
      { id: 'C4', nome: 'C4 – Diabetes', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C5', nome: 'C5 – Hipertensão', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C6', nome: 'C6 – Pessoa Idosa', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C7', nome: 'C7 – Prevenção do Câncer', peso: 2, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Verificar lista de diabéticos sem HbA1c',
      'Revisar hipertensos sem PA registrada',
      'Conferir idosos sem vacinação atualizada',
      'Organizar convocação para colpocitologia/mamografia',
    ],
    impacto:
      'Seus indicadores de crônicos (C4, C5, C6, C7) definem 60% da nota da equipe eSF. C7 com Peso 2 é crítico — uma mulher sem colpo/mamografia pode zerar sua contribuição por 60 meses.',
    links: [
      { label: 'Painel eSF/eAP', url: '/paineis/esf' },
      { label: 'Guia de Indicadores', url: '/guias/esf' },
    ],
  },
  enfermeiro: {
    nome: 'Enfermeiro',
    equipe: 'eSF / eAP',
    icon: '👩‍⚕️',
    indicadores: [
      { id: 'C1', nome: 'C1 – Acesso', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C2', nome: 'C2 – Desenvolvimento Infantil', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'C3', nome: 'C3 – Gestação e Puerpério', peso: 2, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Revisar lista de gestantes sem consultas',
      'Verificar puérperas até 42 dias acompanhadas',
      'Conferir crianças completando 2 anos',
      'Registrar citopatológicos no período',
    ],
    impacto:
      'Você é responsável por C2 e C3 (Peso 2 cada) — gestação, puericultura e puerpério são eixos que definem a classificação. Sem sua ação, a equipe não sai do Suficiente.',
    links: [
      { label: 'Painel eSF/eAP', url: '/paineis/esf' },
      { label: 'Guia de C2/C3', url: '/guias/esf' },
    ],
  },
  tecnico: {
    nome: 'Técnico de Enfermagem',
    equipe: 'eSF / eAP',
    icon: '🩺',
    indicadores: [
      { id: 'C4', nome: 'C4 – Diabetes (Glicemia)', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C5', nome: 'C5 – Hipertensão (PA)', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C6', nome: 'C6 – Idoso (Vacinação)', peso: 1, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar HOJE os procedimentos de hoje',
      'Revisar PA de todos os hipertensos do dia',
      'Aplicar vacinas conforme rotina',
      'Conferir registros de glicemia',
    ],
    impacto:
      'Você alimenta os indicadores que o médico calcula. Sem seu registro diário, não há dados. A regra é: procedimento feito sem registro = ZERO.',
    links: [{ label: 'Painel eSF/eAP', url: '/paineis/esf' }],
  },
  acs: {
    nome: 'ACS',
    equipe: 'eSF / eAP',
    icon: '🏘️',
    indicadores: [
      { id: 'CAD', nome: 'Dimensão Cadastro', peso: 1, meta: 85, invertido: false, escala10: false },
      { id: 'ACOMP', nome: 'Dimensão Acompanhamento', peso: 1, meta: 85, invertido: false, escala10: false },
      { id: 'C1', nome: 'C1 – Acesso (Busca Ativa)', peso: 1, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar visita ANTES de sair de campo',
      'Atualizar cadastros de famílias visitadas',
      'Identificar faltosos para busca ativa',
      'Sincronizar app ao chegar na UBS',
    ],
    impacto:
      'Você é o elo entre a comunidade e a UBS. Seus cadastros e acompanhamentos alimentam todos os indicadores. Tentativa de visita também conta — registre tudo.',
    links: [{ label: 'Painel eSF/eAP', url: '/paineis/esf' }],
  },

  // ═══════════ GRUPO eMulti — 5 PERFIS ═══════════
  psicologo: {
    nome: 'Psicólogo',
    equipe: 'eMulti',
    icon: '🧠',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos por Pessoa', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Interprofissionais', peso: 4, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar cada atendimento individual',
      'Documentar PTS (Plano Terapêutico Singular)',
      'Matriciar casos com médico/enfermeiro',
      'Realizar grupos (cada participante = 1 atendimento)',
    ],
    impacto:
      'Você contribui com M1 (Peso 6) e M2 (Peso 4) — sendo M1 a maior parte. PTS bem documentada = alta valor M2. Grupos ampliam significativamente M1.',
    links: [{ label: 'Painel eMulti', url: '/paineis/emulti' }],
  },
  fisio: {
    nome: 'Fisioterapeuta',
    equipe: 'eMulti',
    icon: '🏃',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos por Pessoa', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Conjuntas', peso: 4, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar atendimentos individuais',
      'Organizar grupos de reabilitação (amplificador de M1)',
      'Realizar visitas domiciliares',
      'Documentar atendimentos compartilhados',
    ],
    impacto:
      'Você multiplica M1 com grupos de reabilitação — 20 pessoas em 1 grupo = 20 atendimentos. M2 por ações interprofissionais documentadas.',
    links: [{ label: 'Painel eMulti', url: '/paineis/emulti' }],
  },
  nutricionista: {
    nome: 'Nutricionista',
    equipe: 'eMulti',
    icon: '🥗',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos/Grupos', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Interprofissionais', peso: 4, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar consultas nutricionais',
      'Organizar grupos de alimentação',
      'Acompanhar gestantes (pré-natal nutricional)',
      'Documentar ações com médico para diabéticos/hipertensos',
    ],
    impacto:
      'Você contribui para M1 e M2 e impacta indiretamente C4 e C5 ao melhorar adesão de diabéticos e hipertensos. Cada membro em grupo = 1 atendimento M1.',
    links: [{ label: 'Painel eMulti', url: '/paineis/emulti' }],
  },
  assistente: {
    nome: 'Assistente Social',
    equipe: 'eMulti',
    icon: '🤝',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos Individuais', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Intersetoriais', peso: 4, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar atendimentos individuais',
      'Articular com CRAS e CREAS',
      'Participar de reuniões de rede',
      'Encaminhar famílias vulneráveis',
    ],
    impacto:
      'Você é guardião das ações intersetoriais (M2) — cada articulação documentada com CRAS, CREAS ou escolas conta. Isso representa 40% da sua nota.',
    links: [{ label: 'Painel eMulti', url: '/paineis/emulti' }],
  },
  farmaceutico: {
    nome: 'Farmacêutico',
    equipe: 'eMulti',
    icon: '💊',
    indicadores: [
      { id: 'M1', nome: 'M1 – Consultas Farmacêuticas', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Discussões de Caso', peso: 4, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Registrar consultas farmacêuticas',
      'Revisar polifarmácia em idosos',
      'Discutir prescrições com médico',
      'Organizar grupos de uso racional',
    ],
    impacto:
      'Você contribui para M1 e M2 e impacta C4 e C5 ao melhorar adesão de diabéticos e hipertensos. Discussões com médico bem documentadas = alto M2.',
    links: [{ label: 'Painel eMulti', url: '/paineis/emulti' }],
  },

  // ═══════════ GRUPO eSB — 1 PERFIL ═══════════
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
      { id: 'B6', nome: 'B6 – TRA', peso: 1, meta: 75, invertido: false, escala10: false },
    ],
    checklist: [
      'Revisar taxa de extração (meta: abaixo de 15%)',
      'Aumentar primeiras consultas programadas',
      'Dar conclusão a tratamentos em aberto',
      'Realizar escovação supervisionada em escolas',
      'Aplicar fluoreto em crianças',
    ],
    impacto:
      'Seus indicadores B1-B6 definem toda a nota eSB. B3 (Taxa de extração) é invertido — MENOR é melhor. Uma alta taxa de extração pode zerar B3.',
    links: [
      { label: 'Painel eSB', url: '/paineis/esb' },
      { label: 'Guia eSB', url: '/guias/esb' },
    ],
  },

  // ═══════════ GRUPO GESTÃO — 2 PERFIS ═══════════
  coordenador: {
    nome: 'Coordenador de UBS',
    equipe: 'Gestão',
    icon: '📋',
    indicadores: [
      { id: 'C3', nome: 'Nota C3 (0-10)', peso: 1, meta: 7.5, invertido: false, escala10: true },
      { id: 'C2', nome: 'Nota C2 (0-10)', peso: 1, meta: 8.5, invertido: false, escala10: true },
    ],
    checklist: [
      'Cobrar registros de profissionais (dias 1-5)',
      'Consolidar dados no sistema (dias 6-8)',
      'Reunião de equipe para revisar indicadores (dia 8)',
      'Enviar ao Siaps até dia 10 — IMPRORROGÁVEL',
    ],
    impacto:
      'Você é o guardião do prazo e da integridade dos dados. Um envio atrasado ao Siaps zera aquele mês. Uma reunião de equipe no dia 8 é o que mais protege a nota.',
    links: [
      { label: 'Painel eMulti', url: '/paineis/emulti' },
      { label: 'Painel eSF/eAP', url: '/paineis/esf' },
      { label: 'Painel eSB', url: '/paineis/esb' },
      { label: 'Dashboard Gerencial', url: '/gerencial' },
    ],
  },
  gestor: {
    nome: 'Gestor Municipal',
    equipe: 'Secretaria de Saúde',
    icon: '🏛️',
    indicadores: [
      { id: 'MED_C3', nome: 'Média C3 do município (0-10)', peso: 1, meta: 7.5, invertido: false, escala10: true },
      { id: 'MED_C2', nome: 'Média C2 do município (0-10)', peso: 1, meta: 8.5, invertido: false, escala10: true },
    ],
    checklist: [
      'Revisar notas de todas as equipes mensalmente',
      'Identificar equipes em Regular e acionar',
      'Confirmar envio ao Siaps de TODAS (até dia 10)',
      'Calcular repasse e informar ao financeiro',
      'Apresentar evolução em reunião de gestão',
    ],
    impacto:
      'Sua visão consolidada protege o repasse financeiro do município. Uma equipe em Regular perde até 75% do incentivo federal — sua intervenção a tempo vale muito.',
    links: [
      { label: 'Dashboard Gerencial', url: '/gerencial' },
      { label: 'Painel Admin', url: '/admin' },
    ],
  },
} as const satisfies Record<string, PerfilConfig>;

export type PerfilId = keyof typeof PERFIS;

export const PERFIL_IDS = Object.keys(PERFIS) as PerfilId[];

/** Type guard: valida se uma string é um PerfilId conhecido. */
export function isPerfilId(valor: string): valor is PerfilId {
  return valor in PERFIS;
}
