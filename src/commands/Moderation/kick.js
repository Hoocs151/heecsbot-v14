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
  
  sendEmbed: async (interaction, color, description, footerText, success = false) => {
    const embed = new EmbedBuilder()
      .setColor(color || '#FF0000')
      .setDescription(description || 'No description provided')
      .setFooter({ text: footerText || 'No footer text' })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed], ephemeral: !success });
  },

  async execute(interaction, client) {
    if (!interaction.inGuild()) {
      return this.sendEmbed(interaction, client.config.embedERROR, '`❌` You can only run this command in a server.', 'This command cannot be used in direct messages.');
    }
  
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return this.sendEmbed(interaction, client.config.embedERROR, '`❌` Only server admins can run this command.', 'Make sure you have the appropriate permissions.');
    }
  
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return this.sendEmbed(interaction, client.config.embedERROR, '`❌` I do not have Kick Members permissions.', 'Please grant me the necessary permissions and try again.');
    }
  
    const targetUserId = interaction.options.getUser('user').id;
    const reason = interaction.options.getString('reason') || 'No reason provided';
  
    // Check if the interaction was already replied to
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply(); // Use deferReply if needed.
    }
  
    const targetUser = await interaction.guild.members.fetch(targetUserId);
    if (!targetUser) {
      return this.sendEmbed(interaction, client.config.embedERROR, "`❌` That user doesn't exist in this server.", 'Please make sure the user is a member of this server.');
    }
  
    if (targetUser.id === interaction.guild.ownerId) {
      return this.sendEmbed(interaction, client.config.embedERROR, "`❌` You can't kick the server owner.", 'Server owners cannot be kicked or banned.');
    }
  
    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;
  
    if (targetUserRolePosition >= requestUserRolePosition) {
      return this.sendEmbed(interaction, client.config.embedERROR, "`❌` You can't kick that user because they have the same/higher role than you.", 'You can only kick users with a lower role than yours.');
    }
  
    if (targetUserRolePosition >= botRolePosition) {
      return this.sendEmbed(interaction, client.config.embedERROR, "`❌` I can't kick that user because they have the same/higher role than me.", 'I need a higher role to kick this user.');
    }
  
    try {
      await targetUser.kick(reason);
      const embed = new EmbedBuilder()
        .setColor(client.config.embedSuccess || '#00FF00')
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
      return this.sendEmbed(interaction, client.config.embedERROR, '`❌` An error occurred while trying to kick the user. Please try again later.', 'Contact the server admin if the issue persists.');
    }
  }  
};
