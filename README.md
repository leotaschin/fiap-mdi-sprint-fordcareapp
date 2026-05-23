# FordCare 🚗

> **Seu Ford. Sempre em dia.**  
> Solução mobile para retenção de clientes no pós-venda da rede oficial Ford.

---

## 📋 Sobre o Projeto

### Desafio Ford Escolhido
**Desafio 02 — Impulsionando o VIN Share na América do Sul**

O VIN Share representa a porcentagem de veículos Ford que utilizam a rede oficial de concessionárias para manutenções. O desafio é reduzir a evasão de clientes para mecânicas não autorizadas, aumentando a fidelização no pós-venda.

### Por que uma solução mobile?
Clientes evitam a rede oficial por falta de visibilidade sobre o estado do veículo, dificuldade em encontrar concessionárias e ausência de incentivos concretos para permanecer na rede. O FordCare resolve esses três pontos diretamente no celular do proprietário, com alertas inteligentes, agendamento facilitado e um programa de pontos que recompensa a fidelidade.

---

## ✅ Funcionalidades Implementadas

### Autenticação
- Cadastro de conta com validação de campos
- Login com e-mail e senha via Supabase Auth
- Persistência de sessão com AsyncStorage

### Gestão de Veículos
- Cadastro de múltiplos veículos Ford (Bronco, Fusion, Maverick, Ranger, Territory)
- Swiper de veículos na Home com fotos reais por modelo e cor
- Atualização de quilometragem com validação

### Alertas Inteligentes
- Cálculo automático de alertas por **tipo de serviço** (não global)
  - Troca de Óleo: a cada 10.000 km / 6 meses
  - Revisão Geral: a cada 20.000 km / 12 meses
  - Rodízio de Pneus: a cada 10.000 km / 6 meses
  - Filtro de Ar: a cada 15.000 km / 9 meses
- Status: `urgente` (vencido) · `atencao` (menos de 1.500 km ou 30 dias) · `ok`
- Alertas individuais — confirmar 3 de 4 serviços resolve apenas esses 3

### Agendamento
- Lista de concessionárias Ford reais do estado de SP com horários
- Indicador de aberto/fechado em tempo real
- Fluxo de agendamento em 3 etapas: veículo → concessionária → revisão
- Histórico de agendamentos com filtros (Todos / Agendado / Concluído)
- Confirmação de revisão que atualiza status do veículo e registra manutenção

### Histórico de Manutenções
- Agrupamento por sessão de revisão (data + concessionária)
- Cada grupo exibe todos os serviços realizados com pontos individuais

### Programa de Pontos FordCare
- Pontos ganhos por serviço registrado na rede oficial
- Níveis: Bronze (0–499 pts) → Prata (500–1.499 pts) → Ouro (1.500+ pts)
- Barra de progresso para o próximo nível
- Resgate de benefícios: desconto, lavagem gratuita, revisão gratuita

### Perfil
- Avatar com iniciais do usuário
- Saldo de pontos e nível atual
- Como ganhar pontos
- Benefícios disponíveis para resgate
- Configurações da conta

---

## 👥 Integrantes do Grupo

