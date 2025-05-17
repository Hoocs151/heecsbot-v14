const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji-list')
    .setDescription('List all server emojis')
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ViewChannel |
      PermissionFlagsBits.SendMessages |
      PermissionFlagsBits.EmbedLinks
    ),

  async execute(interaction) {
    const { guild, user, client } = interaction;

    const botMember = guild.members.me;

    if (!botMember.permissions.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({
        content: '❌ I do not have permission to send messages in this channel.',
        ephemeral: true,
      });
    }

    if (!botMember.permissions.has(PermissionFlagsBits.EmbedLinks)) {
      return interaction.reply({
        content: '❌ I need the Embed Links permission to send embeds.',
        ephemeral: true,
      });
    }

    const emojis = guild.emojis.cache.map(e =>
      e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`
    );

    if (emojis.length === 0) {
      return interaction.reply({
        content: '❌ This server has no emojis to display.',
        ephemeral: true,
      });
    }

    const chunkArray = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const total = emojis.length;
    const animated = guild.emojis.cache.filter(e => e.animated).size;
    const regular = total - animated;

    const chunked = chunkArray(emojis, 40);

    const embedBase = new EmbedBuilder()
      .setColor(client.config?.embedSuccess || 'Purple')
      .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    // First embed with title
    const firstEmbed = EmbedBuilder.from(embedBase)
      .setTitle(`Server Emojis — ${regular} Regular, ${animated} Animated, ${total} Total`)
      .setDescription(chunked[0].join(' '));

    await interaction.reply({ embeds: [firstEmbed] });

    // Send rest as followups without title
    for (let i = 1; i < chunked.length; i++) {
      const embed = EmbedBuilder.from(embedBase)
        .setDescription(chunked[i].join(' '));
      await interaction.followUp({ embeds: [embed] });
    }
  },
};
