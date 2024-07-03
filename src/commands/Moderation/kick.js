const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription("Kick a user")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for kicking the user')
        .setRequired(false)),
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription('`❌` Only server admins can run this command.')
        .setFooter({ text: 'Make sure you have the appropriate permissions.' })
        .setTimestamp();
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription('`❌` I do not have Kick Members permissions.')
        .setFooter({ text: 'Please grant me the necessary permissions and try again.' })
        .setTimestamp();
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (!interaction.inGuild()) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription('`❌` You can only run this command in a server.')
        .setFooter({ text: 'This command cannot be used in direct messages.' })
        .setTimestamp();
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const targetUserId = interaction.options.getUser('user').id;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription("`❌` That user doesn't exist in this server.")
        .setFooter({ text: 'Please make sure the user is a member of this server.' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription("`❌` You can't kick the server owner.")
        .setFooter({ text: 'Server owners cannot be kicked or banned.' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription("`❌` You can't kick that user because they have the same/higher role than you.")
        .setFooter({ text: 'You can only kick users with a lower role than yours.' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription("`❌` I can't kick that user because they have the same/higher role than me.")
        .setFooter({ text: 'I need a higher role to kick this user.' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    try {
      await targetUser.kick(reason);
      const embed = new EmbedBuilder()
        .setColor(client.config.embedSuccess)
        .setDescription(`\`✅\` User ${targetUser} was kicked.`)
        .addFields(
          { name: 'User', value: `${targetUser}`, inline: false },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: `${interaction.member}`, inline: false }
        )
        .setFooter({ text: 'Kick action successful.' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`There was an error when kicking: ${error}`);
      const embed = new EmbedBuilder()
        .setColor(client.config.embedERROR)
        .setDescription('`❌` An error occurred while trying to kick the user. Please try again later.')
        .setFooter({ text: 'Contact the server admin if the issue persists.' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
