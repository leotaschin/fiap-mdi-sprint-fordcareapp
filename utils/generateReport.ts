import { Alert } from '@/hooks/useAlerts';

export type ReportHighlight = {
  text: string;
  status: 'urgente' | 'atencao';
};

export type VehicleReport = {
  overallStatus: 'ok' | 'atencao' | 'urgente';
  summary: string;
  highlights: ReportHighlight[];
};

export function generateReport(alerts: Alert[]): VehicleReport {
  const urgentes = alerts.filter((a) => a.status === 'urgente');
  const atencoes = alerts.filter((a) => a.status === 'atencao');

  if (urgentes.length > 0) {
    return {
      overallStatus: 'urgente',
      summary:
        urgentes.length === 1
          ? '1 manutenção vencida — agende uma revisão.'
          : `${urgentes.length} manutenções vencidas — agende uma revisão.`,
      highlights: urgentes.slice(0, 3).map((a) => ({
        text:
          a.kmRemaining < 0
            ? `${a.type}: vencida há ${Math.abs(a.kmRemaining).toLocaleString('pt-BR')} km`
            : `${a.type}: vencida há ${Math.abs(a.daysRemaining)} dias`,
        status: 'urgente' as const,
      })),
    };
  }

  if (atencoes.length > 0) {
    return {
      overallStatus: 'atencao',
      summary:
        atencoes.length === 1
          ? '1 item precisando de atenção em breve.'
          : `${atencoes.length} itens precisando de atenção em breve.`,
      highlights: atencoes.slice(0, 3).map((a) => ({
        text:
          a.kmRemaining <= 1500
            ? `${a.type}: em ${a.kmRemaining.toLocaleString('pt-BR')} km`
            : `${a.type}: em ${a.daysRemaining} dias`,
        status: 'atencao' as const,
      })),
    };
  }

  return {
    overallStatus: 'ok',
    summary: 'Seu Ford está em dia. Continue assim!',
    highlights: [],
  };
}
