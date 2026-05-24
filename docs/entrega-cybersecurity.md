# Documento de Entrega — Sprint Cybersecurity
## FordCare — Segurança no App Mobile

---

**Projeto:** FordCare — Seu Ford. Sempre em dia.  
**Disciplina:** Cybersecurity · Mobile Development & IoT  
**Curso:** Engenharia de Software — 3º Ano  
**Instituição:** FIAP  
**Parceria:** Ford Brasil — Desafio 02: Impulsionando o VIN Share na América do Sul  
**Ano:** 2025  

---

**Integrantes do Grupo**

| Nome | RM |
|---|---|
| Gustavo Alves | 557876 |
| Gabriel Dias | 556830 |
| Gabriel Galerani | 557421 |
| Pedro Paulo | 554880 |
| Leonardo Taschin | 554583 |

---

## Visão Geral

O FordCare é um aplicativo mobile desenvolvido em **React Native + Expo SDK 51**, com backend **Supabase (PostgreSQL + Auth)** e tipagem completa em **TypeScript**. O app permite que proprietários Ford acompanhem alertas de manutenção, agendem revisões na rede oficial e acumulem pontos de fidelidade.

Este documento descreve as medidas de segurança implementadas no app, organizadas pelos cinco critérios do Sprint Cybersecurity, com evidências de código e capturas do ambiente de produção.

---

## 1. Segurança de Entrada e Validação de Dados — 20 pts

### 1.1 Sanitização contra SQL Injection e XSS

O FordCare utiliza o **Supabase JavaScript SDK**, que internamente usa queries parametrizadas (prepared statements) em todas as operações de banco de dados. Isso torna ataques de SQL Injection impossíveis pelo cliente — nenhuma string de entrada do usuário é concatenada diretamente em queries SQL.

Quanto a XSS: o React Native **não renderiza HTML** — não existe `innerHTML`, `dangerouslySetInnerHTML` ou interpretação de tags no app. Entradas do usuário exibidas na interface são sempre texto puro, eliminando essa classe de ataque.

### 1.2 Validação com Regex

Todos os campos de texto possuem validação por expressão regular antes do envio ao backend:

```typescript
// app/auth/cadastro.tsx
function validate() {
  const e: Record<string, string> = {};

  // Nome: apenas letras (com acentos), espaços, hífens e apóstrofos
  if (!name.trim()) e.name = 'Este campo é obrigatório';
  else if (!/^[\p{L}\s'-]{2,80}$/u.test(name.trim())) e.name = 'Nome inválido';

  // E-mail: formato RFC-compliant
  if (!email.trim()) e.email = 'Este campo é obrigatório';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'E-mail inválido';

  // Senha: mínimo 6, máximo 72 (limite do bcrypt do Supabase)
  if (!password) e.password = 'Este campo é obrigatório';
  else if (password.length < 6) e.password = 'Mínimo de 6 caracteres';

  return e;
}
```

### 1.3 Limitação de Tamanho e Formato (maxLength)

Todos os componentes `TextInput` possuem `maxLength` configurado, prevenindo ataques de payload flooding e buffer overflow:

| Campo | maxLength | Justificativa |
|---|---|---|
| Nome | 80 | Limite prático para nomes completos |
| E-mail | 100 | Padrão RFC 5321 |
| Senha | 72 | Limite do algoritmo bcrypt usado pelo Supabase |
| KM atual / KM revisão | 7 | Máximo: 9.999.999 km |
| Ano do veículo | 4 | Ex: 2024 |
| Data da revisão | 10 | Formato DD/MM/AAAA |

Campos numéricos possuem adicionalmente strip de caracteres inválidos via `replace(/\D/g, '')`, impedindo entradas malformadas mesmo antes da validação:

```typescript
// app/veiculo/cadastro.tsx
onChangeText={(v) => setCurrentKm(v.replace(/\D/g, ''))}
```

### 1.4 Tratamento Seguro de Erros

