const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Sends a message via the bot, either to a channel or a user')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('type')
            .setDescription('Select message type')
            .setRequired(true)
            .addChoices(
                { name: 'Channel', value: 'channel' },
                { name: 'Direct Message', value: 'dm' }
            )
        )
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The channel to send the message to (if type is Channel)')
            .setRequired(false)
        )
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The user to send the message to (if type is Direct Message)')
            .setRequired(false)
        ),

    async execute(interaction) {
        const client = interaction.client;

        const type = interaction.options.getString('type');
        const channel = interaction.options.getChannel('channel');
        const user = interaction.options.getUser('user');

        // Ensure only relevant option is provided
        if (type === 'channel' && !channel) {
            return interaction.reply({ content: 'You must specify a channel when type is set to Channel.', ephemeral: true });
        }
        if (type === 'dm' && !user) {
            return interaction.reply({ content: 'You must specify a user when type is set to Direct Message.', ephemeral: true });
        }
        if (type === 'channel' && user) {
            return interaction.reply({ content: 'You cannot specify a user when type is set to Channel.', ephemeral: true });
        }
        if (type === 'dm' && channel) {
            return interaction.reply({ content: 'You cannot specify a channel when type is set to Direct Message.', ephemeral: true });
        }

        const targetChannel = type === 'channel' ? channel : null;

        const sendModal = new ModalBuilder()
            .setCustomId('send')
            .setTitle('Send a Message');

        const messageInput = new TextInputBuilder()
            .setCustomId('message')
            .setLabel('Message')
            .setPlaceholder('Type your message here...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const embedInput = new TextInputBuilder()
            .setCustomId('embed')
            .setLabel('Embed mode (on/off)')
            .setPlaceholder('on/off')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const actionRow1 = new ActionRowBuilder().addComponents(messageInput);
        const actionRow2 = new ActionRowBuilder().addComponents(embedInput);

        sendModal.addComponents(actionRow1, actionRow2);

        await interaction.showModal(sendModal);

        try {
            const response = await interaction.awaitModalSubmit({ time: 300000 });
            const messageContent = response.fields.getTextInputValue('message');
            const embedMode = response.fields.getTextInputValue('embed')?.toLowerCase();

            const embed = new EmbedBuilder()
                .setDescription(messageContent)
                .setColor('#4052d6');

            // Validate embed mode input
            if (embedMode && !['on', 'off'].includes(embedMode)) {
                return response.reply({ content: 'Invalid embed mode. Please enter "on" or "off".', ephemeral: true });
            }

            if (type === 'channel') {
                if (embedMode === 'on') {
                    await targetChannel.send({ embeds: [embed] });
                } else {
                    await targetChannel.send(messageContent);
                }
            } else if (type === 'dm') {
                if (embedMode === 'on') {
                    await user.send({ embeds: [embed] });
                } else {
                    await user.send(messageContent);
                }
            }

            await response.reply({ content: 'Your message has been successfully sent.', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'An error occurred while sending the message.', ephemeral: true });
        }
    }
};
