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

-- RLS: usuário só pode INSERIR seus próprios logs (sem leitura/edição pelo cliente)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Apenas service_role (backend/admin) pode ler os logs
-- Sem policy de SELECT = usuário comum nunca acessa os logs pelo app
