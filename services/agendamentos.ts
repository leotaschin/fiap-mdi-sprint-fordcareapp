import { supabase } from './supabase';

export type AgendamentoInput = {
  userId: string;
  vehicleId: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
  dealershipId: string;
  dealershipName: string;
  problems: string[];
};

export type Agendamento = {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
  dealershipName: string;
  problems: string[];
  status: string;
  createdAt: string;
};

export async function criarAgendamento(input: AgendamentoInput): Promise<string> {
  const { data, error } = await supabase
    .from('agendamentos')
    .insert({
      user_id: input.userId,
      vehicle_id: input.vehicleId,
      vehicle_model: input.vehicleModel,
      vehicle_color: input.vehicleColor,
      vehicle_year: input.vehicleYear,
      dealership_id: input.dealershipId,
      dealership_name: input.dealershipName,
      problems: input.problems,
      status: 'agendado',
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function buscarAgendamentos(userId: string): Promise<Agendamento[]> {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id, vehicle_id, vehicle_model, vehicle_color, vehicle_year, dealership_name, problems, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    vehicleId: r.vehicle_id,
    vehicleModel: r.vehicle_model,
    vehicleColor: r.vehicle_color ?? 'black',
    vehicleYear: r.vehicle_year,
    dealershipName: r.dealership_name,
    problems: r.problems ?? [],
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function buscarAgendamentoPorId(id: string): Promise<Agendamento> {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id, vehicle_id, vehicle_model, vehicle_color, vehicle_year, dealership_name, problems, status, created_at')
    .eq('id', id)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    vehicleId: data.vehicle_id,
    vehicleModel: data.vehicle_model,
    vehicleColor: data.vehicle_color ?? 'black',
    vehicleYear: data.vehicle_year,
    dealershipName: data.dealership_name,
    problems: data.problems ?? [],
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function confirmarAgendamento(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ status: 'concluido' })
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
  if (!data) throw new Error('Sem permissão para atualizar este agendamento. Verifique as políticas RLS.');
}
