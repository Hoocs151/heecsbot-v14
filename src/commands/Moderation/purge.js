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
        
        if (!interaction.member.permissions.has(Flags.ManageMessages)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: 64 });
        }

        const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 99) {
            return interaction.reply({ content: '❌ Please provide a valid number between 1 and 99.', flags: 64 });
        }

        try {
            await interaction.deferReply({ flags: 64 });

            let messages;
            if (user) {
                messages = await interaction.channel.messages.fetch({ limit: 100 });
                messages = messages.filter(m => m.author.id === user.id).first(parsedAmount);
            } else {
                messages = await interaction.channel.messages.fetch({ limit: parsedAmount });
            }

            const deletedMessages = await interaction.channel.bulkDelete(messages, true);

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully deleted ${deletedMessages.size} messages${user ? ` sent by ${user.username}` : ''}.`);

            return interaction.followUp({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error executing purge command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`❌ An error occurred while deleting the messages: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    },
};
