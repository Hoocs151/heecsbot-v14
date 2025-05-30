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
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has([Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles])) {
                return interaction.reply({ 
                    content: '\`❌\` I lack the necessary permissions to execute this command.', 
                    flags: 64
                });
            }

            if (!interaction.member.permissions.has([Flags.MuteMembers, Flags.ManageRoles])) {
                return interaction.reply({ 
                    content: '\`❌\` You do not have the necessary permissions to unmute users.', 
                    flags: 64
                });
            }

            if (member.id === interaction.user.id) {
                return interaction.reply({ content: '\`❌\` You cannot unmute yourself.', flags: 64 });
            }

            await member.timeout(null, `✅ ${interaction.user.tag} removed user from timeout`);

            const successEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setDescription(`\`✅\` Successfully unmuted ${member.user.tag}.`);

            return interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error executing unmute command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while unmuting the user: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    },
};
