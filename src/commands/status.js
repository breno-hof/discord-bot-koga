const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { getTrackedPlayersByGuild, getGuildConfig } = require('../database/queries');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Lista os jogadores sendo monitorados neste servidor.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    const players = getTrackedPlayersByGuild(interaction.guildId);
    const guildConfig = getGuildConfig(interaction.guildId);

    if (players.length === 0) {
      return interaction.reply({
        embeds: [{
          title: '📋 Status do Monitoramento',
          description: 'Nenhum jogador está sendo monitorado neste servidor.\n\nUse `/vincular Nome#Tag` para adicionar jogadores.',
          color: 0x95a5a6,
        }],
        flags: MessageFlags.Ephemeral,
      });
    }

    const playerList = players
      .map((p, i) => `**${i + 1}.** ${p.riot_id_tag}`)
      .join('\n');

    const channelInfo = guildConfig?.notification_channel_id
      ? `<#${guildConfig.notification_channel_id}>`
      : '⚠️ Não configurado (use `/config_koga`)';

    await interaction.reply({
      embeds: [{
        title: '📋 Status do Monitoramento',
        fields: [
          {
            name: '🎮 Jogadores Monitorados',
            value: playerList,
            inline: false,
          },
          {
            name: '📢 Canal de Notificações',
            value: channelInfo,
            inline: false,
          },
        ],
        color: 0x3498db,
        footer: {
          text: `${players.length} jogador(es) sob vigilância de Koga`,
        },
      }],
      flags: MessageFlags.Ephemeral,
    });
  },
};
