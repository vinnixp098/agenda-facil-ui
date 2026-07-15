# 🧠 Prompt — Construção do Lumien Web App

## Contexto

Construa uma aplicação web chamada **Lumien** para gestão de salões de beleza no modelo SaaS. O sistema deve ser moderno, responsivo e intuitivo, voltado para profissionais da beleza que desejam digitalizar a gestão do seu negócio.

---

## 🎨 Paleta de Cores

| Nome              | Hex       | Uso                                      |
|-------------------|-----------|------------------------------------------|
| Background        | `#F5F0E8` | Fundo geral da aplicação                 |
| Dark 1            | `#4A4035` | Textos principais, ícones                |
| Dark 2            | `#3D3535` | Textos secundários, bordas               |
| Gradient Start    | `#D4A5A5` | Início de gradientes, destaques suaves   |
| Gradient End      | `#C4855A` | Fim de gradientes, botões primários      |
| Accent 1 (Verde)  | `#7A9E87` | Status "Em Andamento", sucesso           |
| Accent 2 (Dourado)| `#C9A84C` | Status "Agendado", faturamento           |
| Light 1           | `#FAFAFA` | Fundos de cards e painéis                |
| White             | `#FFFFFF` | Superfícies, modais                      |
| Status Cancelado  | `#C0392B` | Indicadores de cancelamento, erros       |
| Shadow            | `rgba(74, 64, 53, 0.15)` | Sombras de cards e elementos |

---

## 🏗️ Tecnologias Sugeridas

- **Framework:** React (Next.js ou Vite + React)
- **Estilização:** Tailwind CSS ou Styled Components
- **Estado global:** Redux Toolkit ou Zustand
- **HTTP:** Axios
- **Roteamento:** React Router ou Next.js App Router
- **Ícones:** Lucide React

---

## 📄 Telas e Funcionalidades

### 1. Login (`/login`)
Tela de autenticação do usuário.
- Campos: e-mail e senha (com toggle de visibilidade)
- Botão "Entrar" com feedback de loading
- Link "Esqueceu a senha?" → redireciona para Recuperação de Senha
- Link "Cadastre-se" → redireciona para Cadastro
- Fundo com gradiente escuro (`#3D3535` → `#4A4035` → `#6B5B4E`)
- Logo centralizada com subtítulo "Gestão profissional do seu salão"
- Após login: ADMIN vai para `/dashboard`, demais perfis vão para `/atendimentos`

---

### 2. Cadastro (`/cadastro`)
Fluxo de 3 etapas para novos usuários (pré-cadastrados pela empresa).

**Etapa 1 — Verificação de e-mail**
- Campo de e-mail
- Verifica se o e-mail está pré-cadastrado na base e se ainda não possui senha
- Exibe modal informativo com os dados encontrados e botão para enviar código

**Etapa 2 — Validação de código**
- Campo para inserir o código recebido por e-mail
- Botão "Validar"

**Etapa 3 — Criação de senha**
- Campos: nova senha e confirmação de senha (mínimo 6 caracteres)
- Botão "Salvar"
- Redireciona para `/login` após sucesso

---

### 3. Recuperação de Senha (`/alterar-senha`)
Fluxo idêntico ao Cadastro, porém para usuários já cadastrados que esqueceram a senha.

**Etapa 1 — Verificação de e-mail**
- Verifica se o e-mail existe na base

**Etapa 2 — Validação de código**
- Código enviado por e-mail

**Etapa 3 — Redefinição de senha**
- Campos: nova senha e confirmação
- Redireciona para `/login` após sucesso

---

### 4. Dashboard (`/dashboard`) — Somente ADMIN
Visão geral do negócio com KPIs e últimos atendimentos.

- Filtro de período: **Hoje / Semana / Mês**
- Cards de KPIs:
  - Total de Atendimentos
  - Em Andamento
  - Finalizados
  - Faturamento (R$)
- Lista dos últimos 6 atendimentos (cards com cliente, serviços, status e valor)
- Pull-to-refresh / botão de atualizar