Foi criado o utilitário centralizado `utils/safeError.ts` que mapeia erros internos para mensagens amigáveis, garantindo que **stack traces, nomes de tabelas, políticas RLS e tecnologias usadas nunca cheguem ao usuário final**:

```typescript
// utils/safeError.ts
const ERROR_MAP = [
  { match: /invalid.login.credentials|invalid_credentials/i,
    message: 'E-mail ou senha incorretos. Tente novamente.' },
  { match: /already registered/i,
    message: 'Esse e-mail já está cadastrado. Que tal fazer login?' },
  { match: /rate.limit|too many requests/i,
    message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  { match: /network|fetch|Failed to fetch/i,
    message: 'Sem conexão. Verifique sua internet e tente novamente.' },
  // Supabase / RLS — nunca expor ao usuário
  { match: /RLS|row.level.security|permission|policy|violates/i,
    message: 'Operação não permitida. Tente novamente.' },
  { match: /duplicate key|unique constraint/i,
    message: 'Este registro já existe.' },
];

export function safeErrorMessage(err: unknown, fallback = 'Algo deu errado.'): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  for (const { match, message } of ERROR_MAP) {
    if (match.test(raw)) return message;
  }
  return fallback;
}
```

Todos os blocos `catch` do app utilizam `safeErrorMessage()` — nenhum `err.message` é exposto diretamente ao usuário. Além disso, **todos os `console.log`, `console.error` e `console.warn` foram removidos** do código de produção.

---

## 2. Autenticação e Autorização — 20 pts

### 2.1 Autenticação Segura com JWT

O FordCare utiliza **Supabase Auth** com autenticação via JWT (JSON Web Token):

- Tokens com expiração automática configurada pelo Supabase
- `autoRefreshToken: true` — renovação transparente sem logout forçado
- `persistSession: true` — sessão mantida entre reinicializações do app

### 2.2 Armazenamento Criptografado do Token (expo-secure-store)

O token de sessão JWT é armazenado com criptografia em repouso, substituindo completamente o `AsyncStorage` (que salva em texto claro):

```typescript
// services/supabase.ts
import * as SecureStore from 'expo-secure-store';

// Adaptador seguro: usa Keychain no iOS e EncryptedSharedPreferences no Android
const SecureStoreAdapter = {
  getItem:    (key: string)                => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string)                => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:          SecureStoreAdapter,  // Token criptografado em repouso
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
```

| Plataforma | Mecanismo | Nível de segurança |
|---|---|---|
| iOS | Keychain Services | Criptografia pelo Secure Enclave |
| Android | EncryptedSharedPreferences | AES-256 via Android Keystore |

### 2.3 Gestão de Chaves de API (Variáveis de Ambiente)

As chaves do Supabase foram removidas completamente do código-fonte e armazenadas em arquivo `.env`, listado no `.gitignore` e nunca versionado no Git:

```
# .env (não versionado — valores omitidos por segurança)
EXPO_PUBLIC_SUPABASE_URL=***
EXPO_PUBLIC_SUPABASE_ANON_KEY=***
```

As chaves são injetadas em tempo de execução via `process.env.EXPO_PUBLIC_*`, padrão nativo do Expo SDK 51.

> **Evidência:** Conforme print do VS Code anexado, o arquivo `.env` existe localmente mas está corretamente excluído do repositório via `.gitignore`.

### 2.4 Controle de Acesso por Row Level Security (RLS)

O Supabase PostgreSQL tem **RLS habilitado em todas as 5 tabelas** do projeto, conforme evidenciado pelas capturas do painel:

| Tabela | RLS | Policies |
|---|---|---|
| `agendamentos` | ✅ enabled | insert own, select own, update own |
| `audit_logs` | ✅ enabled | users_insert_own_audit_logs |
| `maintenances` | ✅ enabled | manutenções próprias (ALL) |
| `profiles` | ✅ enabled | perfil próprio (ALL) |
| `vehicles` | ✅ enabled | veículos próprios (ALL) |

> **Evidência:** Print do painel Supabase → Authentication → Policies mostrando todas as tabelas com RLS ativo e suas respectivas policies.

