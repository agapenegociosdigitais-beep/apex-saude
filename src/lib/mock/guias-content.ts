import type { EquipeId } from './equipes';

/**
 * Conteúdo educativo dos 15 indicadores (NT 6/2025).
 * Síntese prática para os guias de equipe — o que é e como melhorar.
 */
export interface GuiaIndicador {
  id: string;
  oQueE: string;
  comoMelhorar: string[];
}

export const GUIAS: Record<EquipeId, { titulo: string; introducao: string; indicadores: GuiaIndicador[] }> = {
  esf: {
    titulo: 'Guia eSF / eAP — Indicadores C1 a C7',
    introducao:
      'Os 7 indicadores da Saúde da Família medem acesso, ciclos de vida e condições crônicas. C2, C3 e C7 têm peso 2 — são onde a nota se ganha ou se perde.',
    indicadores: [
      {
        id: 'C1',
        oQueE: 'Acesso: proporção de pessoas atendidas no território em relação ao cadastrado. Mede se a equipe está alcançando a população.',
        comoMelhorar: [
          'Busca ativa de faltosos via ACS toda semana',
          'Ampliar horários de maior demanda (manhãs de segunda)',
          'Registrar TODO atendimento, inclusive domiciliar',
        ],
      },
      {
        id: 'C2',
        oQueE: 'Desenvolvimento infantil: crianças com acompanhamento completo (puericultura, vacinas, marcos do desenvolvimento). Peso 2.',
        comoMelhorar: [
          'Mapear crianças que completam 2 anos no mês',
          'Vincular puericultura ao calendário vacinal',
          'Convocar faltosos por telefone + visita do ACS',
        ],
      },
      {
        id: 'C3',
        oQueE: 'Gestação e puerpério: gestantes com pré-natal adequado e puérperas acompanhadas até 42 dias. Peso 2.',
        comoMelhorar: [
          'Capturar gestantes no 1º trimestre (teste rápido na UBS)',
          'Agenda dedicada de pré-natal semanal',
          'Visita puerperal domiciliar antes de 42 dias',
        ],
      },
      {
        id: 'C4',
        oQueE: 'Diabetes: diabéticos com HbA1c solicitada no período.',
        comoMelhorar: [
          'Lista nominal de diabéticos sem exame — revisar toda semana',
          'Solicitar HbA1c na primeira consulta do ano',
          'Grupo educativo de diabéticos conta como acompanhamento',
        ],
      },
      {
        id: 'C5',
        oQueE: 'Hipertensão: hipertensos com pressão arterial aferida no período.',
        comoMelhorar: [
          'Técnico aferi PA de TODO hipertenso que entra na UBS',
          'Mapa de hipertensos descontrolados para priorização',
          'Farmácia: checar adesão à medicação na dispensação',
        ],
      },
      {
        id: 'C6',
        oQueE: 'Pessoa idosa: idosos com vacinação e avaliação em dia.',
        comoMelhorar: [
          'Mutirão de vacinação com transporte combinado',
          'Caderneta de saúde do idoso atualizada em cada visita',
          'ACS identifica idosos acamados para visita domiciliar',
        ],
      },
      {
        id: 'C7',
        oQueE: 'Prevenção do câncer: colpocitologia e mamografia na faixa etária indicada. Peso 2 — o mais sensível a falhas.',
        comoMelhorar: [
          'Lista nominal de mulheres 25-64 anos sem colpo',
          'Agendamento ativo: a equipe liga e agenda, não espera',
          'Parceria com ônibus/polo para mamografia itinerante',
        ],
      },
    ],
  },
  esb: {
    titulo: 'Guia eSB — Indicadores B1 a B6',
    introducao:
      'Os 6 indicadores de saúde bucal medem acesso, resolutividade e prevenção. Atenção: B3 (exodontia) é invertido — quanto MENOR, melhor.',
    indicadores: [
      {
        id: 'B1',
        oQueE: 'Primeira consulta programada: novos usuários entrando por agenda programada (não só urgência).',
        comoMelhorar: [
          'Reservar slots diários para primeira consulta',
          'ACS indica famílias sem acompanhamento odontológico',
          'Recepção agenda retorno já na saída',
        ],
      },
      {
        id: 'B2',
        oQueE: 'Tratamento concluído: proporção de tratamentos finalizados com alta.',
        comoMelhorar: [
          'Revisar prontuários em aberto toda semana',
          'Busca ativa de abandonos de tratamento',
          'Dar alta formal quando concluir — sem registro não conta',
        ],
      },
      {
        id: 'B3',
        oQueE: 'Taxa de exodontia: extrações sobre procedimentos. INVERTIDO — meta abaixo de 25%. Alta taxa sugere pouca prevenção.',
        comoMelhorar: [
          'Priorizar tratamento conservador (restauração > extração)',
          'Protocolo de urgência: aliviar dor SEM extrair quando possível',
          'Escovação supervisionada reduz extrações futuras',
        ],
      },
      {
        id: 'B4',
        oQueE: 'Procedimentos preventivos: selantes, fluoretos e profilaxias sobre o total.',
        comoMelhorar: [
          'Aplicar fluoreto em toda consulta infantil',
          'Selante em primeiros molares permanentes',
          'Agenda semanal dedicada à prevenção',
        ],
      },
      {
        id: 'B5',
        oQueE: 'Escovação supervisionada: sessões coletivas em escolas/creches.',
        comoMelhorar: [
          'Calendário mensal com escolas do território',
          'Registrar cada sessão com lista de presença',
          'Articular com merenda escolar',
        ],
      },
      {
        id: 'B6',
        oQueE: 'TRA (Tratamento Restaurador Atraumático): tratamento minimamente invasivo, especialmente em crianças.',
        comoMelhorar: [
          'Kit TRA sempre montado na maleta',
          'Aplicar em escolas e visitas domiciliares',
          'Capacitar auxiliar/técnico no protocolo',
        ],
      },
    ],
  },
  emulti: {
    titulo: 'Guia eMulti — Indicadores M1 e M2',
    introducao:
      'A eMulti é medida por volume de cuidado (M1, peso 6) e integração com as equipes (M2, peso 4). Grupos são o grande multiplicador.',
    indicadores: [
      {
        id: 'M1',
        oQueE: 'Atendimentos por pessoa: volume de atendimentos individuais e em grupo. Cada participante de grupo conta 1 atendimento.',
        comoMelhorar: [
          'Grupos semanais fixos (reeducação alimentar, reabilitação, apoio)',
          'Registrar TODOS os atendimentos no dia',
          'PTS documentada amplia o valor do cuidado',
        ],
      },
      {
        id: 'M2',
        oQueE: 'Ações interprofissionais: matriciamentos, discussões de caso e ações conjuntas com eSF/eSB e rede intersetorial.',
        comoMelhorar: [
          'Matriciamento semanal com horário protegido',
          'Documentar cada discussão de caso com médico/enfermeiro',
          'Articular CRAS, CREAS e escolas — intersetorialidade conta',
        ],
      },
    ],
  },
};
