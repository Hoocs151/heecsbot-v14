const { SlashCommandBuilder, PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

const slowmodeDurations = [
    { name: 'OFF', value: 0 },
    { name: '5 seconds', value: 5 },
    { name: '10 seconds', value: 10 },
    { name: '15 seconds', value: 15 },
    { name: '30 seconds', value: 30 },
    { name: '1 minute', value: 60 },
    { name: '2 minutes', value: 120 },
    { name: '5 minutes', value: 300 },
    { name: '10 minutes', value: 600 },
    { name: '15 minutes', value: 900 },
    { name: '30 minutes', value: 1800 },
    { name: '1 hour', value: 3600 },
    { name: '2 hours', value: 7200 },
    { name: '6 hours', value: 21600 },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Enables or disables slow mode on a channel.')
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Select the duration for slowmode')
                .setRequired(true)
                .addChoices(
                    slowmodeDurations.map(duration => ({
                        name: duration.name,
                        value: duration.value.toString()
                    }))
                )
        ),
    async execute(interaction) {
        const duration = parseInt(interaction.options.getString('duration'), 10);
        const channel = interaction.channel;

        // Check user permissions
        if (!interaction.member.permissions.has(Flags.ManageChannels)) {
            return interaction.reply({ content: '\`❌\` You do not have the necessary permissions to execute this command.', ephemeral: true });
        }

        // Check bot permissions
        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has([Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels])) {
            return interaction.reply({ content: '\`❌\` I do not have the necessary permissions to execute this command.', ephemeral: true });
        }

        // Activate slowmode
        try {
            await channel.setRateLimitPerUser(duration);
            const successEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setDescription(`\`✅\` Slowmode has been ${duration === 0 ? 'disabled' : `set to ${slowmodeDurations.find(d => d.value === duration).name}`}.`);
            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Command: 'slowmode' has error: ${err.message}.`);
            const errorEmbed = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while setting slowmode: ${err.message}`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
