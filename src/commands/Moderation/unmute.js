const { SlashCommandBuilder, PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to unmute.')
                .setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember('user');

        try {
            // Check bot permissions
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has([Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles])) {
                return interaction.reply({ content: '\`❌\` I do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            // Check user permissions
            if (!interaction.member.permissions.has([Flags.MuteMembers, Flags.ManageRoles])) {
                return interaction.reply({ content: '\`❌\` You do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            // Check if the user is trying to unmute themselves
            if (member.id === interaction.user.id) {
                return interaction.reply({ content: '\`❌\` You cannot unmute yourself.', ephemeral: true });
            }

            // Unmute the member
            await member.timeout(null, `\`✅\` ${interaction.user.id} removed user from timeout`);

            const successEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setDescription(`\`✅\` Successfully unmuted ${member.user.tag}.`);

            return interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error executing unmute command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor(client.config.embedERROR)
                .setDescription(`\`❌\` An error occurred while unmuting the user: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
