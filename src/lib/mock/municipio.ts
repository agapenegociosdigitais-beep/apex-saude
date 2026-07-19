import { EQUIPES, type EquipeId } from './equipes';

/**
 * Município mock — Belterra-PA (piloto).
 * Fase 2: substituir por leitura de municipios/equipes no Supabase.
 */
export interface EquipeInstancia {
  id: string;
  nome: string;
  tipo: EquipeId;
  /** Chave estavel para o mock deterministico de valores */
  chave: string;
}

export interface MunicipioConfig {
  nome: string;
  uf: string;
  equipes: EquipeInstancia[];
}

export const MUNICIPIO_MOCK: MunicipioConfig = {
  nome: 'Belterra',
  uf: 'PA',
  equipes: [
    { id: 'esf-01', nome: 'eSF Santa Luzia', tipo: 'esf', chave: 'eq-esf-01' },
    { id: 'esf-02', nome: 'eSF Floresta', tipo: 'esf', chave: 'eq-esf-02' },
    { id: 'esf-03', nome: 'eSF Nova Belterra', tipo: 'esf', chave: 'eq-esf-03' },
    { id: 'esb-01', nome: 'eSB Centro', tipo: 'esb', chave: 'eq-esb-01' },
    { id: 'emulti-01', nome: 'eMulti 1', tipo: 'emulti', chave: 'eq-emulti-01' },
  ],
};

/** Indicadores de um tipo de equipe (atalho tipado). */
export function indicadoresDoTipo(tipo: EquipeId) {
  return EQUIPES[tipo].indicadores;
}
