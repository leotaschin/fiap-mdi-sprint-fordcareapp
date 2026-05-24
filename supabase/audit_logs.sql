-- ─── Tabela de Trilha de Auditoria — FordCare ────────────────────────────────
-- Execute este script no SQL Editor do painel Supabase para ativar a auditoria.

CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text        NOT NULL,
  resource    text,
  status      text        NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices para consultas de monitoramento
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status      ON audit_logs (status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs (created_at DESC);

-- RLS: habilitar segurança por linha
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: usuário autenticado insere apenas seus próprios logs
CREATE POLICY "users_insert_own_audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: permite registrar tentativas de login falhas (user_id NULL = não autenticado)
-- Importante para monitoramento de ataques — sem essa policy, falhas de login
-- não podem ser auditadas pois o usuário ainda não possui sessão ativa.
CREATE POLICY "allow_failed_login_audit"
  ON audit_logs FOR INSERT
  WITH CHECK (user_id IS NULL AND action = 'LOGIN' AND status = 'failure');

-- Apenas service_role (backend/admin) pode ler os logs
-- Sem policy de SELECT = usuário comum nunca acessa os logs pelo app