---

### 5. Atendimentos (`/atendimentos`)
Gestão completa dos atendimentos ativos.

- Filtro por status: **Todos / Em Andamento / Agendado**
- Lista de atendimentos com cards (cliente, serviços, profissional, status, valor)
- Botão flutuante `+` para criar novo atendimento

**Modal — Novo Atendimento (wizard em etapas):**

- **Etapa 1 — Cliente:** nome e telefone
- **Etapa 2 — Serviços & Profissionais:** seleção de serviços (chips), atribuição de profissional por serviço, seleção de status (Em Andamento ou Agendado)
- **Etapa 3 — Data & Hora** *(somente se status = Agendado):* seleção de data e horário
- **Etapa 4 — Confirmação:** resumo completo antes de salvar

**Modal — Detalhes do Atendimento:**
- Exibe: cliente, telefone, serviços (com profissional e valor), valor total, data de criação, data de agendamento, status atual
- Ações disponíveis conforme status:
  - **Em Andamento:** adicionar serviço, finalizar atendimento
  - **Agendado:** alterar para Em Andamento ou Cancelado, botão de enviar mensagem via WhatsApp

---

### 6. Relatórios (`/relatorios`) — Somente ADMIN
Análise de atendimentos por período com filtros.

- Seletor de intervalo de datas: **De / Até**
- Filtro por status: Todos / Agendado / Cancelado / Em Andamento / Finalizado
- Cards de KPIs:
  - Total de Atendimentos no período
  - Faturamento total (apenas finalizados)
- Lista de até 12 atendimentos filtrados, ordenados por data de criação (mais recente primeiro)
- Card de atendimento clicável → abre modal de detalhes

---

### 7. Serviços (`/servicos`) — Somente ADMIN
Gestão do catálogo de serviços do salão.

- Lista de serviços com: nome, valor, indicador de promoção ativa, status ativo/inativo
- Botão flutuante `+` para cadastrar novo serviço
- Clique no serviço → abre modal de edição

**Modal — Novo / Editar Serviço:**
- Campo: nome do serviço *(somente leitura na edição)*
- Campo: valor (numérico)
- Toggle: serviço ativo/inativo
- Toggle: promoção ativa
- Campo condicional: valor promocional *(visível apenas se promoção ativa)*
- Botão "Salvar" (verde)
- Botão "Excluir" *(somente na edição, com confirmação)*

---

### 8. Menu / Configurações (`/menu`)
Tela de configurações do usuário.

- Item: **Redefinir senha** → redireciona para `/alterar-senha`
- Item: **Gestão de Serviços** *(visível somente para ADMIN)* → redireciona para `/servicos`

---

## 🔐 Controle de Acesso

| Perfil       | Telas disponíveis                                              |
|--------------|----------------------------------------------------------------|
| ADMIN        | Dashboard, Atendimentos, Relatórios, Serviços, Menu           |
| Profissional | Atendimentos, Menu                                            |

---

## 🧩 Componentes Reutilizáveis

- `StatusBadge` — badge colorido por status (Agendado, Em Andamento, Finalizado, Cancelado)
- `KPICard` — card com gradiente, ícone, título e valor numérico
- `AtendimentoCard` — card de atendimento com cliente, serviços, status e valor
- `GradientButton` — botão com gradiente (`#D4A5A5` → `#C4855A`)
- `SearchInput` — campo de busca estilizado
- `CustomModal` — modal reutilizável com header, body e footer
- `NotificationBar` — barra de notificação global (sucesso, erro, info, warning)
- `Header` — cabeçalho com logo, nome da empresa e nome do usuário

---

## 🌐 Integração com API

Base URL: `https://meu-salao-digital-api.onrender.com/api/v1`

Todas as requisições devem incluir o header `Content-Type: application/json`. O `empresaId` do usuário autenticado deve ser enviado nas requisições que exigem isolamento de dados por empresa (modelo SaaS multiempresa).

---

> Lumien — Menos papel. Mais controle.
