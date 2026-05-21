export type MaintenanceRule = {
  type: string;
  intervalKm: number;
  intervalDays: number;
  points: number;
};

export const MAINTENANCE_RULES: MaintenanceRule[] = [
  { type: 'Troca de Óleo',    intervalKm: 10000, intervalDays: 180, points: 100 },
  { type: 'Revisão Geral',    intervalKm: 20000, intervalDays: 365, points: 200 },
  { type: 'Rodízio de Pneus', intervalKm: 10000, intervalDays: 180, points: 100 },
  { type: 'Filtro de Ar',     intervalKm: 15000, intervalDays: 270, points: 80  },
];

export const ALERT_THRESHOLD_KM = 1500;
export const ALERT_THRESHOLD_DAYS = 30;
