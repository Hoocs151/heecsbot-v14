const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('📨 Sends a message via the bot, either to a channel or a user')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('type')
            .setDescription('Select message type')
            .setRequired(true)
            .addChoices(
                { name: '📢 Channel', value: 'channel' },
                { name: '📩 Direct Message', value: 'dm' }
            )
        )
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The channel to send the message to (if type is Channel)')
            .addChannelTypes(ChannelType.GuildText)
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
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` You must specify a channel when type is set to Channel.')], ephemeral: true });
        }
        if (type === 'dm' && !user) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` You must specify a user when type is set to Direct Message.')], ephemeral: true });
        }
        if (type === 'channel' && user) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` You cannot specify a user when type is set to Channel.')], ephemeral: true });
        }
        if (type === 'dm' && channel) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` You cannot specify a channel when type is set to Direct Message.')], ephemeral: true });
        }

        const sendModal = new ModalBuilder()
            .setCustomId('send')
            .setTitle('✉️ Send a Message');

        const messageInput = new TextInputBuilder()
            .setCustomId('message')
            .setLabel('Message')
            .setPlaceholder('Type your message here...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const embedModeInput = new TextInputBuilder()
            .setCustomId('embed_mode')
            .setLabel('Embed mode (on/off)')
            .setPlaceholder('on/off')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const embedTitleInput = new TextInputBuilder()
            .setCustomId('embed_title')
            .setLabel('Embed Title (optional)')
            .setPlaceholder('Enter a title for the embed...')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const embedColorInput = new TextInputBuilder()
            .setCustomId('embed_color')
            .setLabel('Embed Color (optional)')
            .setPlaceholder('#4052d6')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const actionRow1 = new ActionRowBuilder().addComponents(messageInput);
        const actionRow2 = new ActionRowBuilder().addComponents(embedModeInput);
        const actionRow3 = new ActionRowBuilder().addComponents(embedTitleInput);
        const actionRow4 = new ActionRowBuilder().addComponents(embedColorInput);

        sendModal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

        await interaction.showModal(sendModal);

        try {
            const response = await interaction.awaitModalSubmit({ time: 300000 });
            const messageContent = response.fields.getTextInputValue('message');
            const embedMode = response.fields.getTextInputValue('embed_mode')?.toLowerCase();
            const embedTitle = response.fields.getTextInputValue('embed_title');
            let embedColor = response.fields.getTextInputValue('embed_color') || client.config.embedSuccess || '#4052d6';

            // Validate embed mode input
            if (embedMode && !['on', 'off'].includes(embedMode)) {
                return response.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` Invalid embed mode. Please enter "on" or "off".')], ephemeral: true });
            }

            // Validate color format
            const colorPattern = /^#[0-9A-F]{6}$/i;
            if (!colorPattern.test(embedColor)) {
                embedColor = client.config.embedSuccess || '#4052d6'; // Fallback to default color if invalid
                await response.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` Invalid color format. Using default color.')], ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setDescription(messageContent)
                .setColor(embedColor)
                .setFooter({ text: 'Sent via bot 📬' })
                .setTimestamp();

            if (embedTitle) {
                embed.setTitle(embedTitle);
            }

            if (type === 'channel') {
                if (embedMode === 'on') {
                    await channel.send({ embeds: [embed] });
                } else {
                    await channel.send(messageContent);
                }
            } else if (type === 'dm') {
                if (embedMode === 'on') {
                    await user.send({ embeds: [embed] });
                } else {
                    await user.send(messageContent);
                }
            }

            await response.reply({ embeds: [new EmbedBuilder().setColor(client.config.embedSuccess).setDescription('\`✅\` Your message has been successfully sent.')], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ embeds: [new EmbedBuilder().setColor(client.config.embedERROR).setDescription('\`❌\` An error occurred while sending the message.')], ephemeral: true });
        }
    }
};
