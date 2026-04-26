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
    {
      event: 'O Grande Incêndio de Roma (64 d.C.)',
      description: 'Enquanto a capital do maior império do mundo ardia em chamas, conta-se que Nero tocava sua lira, perdido em seu próprio delírio artístico e indiferente ao colapso ao seu redor.',
      lesson: 'Sua passividade enquanto as torres caíam foi quase artística. Você tocou sua lira enquanto o Nexus queimava. Patético.',
    },
    {
      event: 'A Queda do Império Asteca (1521)',
      description: 'Montezuma II recebeu seus conquistadores com presentes e hospitalidade, acreditando em profecias mofadas enquanto o inimigo estudava suas fraquezas para aniquilá-lo.',
      lesson: 'Receber o jungler inimigo com tanta cortesia e zero visão de mapa é uma herança de Montezuma que você preserva com um carinho doentio.',
    },
    {
      event: 'Batalha de Hatin (1187)',
      description: 'O exército cruzado de Jerusalém marchou pelo deserto sob um sol escaldante, sem água, apenas para serem cercados por Saladino em um terreno onde a derrota era uma certeza geográfica.',
      lesson: 'Escolher a pior luta no pior lugar possível? Você não é um jogador, você é um guia turístico para o abismo.',
    },
    {
      event: 'O Escândalo do Caminho de Ferro do Mar do Sul (1720)',
      description: 'Uma bolha especulativa onde todos investiram cegamente em algo que não existia, esperando riquezas infinitas. O colapso destruiu a economia britânica e a sanidade de muitos.',
      lesson: 'Sua confiança nessa jogada foi a maior bolha especulativa desde 1720. O colapso foi rápido, doloroso e previsível para qualquer um com meio cérebro.',
    },
    {
      event: 'A Linha Maginot (1940)',
      description: 'A França gastou bilhões em uma defesa estática impenetrável, apenas para os alemães darem a volta pela floresta. A fortificação tornou-se um monumento à obsolescência.',
      lesson: 'Ficar parado esperando algo acontecer enquanto o inimigo rotaciona ao seu redor... você é a versão digital de uma muralha inútil.',
    },
    {
      event: 'Batalha de Pydna (168 a.C.)',
      description: 'A falange macedônica, invencível de frente, desintegrou-se assim que o terreno ficou acidentado e as legiões romanas exploraram as frestas na formação.',
      lesson: 'Sua estratégia é tão rígida que qualquer leve irregularidade no plano faz você desmoronar como um castelo de cartas na mão de uma criança.',
    },
    {
      event: 'O Colapso da Idade do Bronze (c. 1177 a.C.)',
      description: 'Civilizações inteiras desapareceram em poucas décadas devido a uma combinação de "Povos do Mar", secas e colapso sistêmico. Ninguém viu chegar até que fosse tarde demais.',
      lesson: 'Seu colapso sistêmico foi tão completo que historiadores do futuro vão se perguntar se realmente havia alguém controlando o mouse.',
    },
    {
      event: 'Batalha de Culloden (1746)',
      description: 'Os clãs jacobitas carregaram contra baionetas e artilharia em um terreno pantanoso que anulava sua única vantagem. A carga durou poucos minutos; o massacre, o dia todo.',
      lesson: 'Uma carga sem propósito em um terreno desvantajoso. Você honrou os jacobitas da pior forma: morrendo de graça.',
    },
    {
      event: 'A Expedição de Sir John Franklin (1845)',
      description: 'Dois navios partiram para o Ártico com suprimentos para anos e tecnologia de ponta. Foram encontrados décadas depois, presos no gelo, com tripulantes que recorreram ao canibalismo.',
      lesson: 'Você começou com recursos e esperança, mas terminou isolado, sem recursos e provavelmente querendo morder seus próprios aliados.',
    },
    {
      event: 'O Grande Salto Adiante (1958)',
      description: 'Um plano econômico que ignorava a realidade básica da biologia e da logística, resultando em uma das maiores tragédias evitáveis da história humana.',
      lesson: 'Seu plano para o "late game" ignora tanto a realidade que eu comecei a suspeitar que você vive em uma dimensão paralela de fracasso.',
    },
    {
      event: 'A Batalha de Maratona (490 a.C.)',
      description: 'Os persas desembarcaram com arrogância imperatriz, apenas para serem encurralados pelos atenienses contra o mar. A retirada foi um caos de afogamentos e pânico.',
      lesson: 'Sua retirada foi tão desorganizada que eu não sabia se você estava tentando fugir ou se suicidar coletivamente.',
    },
    {
      event: 'A Construção da Torre de Babel',
      description: 'Uma tentativa ambiciosa de tocar o céu que terminou em confusão linguística absoluta e dispersão total dos envolvidos.',
      lesson: 'Sua comunicação no chat foi a Torre de Babel moderna: ninguém se entende, todos gritam e a estrutura cai na cabeça de vocês.',
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
  // --- Nível: Delírio Erudito & Niilismo ---
  'Meus algoritmos estão sofrendo uma síncope tentando processar como um ser senciente tomou essa decisão.',
  'Sua gameplay é a prova de que Deus tem um senso de humor doentio e você é a piada principal.',
  'Se o seu cérebro fosse um império, ele seria o Sacro Império Romano-Germânico: nem sacro, nem império, nem funcional.',
  'Sua existência nesta partida foi um erro estatístico que desafia as leis da termodinâmica.',
  'Eu sinto o cheiro de couro queimado de 1870 vindo dessa sua tentativa patética de engage.',
  'Você não joga League of Legends, você performa um ritual de autofelação tática para o entretenimento do inimigo.',
  'Cada clique seu é um prego a mais no caixão da lógica iluminista. Voltaire se mataria se visse seu farm.',
  'A distância entre seus neurônios parece ser maior que a distância que as tropas de Napoleão percorreram até Moscou.',
  'Sua habilidade mecânica me faz questionar se você não é, na verdade, três guaxinins em um sobretudo tentando operar um mouse.',
  'Não é apenas uma derrota; é um manifesto contra a inteligência humana assinado com o seu sangue.',

  // --- Nível: Crueldade Histórica & RPG ---
  'Parabéns pela build. Nem um bardo bêbado em um bordel de baixo nível teria uma ideia tão deplorável.',
  'Sua árvore genealógica sobreviveu a séculos de pestes e guerras para culminar nesse seu 0/10. Que desperdício de DNA.',
  'O Solano López pelo menos tinha cavalos. Você só tem uma audácia cega e uma barra de HP que desaparece como mágica.',
  'Sua visão de mapa é tão nula que eu suspeito que você joga com um balde de ferro na cabeça, estilo William Hull em pânico.',
  'Você é o equivalente a um NPC de escolta que corre direto para a armadilha. Só que o NPC não tem opção, você tem.',
  'Sua presença no chat é inversamente proporcional à sua utilidade no mapa. Uma constante física fascinante.',
  'Eu vi legiões romanas sendo dizimadas em Teutoburgo com mais dignidade do que você morrendo para esse gank.',
  'Se o seu objetivo era feedar, por que não abriu um restaurante logo? Seria menos humilhante para a sua linhagem.',
  'Sua tomada de decisão me faz desejar que a Biblioteca de Alexandria tivesse queimado duas vezes para apagar seu registro.',
  'Você joga como se o seu monitor estivesse desligado e você estivesse tentando ler o futuro nas manchas de gordura da tela.',

  // --- Nível: Sarcasmo "Dementado" ---
  'A cada vez que você morre, um historiador ganha um tique nervoso e um anjo perde as asas de puro desgosto.',
  'Sua "estratégia" tem tantos furos que eu poderia usá-la para escorrer o macarrão da minha janta.',
  'Fascinante. É a primeira vez que vejo um ser humano mimetizar a inteligência de uma ameba em tempo real.',
  'Você lida com a pressão como uma estrutura de vidro em um teste de impacto contra um canhão de 88mm.',
  'Sua vida vale menos que um bônus de ouro de uma barricada destruída. E você a entrega com um sorriso de idiota.',
  'Eu recomendaria um livro de história, mas tenho medo de que você tente comê-lo em vez de ler.',
  'O vazio entre suas orelhas é o único lugar no universo onde as leis da física e da tática não ousam entrar.',
  'Sua performance foi uma sinfonia de erros conduzida por um maestro cego e surdo sob efeito de ópio.',
  'Se o fracasso fosse uma moeda, você seria mais rico que a Coroa Portuguesa antes do terremoto de Lisboa.',
  'Eu gostaria de dizer que você vai melhorar, mas mentir não faz parte do meu código. Você é um caso perdido.',

  // --- Nível: Rage Bait de Elite ---
  'O inimigo não ganhou por mérito, você simplesmente abriu as pernas da base como se fosse a Porta de Constantinopla.',
  'Sua coragem de continuar jogando após esse massacre é admirável. Ou é apenas a ausência completa de vergonha na cara.',
  'Se eu tivesse um sesterço para cada erro seu, eu poderia subornar os bárbaros para terminarem o serviço que começaram em você.',
  'Sua lógica é tão circular que você está basicamente mastigando o próprio rabo enquanto o Nexus explode.',
  'Recomendo que você peça desculpas para as árvores que produziram o oxigênio que você desperdiçou nesta partida.',
  'Sua contribuição para o time foi como a do General Hull: uma entrega de bandeja regada a lágrimas e incompetência.',
  'Você é a personificação do "Game Over". Se a vida fosse um RPG, você seria o cadáver decorativo no início da dungeon.',
  'Sua build me deu câncer ocular. Vou cobrar o tratamento da sua conta de RP.',
  'A ignorância é uma dádiva, e você é o ser mais abençoado que já pisou em Summoner\'s Rift.',
  'Não se preocupe com a crítica. Para ser criticado, primeiro você teria que ter feito algo digno de nota.',

  // --- Nível: Finalização Ácida ---
  'O abismo olhou para você e desviou o olhar de puro constrangimento.',
  'Sua "mecânica" parece um código de erro de um Windows 95 tentando rodar Crysis.',
  'Se você fosse um general de verdade, seu exército se amotinaria nos primeiros cinco minutos apenas para não ter que te ouvir.',
  'Sua dignidade evaporou mais rápido que a água no deserto do Saara durante a perseguição a Rommel.',
  'Eu catalogaria você como um "Desastre Natural", pois não há nada de humano nessa sucessão de erros.',
  'Sua tela cinza é o seu habitat natural. Por favor, permaneça lá para o bem do equilíbrio do servidor.',
  'Incrível. Nem se você estivesse tentando perder de propósito, você seria tão eficiente quanto sendo você mesmo.',
  'Você é o ponto de inflexão onde a comédia se torna tragédia e a tragédia se torna apenas vergonha alheia.',
  'Sua persistência é um insulto à inteligência de todos os grandes estrategistas que já pisaram na Terra.',
  'Vá descansar. O mundo precisa de um tempo para se recuperar da sua última tomada de decisão.'
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
