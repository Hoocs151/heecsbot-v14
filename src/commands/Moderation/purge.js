const { SlashCommandBuilder, PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Clear messages from a user.')
        .addStringOption(option =>
            option.setName('amount')
                .setDescription('The number of messages to clear (up to 99)')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Clear messages of a specific user')),
    async execute(interaction) {
        const amount = interaction.options.getString('amount');
        const user = interaction.options.getUser('user');

        try {
            if (!interaction.member.permissions.has(Flags.ManageMessages)) {
                return interaction.reply({ content: '\`❌\` You do not have permission to use this command.', ephemeral: true });
            }

            if (isNaN(amount) || parseInt(amount) < 1 || parseInt(amount) > 99) {
                return interaction.reply({ content: '\`❌\` Please provide a valid number between 1 and 99.', ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            let messages;
            if (user) {
                messages = await interaction.channel.messages.fetch()
                    .then(messages => messages.filter(m => m.author.id === user.id))
                    .then(messages => messages.first(parseInt(amount)));
            } else {
                messages = await interaction.channel.messages.fetch({ limit: parseInt(amount) });
            }

            const deletedMessages = await interaction.channel.bulkDelete(messages, true);

            const deletedSize = deletedMessages.size;
            const deletedUser = user ? user.username : 'everyone';

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`\`✅\` Successfully deleted ${deletedSize} messages sent by ${deletedUser}.`);

            return interaction.followUp({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error executing purge command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`\`❌\` An error occurred while deleting the messages: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
