/**
 * HistoryEngine.js
 * O "Core Engine" narrativo do Bot Koga.
 * Transforma estatísticas brutas de partidas em análises histórico-irônicas.
 */

// ==========================================
// DICIONÁRIO DE EVENTOS HISTÓRICOS
// ==========================================

const HISTORICAL_EVENTS = {
  // Stomps rápidos (< 20 min) — Colapsos súbitos e rendições catastróficas
  QUICK_STOMP: [
    {
      event: 'Batalha de Waterloo (1815)',
      description: 'Napoleão Bonaparte, outrora senhor da Europa, viu seu exército desintegrar-se em questão de horas por uma combinação fatal de arrogância tática e subestimação do adversário.',
      lesson: 'A confiança excessiva nas próprias capacidades, sem reconhecer a força do inimigo, é a receita mais antiga para o colapso.',
    },
    {
      event: 'Queda da Linha Maginot (1940)',
      description: 'A França investiu décadas e fortunas imensas em uma linha defensiva impenetrável. Os alemães simplesmente a contornaram pelas Ardenas em 46 horas.',
      lesson: 'Uma estratégia rígida e inflexível, incapaz de adaptar-se ao inimigo, é menos uma fortaleza e mais uma armadilha para si mesmo.',
    },
    {
      event: 'Batalha de Cannae (216 a.C.)',
      description: 'Aníbal Barca destruiu oito legiões romanas em uma tarde. Não por superioridade numérica, mas pela incapacidade romana de reconhecer o cerco que se formava ao seu redor.',
      lesson: 'Quando o inimigo dita o ritmo e a posição do combate, a derrota não é uma possibilidade — é uma certeza matemática.',
    },
  ],

  // Jogos longos e perdidos (> 45 min) — Guerras de atrito exaustivas
  LONG_ATTRITION: [
    {
      event: 'Cerco de Leningrado (1941-1944)',
      description: 'Por 872 dias, a cidade resistiu ao cerco nazista. Ao final, os sobreviventes mal se distinguiam dos mortos. Uma vitória pírrica que custou mais do que qualquer derrota.',
      lesson: 'Há um ponto em que a persistência deixa de ser virtude e torna-se teimosia suicida. Reconhecer esse momento é a verdadeira sabedoria estratégica.',
    },
    {
      event: 'Batalha de Verdun (1916)',
      description: 'Dez meses. Trezentos mil mortos. Zero ganhos territoriais significativos. A Batalha de Verdun é o monumento mais eloquente à futilidade da guerra de atrito.',
      lesson: 'Quando ambos os lados perdem mais do que podem ganhar, a questão não é quem vence — é quem perde menos tragicamente.',
    },
    {
      event: 'Guerra dos Emboabas (1708-1709)',
      description: 'No Brasil colonial, paulistas e forasteiros disputaram as minas de ouro em um conflito que enriqueceu apenas a Coroa Portuguesa, enquanto os combatentes se destruíam mutuamente.',
      lesson: 'Conflitos prolongados raramente beneficiam os combatentes. O verdadeiro vencedor costuma ser aquele que observa de fora.',
    },
  ],

  // Muitas mortes (> 10 deaths) — Táticas de "carne de canhão"
  CANNON_FODDER: [
    {
      event: 'Carga da Brigada Ligeira (1854)',
      description: 'Seiscentos cavaleiros britânicos carregaram diretamente contra a artilharia russa por um erro de comunicação. O resultado foi previsível para todos, exceto para quem ordenou a carga.',
      lesson: 'A coragem sem inteligência é indistinguível do suicídio. E o suicídio, por mais dramático que seja, raramente constitui uma estratégia vencedora.',
    },
    {
      event: 'Batalha do Somme (1916)',
      description: 'No primeiro dia, o exército britânico sofreu 57.470 baixas — o pior dia de sua história militar. O plano assumia que a artilharia prévia havia eliminado toda resistência. Não havia.',
      lesson: 'Planejar com base em suposições não verificadas é o privilégio dos incompetentes. Os resultados, invariavelmente, provam o ponto.',
    },
    {
      event: 'Cerco de Cartago (149-146 a.C.)',
      description: 'Os cartagineses, cercados e sem esperança, continuaram resistindo por três anos. Cada sortida era um sacrifício sem propósito estratégico, apenas adiando o inevitável.',
      lesson: 'Há uma diferença fundamental entre resistência heroica e obstinação autodestrutiva. A história raramente é gentil com quem não consegue distingui-las.',
    },
  ],

  // Derrota padrão — Queda de impérios e erros táticos gerais
  STANDARD_DEFEAT: [
    {
      event: 'Queda de Constantinopla (1453)',
      description: 'O Império Bizantino sobreviveu por mil anos após a queda de Roma. Ao final, foi derrubado não por falta de muralhas, mas por falta de aliados e por uma única porta deixada destrancada.',
      lesson: 'Impérios não caem por falta de força — caem por acúmulo de pequenos descuidos que, somados, tornam-se catástrofes.',
    },
    {
      event: 'Batalha de Teutoburgo (9 d.C.)',
      description: 'Três legiões romanas foram aniquiladas na Floresta de Teutoburgo por subestimarem um inimigo que conhecia o terreno melhor do que eles. Roma nunca mais cruzou o Reno.',
      lesson: 'Subestimar o adversário em seu próprio território é um erro que os romanos cometeram uma vez. Você, aparentemente, ainda está aprendendo essa lição.',
    },
    {
      event: 'Queda de Cartago (146 a.C.)',
      description: 'Cartago foi destruída tão completamente que os romanos salgaram a terra para que nada mais crescesse ali. A derrota não foi apenas militar — foi existencial.',
      lesson: 'Quando a derrota é suficientemente completa, ela não deixa nem mesmo a dignidade de uma lição aprendida.',
    },
  ],
};

