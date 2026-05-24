/**
 * Calcula quantos dias se passaram desde uma data específica.
 * Utilizado pelo sistema de alertas para verificar o tempo
 * desde a última manutenção de cada serviço do veículo.
 *
 * @param date - Data de referência (objeto Date ou string ISO)
 * @returns Número de dias inteiros desde a data fornecida
 */
export function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calcula quantos dias faltam até uma data futura.
 * Retorna valor negativo se a data já passou.
 *
 * @param date - Data futura de referência
 * @returns Número de dias até a data (negativo se vencido)
 */
export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}