/**
 * HistoryEngine.js
 * O "Core Engine" narrativo do Bot Koga.
 * Transforma estatísticas brutas de partidas em análises histórico-irônicas.
 */

// ==========================================
// DICIONÁRIO DE EVENTOS HISTÓRICOS
// ==========================================

const HISTORICAL_EVENTS = {
  // Stomps rápidos (< 20 min) — Colapsos súbitos e amadorismo gritante
  QUICK_STOMP: [
    {
      event: 'Guerra Anglo-Zanzibari (1896)',
      description: 'A guerra mais curta da história durou apenas 38 minutos. O sultanato de Zanzibar achou que poderia desafiar o Império Britânico; o resultado foi uma rendição antes mesmo do chá das cinco estar pronto.',
      lesson: 'Sua resistência durou menos que o tempo de cozimento de um arroz integral. Um recorde deplorável, até para os seus padrões.',
    },
    {
      event: 'Batalha de Issus (333 a.C.)',
      description: 'Dário III tinha a vantagem numérica, o terreno e o dinheiro. Alexandre, o Grande, tinha apenas um plano. Dário fugiu do campo de batalha tão rápido que esqueceu sua própria família para trás.',
      lesson: 'Ter recursos e não saber usá-los é apenas uma forma cara de passar vergonha. Alexandre agradece a facilidade.',
    },
    {
      event: 'A Queda do Império Asteca (1521)',
      description: 'Uma civilização de milhões foi desmantelada por algumas centenas de espanhóis e uma série de decisões diplomáticas catastróficas de Montezuma.',
      lesson: 'Ignorar ameaças óbvias enquanto foca em rituais inúteis é um erro clássico. Você o replicou com uma perfeição irritante.',
    },
    {
      event: 'A Quarta Cruzada (1204)',
      description: 'Os cruzados saíram para libertar Jerusalém, mas ficaram sem dinheiro, se perderam e decidiram saquear Constantinopla — uma cidade aliada. O caos foi tão absoluto que o objetivo original foi esquecido em semanas.',
      lesson: 'Perder o foco do objetivo principal para se perder em lutas laterais sem sentido: a história chama de tragédia, eu chamo de sua gameplay.',
    },
    {
      event: 'Batalha de Agincourt (1415)',
      description: 'A cavalaria francesa, pesada e arrogante, avançou por um campo de lama apenas para ser massacrada por arqueiros galeses em posição estática.',
      lesson: 'A pressa em morrer é a única coisa que superou sua falta de visão de mapa nesta partida.',
    },
    {
      event: 'O Grande Emigre (1792)',
      description: 'A aristocracia francesa achou que o exército prussiano resolveria seus problemas em dias. Foram varridos da história antes que pudessem arrumar as malas.',
      lesson: 'Esperar que terceiros salvem sua rota é um anacronismo tático que a história já puniu mil vezes.',
    },
    {
      event: 'Batalha de Panipat (1761)',
      description: 'O Império Marata esticou demais suas linhas de suprimento e foi aniquilado em um único ataque frontal coordenado.',
      lesson: 'Estar no lugar errado, na hora errada, com o posicionamento errado. A tríade do fracasso foi completada com sucesso.',
    },
    {
      event: 'Capitulação de Detroit (1812)',
      description: 'O general William Hull, aterrorizado por gritos de guerra indígenas que ele mal ouviu, entregou um forte fortificado e todo o seu exército sem disparar um único tiro contra as tropas britânicas em menor número.',
      lesson: 'Dar "FF" mental antes mesmo da luta começar é uma tradição iniciada por Hull. Você a honrou com uma covardia tática digna de nota.',
    },
    {
      event: 'Corte Marcial de William Hull (1814)',
      description: 'Hull foi o único general americano condenado à morte por covardia. Ele não perdeu por falta de meios, mas por uma paralisia absoluta da vontade diante do inimigo.',
      lesson: 'Sua hesitação em apertar qualquer botão nesta partida foi tão paralisante que Hull pareceria um herói de guerra ao seu lado.',
    },
  ],

  // Jogos longos e perdidos (> 45 min) — Teimosia suicida e agonia prolongada
  LONG_ATTRITION: [
    {
      event: 'Guerra dos Oitenta Anos (1568–1648)',
      description: 'A Espanha tentou manter o controle sobre os Países Baixos por oito décadas. Gastaram todo o ouro das Américas para, no final, perderem tudo e declararem falência três vezes.',
      lesson: 'Investir tempo e recursos em uma causa perdida não é resiliência, é incapacidade de aceitar a matemática da derrota.',
    },
    {
      event: 'Campanha de Galípoli (1915)',
      description: 'Winston Churchill idealizou um plano audacioso que resultou em meses de agonia nas trincheiras de uma praia sem saída. Meio milhão de baixas para absolutamente nada.',
      lesson: 'Parabéns. Você conseguiu transformar um simples jogo em um monumento à futilidade humana.',
    },
    {
      event: 'Guerra do Vietnã (Fase Americana)',
      description: 'A maior potência do mundo gastou bilhões de dólares e uma década tentando ganhar uma guerra que já havia sido decidida pela moral do adversário muito antes.',
      lesson: 'Sua insistência em não dar "FF" é quase poética, se não fosse tecnicamente patética.',
    },
    {
      event: 'A Retirada de Moscou (1812)',
      description: 'O Grande Exército de Napoleão entrou em Moscou esperando uma rendição. Encontraram apenas cinzas e um inverno que os caçou por meses até que não restasse quase ninguém.',
      lesson: 'Ganhar batalhas inúteis enquanto perde a guerra logística é a marca registrada dos amadores. Divirta-se no frio da derrota.',
    },
    {
      event: 'Guerra do Paraguai (1864–1870)',
      description: 'Um conflito que se arrastou até que a população masculina de um país inteiro fosse quase extinta. Uma teimosia que redefiniu o conceito de desastre.',
      lesson: 'O seu "late game" é apenas um epílogo prolongado de uma tragédia que todos os outros já previram aos 10 minutos.',
    },
    {
      event: 'Batalha de Kandahar (2001-2021)',
      description: 'Vinte anos de ocupação tática para um colapso em menos de duas semanas. O tempo não cura a falta de uma estratégia de saída.',
      lesson: 'Arrastar o jogo por 50 minutos para perder em uma luta mal feita no Baron... você é um historiador nato do masoquismo.',
    },
    {
      event: 'O Cerco de Tiro (332 a.C.)',
      description: 'Os fenícios resistiram por sete meses, construindo muralhas cada vez maiores, apenas para Alexandre construir uma ponte de terra e massacrar a todos.',
      lesson: 'Não importa o quão alto você construa sua defesa se o inimigo tem mais paciência e intelecto que você.',
    },
    {
      event: 'Campanha de Humaitá (1866-1868)',
      description: 'Francisco Solano López acreditou que poderia vencer três nações simultaneamente. Ele arrastou seu exército para um moedor de carne que durou anos, sacrificando até crianças quando os homens acabaram.',
      lesson: 'Sua insistência em não admitir a derrota transformou este jogo em um Paraguai de 1870. Um sacrifício inútil por um ego que não cabe no mapa.',
    },
    {
      event: 'Último Reduto de Cerro Corá (1870)',
      description: 'O fim da Guerra do Paraguai. Solano López morreu no barro, tendo levado seu país ao colapso total por se recusar a aceitar os termos de uma paz inevitável anos antes.',
      lesson: 'Há uma linha tênue entre "heroísmo" e "delírio de Solano López". Você cruzou essa linha aos 15 minutos e continuou correndo até os 50.',
    },
  ],

  // Muitas mortes (> 10 deaths) — Incompetência tática e sacrifício inútil
  CANNON_FODDER: [
    {
      event: 'Massacre de Katyn (1940)',
      description: 'Milhares de oficiais foram eliminados sistematicamente por um erro de julgamento sobre quem era realmente o inimigo. Uma eliminação limpa, cruel e absoluta.',
      lesson: 'Sua tela cinza é o gráfico mais estável desta partida. Uma consistência admirável na arte de morrer.',
    },
    {
      event: 'Batalha de Passchendaele (1917)',
      description: 'Soldados morreram afogados na lama antes mesmo de verem o inimigo. O comando insistia em avanços frontais em um pântano de artilharia.',
      lesson: 'Morrer dez vezes da mesma forma sugere que seu processo de aprendizado está preso em um loop medieval.',
    },
    {
      event: 'Revolta dos Boxers (1900)',
      description: 'Camponeses chineses acreditaram que rituais mofados os tornariam imunes às balas ocidentais. A realidade, infelizmente para eles, era feita de chumbo.',
      lesson: 'Acreditar que sua build "off-meta" te tornaria invencível é o tipo de pensamento mágico que eu esperava de um camponês do século XIX, não de você.',
    },
    {
      event: 'A Carga dos Três Reis (1578)',
      description: 'D. Sebastião desapareceu no deserto do Marrocos levando consigo toda a nobreza de Portugal. Uma geração inteira perdida por um delírio de grandeza.',
      lesson: 'Sua jornada solo pela jungle inimiga sem visão foi o nosso "Alcácer-Quibir". Só falta agora esperarmos o seu retorno em uma manhã de nevoeiro.',
    },
    {
      event: 'Expedição à Sicília (415 a.C.)',
      description: 'Atenas enviou sua frota mais gloriosa para uma invasão desnecessária. Foram todos mortos ou escravizados em pedreiras. Foi o fim da Era de Ouro.',
      lesson: 'O excesso de agressividade sem um objetivo claro é o caminho mais curto para a escravidão no elo baixo.',
    },
    {
      event: 'A Grande Purga (1936)',
      description: 'Stalin eliminou seus próprios generais mais talentosos por paranoia. Quando a guerra real chegou, não havia ninguém para liderar.',
      lesson: 'Você se sabotou tantas vezes nesta partida que eu comecei a suspeitar que você é um agente infiltrado do time adversário.',
    },
    {
      event: 'Desastre de Annual (1921)',
      description: 'Exército espanhol em debandada no Marrocos. 13 mil mortos em poucos dias contra tribos locais. Uma falha total de comando e nervos.',
      lesson: 'Sua "estratégia" de recuo é apenas uma fuga desordenada que dá vergonha até aos seus ancestrais.',
    },
  ],

  // Derrota padrão — Erros de julgamento e complacência
  STANDARD_DEFEAT: [
    {
      event: 'Batalha de Tsushima (1905)',
      description: 'A frota russa viajou metade do mundo apenas para ser afundada em poucas horas por uma marinha japonesa tecnicamente superior e mais bem posicionada.',
      lesson: 'Andar muito pelo mapa para não fazer nada e morrer no final. Os russos de 1905 ficariam orgulhosos do seu cosplay.',
    },
    {
      event: 'O Cisma do Ocidente (1378)',
      description: 'A Igreja teve dois papas, depois três, e ninguém sabia quem obedecer. A instituição nunca mais foi a mesma após tanta confusão interna.',
      lesson: 'Sua falta de comunicação com o time transformou o chat em um concílio de idiotas. O resultado não poderia ser outro.',
    },
    {
      event: 'Batalha de Carrhae (53 a.C.)',
      description: 'Crasso, o homem mais rico de Roma, achou que poderia comprar a vitória contra os partos. Acabou com ouro derretido despejado em sua garganta.',
      lesson: 'Ter 10k de ouro acumulado e não gastar em itens úteis? Crasso pelo menos teve a decência de morrer com o ouro.',
    },
    {
      event: 'A Queda do Muro de Berlim (1989)',
      description: 'Um sistema inteiro colapsou não por uma grande batalha, mas pela fadiga de uma estrutura que não conseguia mais se sustentar.',
      lesson: 'Sua base caiu com a mesma facilidade de uma ditadura falida. Faltou apenas o David Hasselhoff cantando sobre as ruínas.',
    },
    {
      event: 'O Incidente de Fachoda (1898)',
      description: 'Duas nações quase entraram em guerra por um pântano inútil no meio da África, apenas para uma delas perceber que não tinha como vencer e sair de fininho.',
      lesson: 'Lutar por objetivos secundários enquanto seu Nexus é exposto é uma assinatura tática deplorável.',
    },
    {
      event: 'Batalha de Lepanto (1571)',
      description: 'Uma das últimas grandes batalhas de galés. Quem não soube manobrar com o vento, acabou no fundo do Mediterrâneo.',
      lesson: 'Sua incapacidade de ler o "vento" das lutas de equipe é quase um talento para a geologia marinha.',
    },
    {
      event: 'O Tratado de Versalhes (1919)',
      description: 'Uma tentativa de paz que garantiu a próxima guerra. Uma solução tão mal planejada que o fracasso era a única saída possível.',
      lesson: 'Suas "jogadas de recuperação" apenas aceleraram o final inevitável. Foi um erro diplomático e mecânico.',
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
  'Sua gestão de recursos me lembrou Solano López: gastou tudo o que tinha e o que não tinha para terminar morto em um riacho de lama.',
  'Se William Hull visse o seu "engage", ele se sentiria confiante o suficiente para voltar ao exército.',
  'Parabéns pela resiliência. Nem o Paraguai do século XIX foi tão longe no caminho da autodestruição.',
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
