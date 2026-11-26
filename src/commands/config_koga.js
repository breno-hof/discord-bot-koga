const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, InteractionContextType, MessageFlags } = require('discord.js');
const { upsertGuildConfig } = require('../database/queries');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config_koga')
    .setDescription('Define o canal onde o Koga enviará suas análises de derrotas.')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal de texto para receber as análises')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('canal');

    upsertGuildConfig(interaction.guildId, channel.id);

    await interaction.reply({
      embeds: [{
        title: '⚙️ Configuração Atualizada',
        description: `As análises de derrotas serão enviadas em ${channel}.\n\n*Koga está de olho. Que comecem as tragédias.*`,
        color: 0x2b2d31,
        footer: { text: 'Koga — Analista de Estratégia e Historiador do Fracasso' },
      }],
      flags: MessageFlags.Ephemeral,
    });
  },
};
