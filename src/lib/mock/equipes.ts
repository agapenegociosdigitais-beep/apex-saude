import { PERFIS, type IndicadorConfig, type PerfilId } from './perfis';

/**
 * EQUIPES — definição dos 3 painéis de equipe da APS.
 * Indicadores por equipe conforme NT 6/2025 (mesma fonte de perfis.ts).
 */
export interface EquipeConfig {
  id: string;
  nome: string;
  descricao: string;
  icon: string;
  indicadores: IndicadorConfig[];
  /** Perfis profissionais que compõem a equipe */
  membros: PerfilId[];
}

export const EQUIPES = {
  esf: {
    id: 'esf',
    nome: 'eSF / eAP',
    descricao: 'Equipe de Saúde da Família — indicadores C1 a C7',
    icon: '🏥',
    indicadores: [
      { id: 'C1', nome: 'C1 – Acesso', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C2', nome: 'C2 – Desenvolvimento Infantil', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'C3', nome: 'C3 – Gestação e Puerpério', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'C4', nome: 'C4 – Diabetes', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C5', nome: 'C5 – Hipertensão', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C6', nome: 'C6 – Pessoa Idosa', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'C7', nome: 'C7 – Prevenção do Câncer', peso: 2, meta: 75, invertido: false, escala10: false },
    ],
    membros: ['medico', 'enfermeiro', 'tecnico', 'acs'],
  },
  esb: {
    id: 'esb',
    nome: 'eSB',
    descricao: 'Equipe de Saúde Bucal — indicadores B1 a B6',
    icon: '🦷',
    indicadores: [
      { id: 'B1', nome: 'B1 – 1ª Consulta Programada', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'B2', nome: 'B2 – Tratamento Concluído', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'B3', nome: 'B3 – Taxa de Exodontia', peso: 2, meta: 25, invertido: true, escala10: false },
      { id: 'B4', nome: 'B4 – Procedimentos Preventivos', peso: 2, meta: 75, invertido: false, escala10: false },
      { id: 'B5', nome: 'B5 – Escovação Supervisionada', peso: 1, meta: 75, invertido: false, escala10: false },
      { id: 'B6', nome: 'B6 – TRA', peso: 1, meta: 75, invertido: false, escala10: false },
    ],
    membros: ['dentista'],
  },
  emulti: {
    id: 'emulti',
    nome: 'eMulti',
    descricao: 'Equipe Multiprofissional — indicadores M1 e M2',
    icon: '🤝',
    indicadores: [
      { id: 'M1', nome: 'M1 – Atendimentos por Pessoa', peso: 6, meta: 75, invertido: false, escala10: false },
      { id: 'M2', nome: 'M2 – Ações Interprofissionais', peso: 4, meta: 75, invertido: false, escala10: false },
    ],
    membros: ['psicologo', 'fisio', 'nutricionista', 'assistente', 'farmaceutico'],
  },
} as const satisfies Record<string, EquipeConfig>;

export type EquipeId = keyof typeof EQUIPES;

export const EQUIPE_IDS = Object.keys(EQUIPES) as EquipeId[];

/** Type guard: valida se uma string é um EquipeId conhecido. */
export function isEquipeId(valor: string): valor is EquipeId {
  return valor in EQUIPES;
}

/** Nome de exibição de um membro da equipe. */
export function nomeDoMembro(id: PerfilId): string {
  return PERFIS[id].nome;
}