| Nome | RM |
|------|----|
| Gustavo Alves | 557876 |
| Gabriel Dias | 556830 |
| Gabriel Galerani | 557421 |
| Pedro Paulo | 554880 |
| Leonardo Taschin | 554583 |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) instalado no celular (iOS ou Android)
- Conta no [Expo](https://expo.dev/) (opcional, para build)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/LeoTaschin/fiap-mdi-sprint-fordcareapp.git
cd fiap-mdi-sprint-fordcareapp

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start --clear
```

Escaneie o QR Code com o **Expo Go** (Android) ou com a **Câmera** (iOS).

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz com as chaves do Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

> As chaves de produção serão fornecidas separadamente para avaliação.

---

## 📱 Demonstração Visual

### Fluxo Principal

> 🎬 [Assista ao vídeo de demonstração](#) *(link será adicionado antes da entrega)*

### Telas

| Home | Manutenções | Agendamento |
|------|-------------|-------------|
| ![Home](assets/screenshots/home.png) | ![Manutencoes](assets/screenshots/manutencoes.png) | ![Agendamento](assets/screenshots/agendamento.png) |

| Novo Agendamento | Detalhe | Perfil |
|-----------------|---------|--------|
| ![Novo](assets/screenshots/novo_agendamento.png) | ![Detalhe](assets/screenshots/detalhe_agendamento.png) | ![Perfil](assets/screenshots/perfil.png) |

> 📸 *Screenshots serão adicionados antes da entrega final.*

---

## 🏗️ Decisões Técnicas

### Stack

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Framework | React Native + Expo SDK 51 | Stack da disciplina, entrega nativa iOS/Android |
| Navegação | Expo Router (file-based) | Roteamento declarativo, suporte a deep links |
| Estado Global | Context API + useReducer | Sem dependência externa, adequado à complexidade do app |
| Backend / Auth | Supabase (PostgreSQL + Auth) | BaaS com RLS, tempo real e SDK TypeScript |
| Persistência Local | AsyncStorage | Cache offline de sessão e dados do usuário |
| Notificações | expo-notifications | Lembretes locais de revisão |
| Tipagem | TypeScript | Em todos os arquivos do projeto |
| Fontes | Barlow + Barlow Condensed | Identidade visual próxima à marca Ford |

### Estrutura do Projeto

```
fordcare/
├── app/
│   ├── (tabs)/          # Telas principais (Home, Manutenções, Agendamento, Perfil)
│   ├── agendamento/     # Fluxo de agendamento (novo + detalhe)
│   ├── auth/            # Login e cadastro
│   └── veiculo/         # Cadastro de veículo
├── components/          # Componentes reutilizáveis
├── constants/           # Tema, regras de manutenção, concessionárias, modelos Ford
├── contexts/            # UserContext (perfil, veículos, manutenções)
├── hooks/               # useAlerts (cálculo de alertas por tipo)
├── services/            # Supabase: auth, vehicles, maintenance, agendamentos
└── utils/               # Helpers de formatação e cálculo
```

### Integrações Externas
- **Supabase Auth** — autenticação com JWT, Row Level Security por `user_id`
- **Supabase PostgreSQL** — tabelas: `profiles`, `vehicles`, `maintenances`, `agendamentos`
- **expo-notifications** — agendamento de lembretes locais

### Decisões de Arquitetura

**Alertas por tipo de serviço**  
Em vez de um único `lastServiceDate` global, o sistema calcula alertas individualmente por tipo usando o histórico de manutenções. Confirmar um agendamento com 3 de 4 serviços resolve apenas esses 3 alertas — o quarto permanece pendente.

**Agrupamento do histórico**  
Manutenções são agrupadas por `data + concessionária`, formando uma "sessão de revisão". Uma visita com 4 serviços aparece como 1 card no histórico, não 4.

**Sincronização de status**  
Após confirmar uma revisão, o app atualiza o Supabase (`status → concluido`), registra as manutenções, soma pontos ao perfil e navega de volta à lista — que re-busca os dados frescos via `useFocusEffect`.

---

## 🔮 Próximos Passos

- **Geolocalização real** — usar GPS para ordenar concessionárias por distância
- **Notificações push** — lembretes automáticos quando uma revisão estiver próxima do vencimento
- **OCR de quilometragem** — leitura do painel pelo celular para atualização automática do km
- **Indicação de amigos** — fluxo de convite com pontos para ambos
- **Dashboard Ford** — painel interno para concessionárias visualizarem agendamentos

---

## 🎓 Contexto Acadêmico

Projeto desenvolvido como Sprint avaliativa da disciplina **Mobile Development & IoT** — 3º ano de Engenharia de Software — FIAP, em parceria com a **Ford Brasil**, respondendo ao **Desafio 02: Impulsionando o VIN Share na América do Sul**.