Adicionalmente, todas as queries no cliente filtram por `user_id` como segunda camada de proteção:

```typescript
// services/vehicle.ts
const { data } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', userId);  // filtro client-side + RLS server-side
```

---

## 3. Proteção de APIs e Serviços — 20 pts

### 3.1 HTTPS/TLS em Todas as Comunicações

Toda comunicação entre o app e o backend utiliza **HTTPS com TLS 1.2+**:

- A URL do Supabase utiliza obrigatoriamente o protocolo `https://`
- O Supabase JavaScript SDK não permite conexões sem criptografia
- No **iOS**, o App Transport Security (ATS) bloqueia automaticamente qualquer chamada HTTP não criptografada em nível de sistema operacional
- No **Android**, o `network_security_config` padrão do Expo proíbe tráfego em texto claro

### 3.2 Rate Limiting

O Supabase possui rate limiting nativo nos endpoints de autenticação, protegendo contra ataques de força bruta e credential stuffing:

- Limite de tentativas de login por IP e por e-mail
- Bloqueio progressivo após múltiplas falhas consecutivas
- Resposta padronizada `429 Too Many Requests` mapeada pelo `safeErrorMessage` para mensagem amigável ao usuário

### 3.3 CORS

O FordCare é um app mobile — não existe contexto de navegador e, portanto, CORS não se aplica diretamente às chamadas do app. O CORS é gerenciado pelo Supabase no nível do servidor, permitindo apenas origens autorizadas para eventuais integrações web.

### 3.4 Ausência de Endpoints Customizados Expostos

O app não expõe nenhuma API própria. Toda comunicação ocorre exclusivamente via **Supabase SDK**, que encapsula autenticação, autorização e criptografia de transporte em todas as operações.

---

## 4. Segurança de Dados e Privacidade — 25 pts

### 4.1 Criptografia de Dados Sensíveis em Repouso

| Dado | Armazenamento | Criptografia |
|---|---|---|
| Token JWT de sessão | expo-secure-store | ✅ Keychain / AES-256 |
| Dados do usuário (perfil, veículos) | Supabase PostgreSQL | ✅ Criptografia em repouso pelo Supabase |
| Chaves de API | Arquivo `.env` local | ✅ Fora do repositório Git |

### 4.2 Proteção contra Exposição Acidental de Dados

- **Zero logs em produção:** todos os `console.*` foram removidos do código
- **Mensagens de erro seguras:** `safeErrorMessage()` garante que nenhuma informação de infraestrutura vaze nas mensagens exibidas ao usuário
- **Chaves fora do Git:** `.env` no `.gitignore` desde o início do projeto de segurança

### 4.3 Pseudonimização conforme LGPD

A tabela `audit_logs` foi desenhada para conformidade com a LGPD: ao deletar um usuário, o campo `user_id` é automaticamente anulado (`ON DELETE SET NULL`), preservando o registro de auditoria de forma **pseudonimizada** — sem vínculo identificável com o usuário removido:

```sql
-- supabase/audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- pseudonimização automática
  action   text NOT NULL,
  ...
);
```

### 4.4 Dados Mínimos nos Logs de Auditoria

O serviço de auditoria registra apenas metadados operacionais — **nunca** dados pessoais como senha, token, e-mail ou CPF:

```typescript
// Exemplo de metadata registrada — apenas dados operacionais
metadata: {
  vehicle: "Fusion",       // modelo do veículo
  services: 2,             // quantidade de serviços
  dealership: "Ford Lapa"  // nome da concessionária
}
```

---

## 5. Monitoramento, Logs e Auditoria — 15 pts

### 5.1 Arquitetura da Trilha de Auditoria

Foi implementado o serviço `services/auditLog.ts` com a tabela `audit_logs` no Supabase, registrando ações críticas de forma estruturada, segura e sem dados sensíveis:

```typescript
// services/auditLog.ts
export async function logAuditEvent(payload: AuditPayload): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id:  payload.userId ?? null,
      action:   payload.action,
      resource: payload.resource ?? null,
      status:   payload.status ?? 'success',
      metadata: payload.metadata ?? null,
    });
  } catch {
    // Auditoria nunca bloqueia o fluxo do app — falha silenciosa intencional
  }
}
```

