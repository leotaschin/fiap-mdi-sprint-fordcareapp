/**
 * safeError.ts
 * Mapeia erros internos para mensagens amigáveis e seguras.
 * Garante que stack traces, nomes de tabelas, políticas RLS
 * e detalhes de infraestrutura nunca cheguem ao usuário final.
 */

const ERROR_MAP: Array<{ match: string | RegExp; message: string }> = [
  // Auth
  { match: /invalid.login.credentials|invalid_credentials/i, message: 'E-mail ou senha incorretos. Tente novamente.' },
  { match: /already registered|already been registered|User already registered/i, message: 'Esse e-mail já está cadastrado. Que tal fazer login?' },
  { match: /email.*not.*confirmed|EMAIL_CONFIRMATION_REQUIRED/i, message: 'Confirme seu e-mail antes de entrar.' },
  { match: /password.*weak|Password should/i, message: 'Senha muito fraca. Use pelo menos 6 caracteres.' },
  { match: /rate.limit|too many requests/i, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  { match: /network|fetch|NetworkError|Failed to fetch/i, message: 'Sem conexão. Verifique sua internet e tente novamente.' },
  // Supabase / RLS — nunca expor ao usuário
  { match: /RLS|row.level.security|permission|policy|violates/i, message: 'Operação não permitida. Tente novamente.' },
  // Genérico de banco
  { match: /duplicate key|unique constraint/i, message: 'Este registro já existe.' },
  { match: /foreign key/i, message: 'Operação inválida. Tente novamente.' },
];

export function safeErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');

  for (const { match, message } of ERROR_MAP) {
    if (typeof match === 'string' ? raw.includes(match) : match.test(raw)) {
      return message;
    }
  }

  return fallback;
}
