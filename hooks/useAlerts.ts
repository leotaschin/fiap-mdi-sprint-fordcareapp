import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Vehicle } from '@/contexts/UserContext';
import { MAINTENANCE_RULES, ALERT_THRESHOLD_KM, ALERT_THRESHOLD_DAYS } from '@/constants/maintenanceRules';
import { daysSince } from '@/utils/daysSince';

export type AlertStatus = 'urgente' | 'atencao' | 'ok';

export type Alert = {
  type: string;
  status: AlertStatus;
  kmRemaining: number;
  daysRemaining: number;
  points: number;
};

export function computeAlerts(vehicle: Vehicle | null): Alert[] {
  if (!vehicle) return [];

  const kmSinceService = vehicle.currentKm - vehicle.lastServiceKm;
  const daysSinceService = daysSince(vehicle.lastServiceDate);

  return MAINTENANCE_RULES.map((rule) => {
    const kmRemaining = rule.intervalKm - kmSinceService;
    const daysRemaining = rule.intervalDays - daysSinceService;

    let status: AlertStatus = 'ok';
    if (kmRemaining <= 0 || daysRemaining <= 0) {
      status = 'urgente';
    } else if (kmRemaining <= ALERT_THRESHOLD_KM || daysRemaining <= ALERT_THRESHOLD_DAYS) {
      status = 'atencao';
    }

    return { type: rule.type, status, kmRemaining, daysRemaining, points: rule.points };
  });
}

export function useAlerts(): Alert[] {
  const { vehicle } = useUser();
  return useMemo(() => computeAlerts(vehicle), [vehicle]);
}