### 5.2 Ações Críticas Auditadas

| Ação | Sucesso | Falha | Metadata registrada |
|---|---|---|---|
| `LOGIN` | ✅ com userId | ✅ user_id null (sem sessão) | — |
| `REGISTER` | ✅ com userId | ✅ | — |
| `CREATE_AGENDAMENTO` | ✅ | ✅ | vehicle, dealership, services (qtd) |
| `CONFIRM_AGENDAMENTO` | ✅ | ✅ | resource (ID), points_earned |

### 5.3 Logs Reais Capturados em Produção

Abaixo os registros reais da tabela `audit_logs` capturados durante os testes do app em produção:

| action | status | user_id | metadata | created_at |
|---|---|---|---|---|
| `LOGIN` | `failure` | `null` | — | 2026-05-24 21:10:33 |
| `LOGIN` | `success` | `e0a4b0bb...` | — | 2026-05-24 21:10:43 |
| `CREATE_AGENDAMENTO` | `success` | `e0a4b0bb...` | vehicle: Fusion, services: 2, dealership: Ford Lapa | 2026-05-24 21:07:16 |

**Interpretação:**
- `LOGIN failure` com `user_id null`: tentativa com senha incorreta — usuário sem sessão ativa
- `LOGIN success` com `user_id` preenchido: autenticação bem-sucedida
- `CREATE_AGENDAMENTO` com metadata: agendamento criado com rastreabilidade completa

### 5.4 Segurança da Tabela de Auditoria (RLS)

A tabela `audit_logs` possui RLS com duas policies complementares:

```sql
-- Policy 1: usuário autenticado insere apenas seus próprios logs
CREATE POLICY "users_insert_own_audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: permite registrar tentativas de login falhas (sem sessão ativa)
CREATE POLICY "allow_failed_login_audit"
  ON audit_logs FOR INSERT
  WITH CHECK (user_id IS NULL AND action = 'LOGIN' AND status = 'failure');
```

**Regras de acesso:**
- ✅ Usuário pode **inserir** seus próprios logs
- ✅ Sistema pode **inserir** falhas de login sem sessão
- ❌ Nenhum usuário pode **ler** os logs pelo app (sem policy de SELECT)
- ✅ Apenas `service_role` (administrador) acessa os logs via painel Supabase

### 5.5 Performance e Rastreabilidade

Foram criados 4 índices para garantir performance nas consultas de monitoramento e investigação de incidentes:

```sql
CREATE INDEX idx_audit_logs_user_id    ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_status     ON audit_logs (status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
```

---

## Resumo das Implementações

| Critério | Implementações | Nota Estimada |
|---|---|---|
| Segurança de Entrada | safeError.ts, regex, maxLength, strip não-dígitos, zero console.* | 18/20 |
| Autenticação e Autorização | JWT + SecureStore, .env, RLS em 5 tabelas, queries filtradas | 15/20 |
| Proteção de APIs | HTTPS/TLS nativo, rate limiting Supabase, CORS gerenciado | 13/20 |
| Segurança de Dados | SecureStore, .env no .gitignore, ON DELETE SET NULL, zero logs sensíveis | 17/25 |
| Monitoramento e Auditoria | auditLog.ts, 4 ações auditadas, RLS com 2 policies, índices, migration documentada | 11/15 |
| **Total** | | **~74/100** |

---

## Repositório

**GitHub:** https://github.com/LeoTaschin/fiap-mdi-sprint-fordcareapp

Arquivos de segurança relevantes:
- `services/supabase.ts` — SecureStore + variáveis de ambiente
- `utils/safeError.ts` — tratamento seguro de erros
- `services/auditLog.ts` — trilha de auditoria
- `supabase/audit_logs.sql` — migration com RLS e índices
- `app/auth/cadastro.tsx` — validação e sanitização de entrada
- `app/auth/login.tsx` — auditoria de login com safeErrorMessage
