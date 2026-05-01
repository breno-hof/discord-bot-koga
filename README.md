# Discord Bot Koga

> *"A história está repleta de generais incompetentes. Você está em boa companhia."*

Bot de Discord multitenant para monitoramento de performance no **League of Legends**, com análise histórico-irônica de derrotas — e árbitro de regras de **D&D 5e (2024)**. Desenvolvido em Node.js para a organização [devyor.fun](https://devyor.fun).

---

## Arquitetura

```
src/
├── commands/               # Slash Commands do Discord
│   ├── config_koga.js      # Define o canal de notificações
│   ├── vincular.js         # Adiciona jogador ao monitoramento
│   ├── status.js           # Lista jogadores monitorados
│   └── regra.js            # Consulta regras do Glossário D&D 5e
├── database/
│   ├── init.js             # Inicialização e schema do SQLite
│   └── queries.js          # Queries reutilizáveis
├── engine/
│   ├── HistoryEngine.js    # Core Engine de análise histórico-irônica (LoL)
│   ├── DnDEngine.js        # Motor de busca no Glossário D&D 5e
│   └── glossary_data.json  # Glossário D&D 5e (Apêndice C, págs. 360–377)
├── listeners/
│   └── dndRulesListener.js # Listener de mensagens para regras D&D
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
| `/regra <termo>` | Consulta uma regra do Glossário D&D 5e (com autocomplete) | Qualquer usuário |

---

## Funcionalidade D&D — Árbitro de Regras

O Koga monitora todas as mensagens do servidor em busca das palavras-gatilho **"explica"** e **"sustenta"**. Ao detectá-las acompanhadas de um termo de regra, ele consulta o **Glossário de Regras D&D 5e 2024 (Apêndice C, págs. 360–377)** e responde com a definição oficial — no tom característico do personagem.

### Como usar

Basta digitar em qualquer canal onde o bot tenha acesso:

```
explica vantagem
sustenta acerto crítico
alguém explica o que é exaustão?
sustenta a regra de concentração
explica CA
sustenta PV
```

O bot também responde ao comando slash com autocomplete:

```
/regra termo:Salvaguarda Contra Morte
```

### Termos disponíveis (101 entradas canônicas)

O glossário cobre todos os termos do Apêndice C, incluindo:

| Categoria | Exemplos |
| :--- | :--- |
| **Condições** | Amedrontado, Atordoado, Caído, Cego, Enfeitiçado, Envenenado, Exaustão, Imobilizado, Incapacitado, Invisível |
| **Ações** | Ação, Ação Bônus, Ajudar, Analisar, Atacar, Desengajar, Esconder, Esquivar, Preparar, Procurar, Usar Magia, Usar Objeto |
| **Combate** | Acerto Crítico, Ataque Armado, Ataque Desarmado, Ataque Mágico, Ataques de Oportunidade, Iniciativa, Jogada de Ataque, Surpresa |
| **Mecânicas** | Vantagem, Desvantagem, Concentração, Proficiência, Especialização, Salvaguarda, Teste de Atributo, Teste de D20 |
| **Recursos** | Pontos de Vida, Classe de Armadura, Classe de Dificuldade, Nível de Desafio, Pontos de Experiência, Descanso Curto, Descanso Longo |
| **Áreas de Efeito** | Cilindro, Cone, Cubo, Emanação, Esfera, Linha |
| **Outros** | Alinhamento, Armas Improvisadas, Asfixia, Capacidade de Carga, Cobertura, Magia, Queda, Resistência, Ritual, Tamanho, Terreno Difícil, Truque, Vulnerabilidade |

Abreviações também são reconhecidas: `CA`, `CD`, `PV`, `ND`, `XP`, `BP`.

### Intents necessários

A funcionalidade de monitoramento de mensagens requer que os seguintes **Privileged Gateway Intents** estejam habilitados no [Discord Developer Portal](https://discord.com/developers/applications):

- `MESSAGE CONTENT INTENT` — para leitura do conteúdo das mensagens

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
- Motor de busca D&D (DnDEngine) e lógica de matching

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
