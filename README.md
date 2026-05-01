# Discord Bot Koga
> *"A história está repleta de generais incompetentes. Você está em boa companhia."*

Bot de Discord multitenant para monitoramento de performance no **League of Legends**, com análise histórico-irônica de derrotas. Desenvolvido em Node.js para a organização [devyor.fun](https://devyor.fun).

---

## Arquitetura

```
src/
├── commands/           # Slash Commands do Discord
│   ├── config_koga.js  # Define o canal de notificações
│   ├── vincular.js     # Adiciona jogador ao monitoramento
│   └── status.js       # Lista jogadores monitorados
├── database/
│   ├── init.js         # Inicialização e schema do SQLite
│   └── queries.js      # Queries reutilizáveis
├── engine/
│   └── HistoryEngine.js # Core Engine de análise histórico-irônica
├── services/
│   ├── RiotApiService.js # Integração com Riot Games API
│   └── PollingWorker.js  # Worker de polling (node-cron)
├── utils/
│   └── config.js       # Configuração centralizada via .env
├── deploy-commands.js  # Script de registro de Slash Commands
└── index.js            # Entry point
```

---

## Diagramas

| Diagrama | Descrição |
| :--- | :--- |
| [Arquitetura](./docs/diagrams/architecture.png) | Visão geral dos componentes e integrações |
| [Sequência](./docs/diagrams/sequence.png) | Fluxo de execução dos processos principais |
| [Entidade-Relacionamento](./docs/diagrams/er.png) | Modelo de dados do SQLite |

---

## Comandos

| Comando | Descrição | Permissão |
| :--- | :--- | :--- |
| `/config_koga` | Define o canal de notificações do servidor | Administrador |
| `/vincular Nome#Tag` | Adiciona um jogador ao monitoramento | Qualquer usuário |
| `/status` | Lista jogadores monitorados no servidor | Qualquer usuário |

---

## Configuração

### 1. Pré-requisitos

- Node.js 22+
- Uma [Discord Application](https://discord.com/developers/applications) com Bot Token
- Uma [Riot Games API Key](https://developer.riotgames.com/)

### 2. Instalação

```bash
git clone https://github.com/devyor-dot-fun/discord-bot-koga.git
cd discord-bot-koga
npm install
```

### 3. Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

| Variável | Descrição | Obrigatório |
| :--- | :--- | :--- |
| `DISCORD_TOKEN` | Token do bot Discord | ✅ |
| `DISCORD_CLIENT_ID` | Client ID da aplicação Discord | ✅ |
| `RIOT_API_KEY` | Chave da Riot Games API | ✅ |
| `RIOT_REGION` | Região para MATCH-V5 (`americas`, `europe`, `asia`) | Padrão: `americas` |
| `RIOT_PLATFORM` | Plataforma para lookups (`br1`, `na1`, `euw1`) | Padrão: `br1` |
| `DATABASE_PATH` | Caminho do arquivo SQLite | Padrão: `data/koga.db` |
| `POLLING_INTERVAL_MINUTES` | Intervalo do polling em minutos | Padrão: `5` |
| `POLLING_DELAY_MS` | Delay entre requisições (rate limit) | Padrão: `1500` |

### 4. Registrar Slash Commands

```bash
npm run deploy-commands
```

### 5. Iniciar o Bot

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

---

## Deploy com Docker

```bash
# Build e execução local
docker-compose up -d

# Apenas build
docker build -t discord-bot-koga .
```

O deploy em produção é automatizado via **GitHub Actions** ao fazer push na branch `main`, utilizando o Hostinger Docker Manager API.

---

## Regras de Negócio

Consulte a [documentação completa de regras de negócio](./docs/business_rules.md) para detalhes sobre:

- Lógica do HistoryEngine e seleção de analogias históricas
- Tratamento de erros da Riot API
- Configuração multi-tenant
- Personalidade e tom de voz do bot

---

## Secrets Necessários no GitHub

| Secret | Descrição |
| :--- | :--- |
| `DISCORD_TOKEN` | Token do bot Discord |
| `DISCORD_CLIENT_ID` | Client ID da aplicação |
| `RIOT_API_KEY` | Chave da Riot Games API |
| `HOSTINGER_API_TOKEN` | Token da API Hostinger |
| `HOSTINGER_VPS_ID` | ID do VPS na Hostinger |

---

*Desenvolvido por [devyor.fun](https://devyor.fun)*