// ==========================================
// FRASES FINAIS DE "CONSOLO" (RAGE BAIT)
// ==========================================

const CLOSING_REMARKS = [
  'Mas não se preocupe — a história está repleta de generais incompetentes. Você está em boa companhia.',
  'Encorajo-o a refletir sobre essa performance durante as próximas horas. Ou anos. O que for necessário.',
  'Há uma certa elegância trágica nessa derrota que, honestamente, eu não esperava de você.',
  'Considere isso não uma derrota, mas uma oportunidade pedagógica de custo elevado.',
  'A boa notícia é que o fracasso, quando suficientemente documentado, torna-se história. E a história, como sabemos, é fascinante.',
  'Recomendo uma pausa para contemplação. Talvez uma leitura de Sun Tzu. Ou qualquer livro, realmente.',
  'Sua contribuição para as estatísticas de derrota deste servidor é, de longe, a mais consistente.',
  'Fico feliz em informar que sua performance foi exatamente o que eu esperava. Infelizmente.',
];

// ==========================================
// LÓGICA DE ANÁLISE
// ==========================================

/**
 * Analisa as estatísticas de uma partida e retorna uma análise histórico-irônica.
 * @param {object} stats - Estatísticas extraídas pelo RiotApiService.extractPlayerStats
 * @param {string} riotIdTag - O Riot ID do jogador (para personalização)
 * @returns {object} Análise completa com evento histórico e mensagem formatada
 */
function analyze(stats, riotIdTag) {
  const { win, champion, kills, deaths, assists, duration, goldEarned } = stats;

  // Apenas analisa derrotas
  if (win) return null;

  const durationMinutes = Math.floor(duration / 60);
  const kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : 'Perfeito';

  // Seleção da categoria histórica
  let category;
  if (durationMinutes < 20) {
    category = 'QUICK_STOMP';
  } else if (durationMinutes > 45) {
    category = 'LONG_ATTRITION';
  } else if (deaths > 10) {
    category = 'CANNON_FODDER';
  } else {
    category = 'STANDARD_DEFEAT';
  }

  const events = HISTORICAL_EVENTS[category];
  const selectedEvent = events[Math.floor(Math.random() * events.length)];
  const closingRemark = CLOSING_REMARKS[Math.floor(Math.random() * CLOSING_REMARKS.length)];

  return {
    category,
    event: selectedEvent,
    closingRemark,
    stats: {
      riotIdTag,
      champion,
      durationMinutes,
      kills,
      deaths,
      assists,
      kda,
      goldEarned,
    },
  };
}

/**
 * Formata a análise em um objeto de Embed para o Discord.
 * @param {object} analysis - Resultado de analyze()
 * @returns {object} Discord Embed object
 */
function formatEmbed(analysis) {
  if (!analysis) return null;

  const { event, closingRemark, stats } = analysis;
  const { riotIdTag, champion, durationMinutes, kills, deaths, assists, kda, goldEarned } = stats;

  const categoryTitles = {
    QUICK_STOMP: '⚡ Colapso Estratégico Prematuro',
    LONG_ATTRITION: '⏳ Guerra de Atrito Exaustiva',
    CANNON_FODDER: '💀 Sacrifício Sem Propósito Estratégico',
    STANDARD_DEFEAT: '📜 Derrota de Proporções Históricas',
  };

  return {
    title: `${categoryTitles[analysis.category]}`,
    description: `*Observando a performance de **${riotIdTag}** com **${champion}**...*\n\n${event.description}\n\n> *"${event.lesson}"*`,
    color: 0x8b0000, // Dark red — cor do fracasso
    fields: [
      {
        name: '📊 Telemetria da Derrota',
        value: [
          `**Duração:** ${durationMinutes} minutos`,
          `**KDA:** ${kills}/${deaths}/${assists} (${kda})`,
          `**Ouro Acumulado:** ${goldEarned.toLocaleString('pt-BR')}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '📚 Analogia Histórica',
        value: `**${event.event}**`,
        inline: true,
      },
    ],
    footer: {
      text: closingRemark,
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { analyze, formatEmbed };
