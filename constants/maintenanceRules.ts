/**
 * Regras de manutenção preventiva dos veículos Ford.
 * Cada regra define o intervalo em km e em dias para o serviço,
 * além dos pontos FordCare concedidos ao cliente ao realizá-lo
 * na rede oficial de concessionárias.
 */

export type MaintenanceRule = {
  type: string;
  intervalKm: number;
  intervalDays: number;
  points: number;
  description: string;
};

export const MAINTENANCE_RULES: MaintenanceRule[] = [
  {
    type: 'Troca de Óleo',
    intervalKm: 10000,
    intervalDays: 180,
    points: 100,
    description: 'Substituição do óleo do motor e filtro de óleo.',
  },
  {
    type: 'Revisão Geral',
    intervalKm: 20000,
    intervalDays: 365,
    points: 200,
    description: 'Inspeção completa de freios, suspensão, fluidos e sistema elétrico.',
  },
  {
    type: 'Rodízio de Pneus',
    intervalKm: 10000,
    intervalDays: 180,
    points: 100,
    description: 'Troca de posição dos pneus para desgaste uniforme.',
  },
  {
    type: 'Filtro de Ar',
    intervalKm: 15000,
    intervalDays: 270,
    points: 80,
    description: 'Substituição do filtro de ar do motor para melhor desempenho.',
  },
];

// Limiares para exibição do alerta de atenção (antes de vencer)
export const ALERT_THRESHOLD_KM   = 1500; // alerta quando restar menos de 1.500 km
export const ALERT_THRESHOLD_DAYS = 30;   // alerta quando restar menos de 30 dias
