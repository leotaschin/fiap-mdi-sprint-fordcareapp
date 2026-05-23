import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Vehicle, Maintenance } from '@/contexts/UserContext';
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

export function computeAlerts(vehicle: Vehicle | null, maintenances: Maintenance[]): Alert[] {
  if (!vehicle) return [];

  return MAINTENANCE_RULES.map((rule) => {
    // Find the most recent maintenance record for this specific service type
    const lastOfType = maintenances
      .filter((m) => m.type === rule.type)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    // Fall back to vehicle's global last service if no specific record exists
    const baseKm   = lastOfType?.km   ?? vehicle.lastServiceKm;
    const baseDate = lastOfType?.date ?? vehicle.lastServiceDate;

    const kmSinceService  = vehicle.currentKm - baseKm;
    const daysSinceService = daysSince(baseDate);

    const kmRemaining   = rule.intervalKm   - kmSinceService;
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
  const { vehicle, maintenances } = useUser();
  return useMemo(() => computeAlerts(vehicle, maintenances), [vehicle, maintenances]);
}
