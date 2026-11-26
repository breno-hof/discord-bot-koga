const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { getPuuidByRiotId } = require('../services/RiotApiService');
const { addTrackedPlayer } = require('../database/queries');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vincular')
    .setDescription('Adiciona um jogador de LoL à lista de monitoramento deste servidor.')
    .setContexts(InteractionContextType.Guild)
    .addStringOption(option =>
      option
        .setName('riot_id')
        .setDescription('O Riot ID do jogador no formato Nome#Tag (ex: Faker#KR1)')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const riotIdInput = interaction.options.getString('riot_id').trim();

    // Validar formato Nome#Tag
    const parts = riotIdInput.split('#');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return interaction.editReply({
        embeds: [{
          title: '❌ Formato Inválido',
          description: 'O Riot ID deve estar no formato **Nome#Tag** (ex: `Faker#KR1`).',
          color: 0xe74c3c,
        }],
      });
    }

    const [gameName, tagLine] = parts;

    try {
      const accountData = await getPuuidByRiotId(gameName, tagLine);
      const riotIdTag = `${accountData.gameName}#${accountData.tagLine}`;

      const added = addTrackedPlayer(accountData.puuid, riotIdTag, interaction.guildId);

      if (!added) {
        return interaction.editReply({
          embeds: [{
            title: 'ℹ️ Jogador Já Monitorado',
            description: `**${riotIdTag}** já está na lista de monitoramento deste servidor.`,
            color: 0x95a5a6,
          }],
        });
      }

      await interaction.editReply({
        embeds: [{
          title: '🔗 Jogador Vinculado',
          description: `**${riotIdTag}** foi adicionado à lista de monitoramento.\n\n*Koga já está preparando o obituário estratégico.*`,
          color: 0x2ecc71,
          footer: { text: 'Koga — Analista de Estratégia e Historiador do Fracasso' },
        }],
      });
    } catch (error) {
      if (error.message === 'RIOT_NOT_FOUND') {
        return interaction.editReply({
          embeds: [{
            title: '🔍 Jogador Não Encontrado',
            description: `Não foi possível encontrar o jogador **${riotIdInput}**.\n\nVerifique se o Riot ID está correto e tente novamente.`,
            color: 0xe74c3c,
          }],
        });
      }
      if (error.message === 'RIOT_RATE_LIMIT') {
        return interaction.editReply({
          embeds: [{
            title: '⏳ Muitas Requisições',
            description: 'A Riot API está limitando as requisições no momento. Tente novamente em alguns instantes.',
            color: 0xe67e22,
          }],
        });
      }
      if (error.message === 'RIOT_KEY_EXPIRED') {
        return interaction.editReply({
          embeds: [{
            title: '🔑 Erro de Autenticação',
            description: 'A chave da Riot API expirou. Contate o administrador do bot.',
            color: 0xe74c3c,
          }],
        });
      }
      console.error('Erro ao vincular jogador:', error);
      return interaction.editReply({
        embeds: [{
          title: '❌ Erro Inesperado',
          description: 'Ocorreu um erro ao tentar vincular o jogador. Tente novamente mais tarde.',
          color: 0xe74c3c,
        }],
      });
    }
  },
};
