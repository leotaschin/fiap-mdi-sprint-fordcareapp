/**
 * auditLog.ts
 * Trilha de auditoria para ações críticas do app.
 * Registra eventos sem dados sensíveis (sem senha, sem token).
 *
 * Tabela Supabase necessária:
 *   CREATE TABLE audit_logs (
 *     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 *     action      text NOT NULL,
 *     resource    text,
 *     status      text NOT NULL DEFAULT 'success',  -- 'success' | 'failure'
 *     metadata    jsonb,
 *     created_at  timestamptz NOT NULL DEFAULT now()
 *   );
 *   ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
 *   -- Usuário só pode inserir seus próprios logs (nunca ler/editar)
 *   CREATE POLICY "insert_own_logs" ON audit_logs
 *     FOR INSERT WITH CHECK (auth.uid() = user_id);
 */

import { supabase } from './supabase';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'CREATE_AGENDAMENTO'
  | 'CONFIRM_AGENDAMENTO'
  | 'CREATE_VEHICLE'
  | 'UPDATE_KM'
  | 'REDEEM_BENEFIT';

interface AuditPayload {
  userId?: string;
  action: AuditAction;
  resource?: string;       // ex: agendamento ID
  status?: 'success' | 'failure';
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Registra uma ação crítica na trilha de auditoria.
 * Falhas silenciosas — nunca bloqueia o fluxo principal do app.
 */
export async function logAuditEvent(payload: AuditPayload): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id:    payload.userId ?? null,
      action:     payload.action,
      resource:   payload.resource ?? null,
      status:     payload.status ?? 'success',
      metadata:   payload.metadata ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Auditoria nunca deve derrubar o app — falha silenciosa intencional
  }
}
