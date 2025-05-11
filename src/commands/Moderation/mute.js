const { SlashCommandBuilder, PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to mute.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('time')
                .setDescription('The time till they are unmuted.')
                .setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const timeString = interaction.options.getString('time');

        function getTotalTime(time) {
            if (!time) return { success: 28 * 86400000 }; // Mặc định là 28 ngày
            const match = time.match(/^(\d+)([smhd])$/);
            if (!match) return { error: 'Invalid time format. Use s, m, h, or d for seconds, minutes, hours, or days respectively.' };

            const value = parseInt(match[1]);
            const unit = match[2];
            let milliseconds;

            switch (unit) {
                case 's': milliseconds = value * 1000; break;
                case 'm': milliseconds = value * 60000; break;
                case 'h': milliseconds = value * 3600000; break;
                case 'd': milliseconds = value * 86400000; break;
                default: return { error: 'Invalid time unit. Use s, m, h, or d.' };
            }
            return { success: milliseconds };
        }

        try {
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has([Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles, Flags.ManageChannels])) {
                return interaction.reply({ content: '❌ I do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            if (!interaction.member.permissions.has([Flags.MuteMembers, Flags.ManageRoles])) {
                return interaction.reply({ content: '❌ You do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            if (member.id === interaction.user.id) {
                return interaction.reply({ content: '❌ You cannot mute yourself.', ephemeral: true });
            }

            const { error, success: time } = getTotalTime(timeString ?? '1d');
            if (error) {
                return interaction.reply({ content: `❌ Invalid time format: ${error}`, ephemeral: true });
            }

            await member.timeout(time, `${interaction.user.id} put user in timeout`);

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`✅ Successfully muted **${member.user.tag}** for **${timeString ?? '1d'}**.`);

            return interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error executing mute command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`❌ An error occurred while muting the user: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
