const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
const { embedColor } = require("../../config");
const { error } = require("../../utils/logs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bug-report")
        .setDescription("Report a bug in the bot"),
    
    async execute(interaction, client) {
        const user = interaction.user.id;
        const guild = interaction.guild;

        let modal = createModal();
        await interaction.showModal(modal);

        try {
            let response = await interaction.awaitModalSubmit({ time: 600000 });
            let message = response.fields.getTextInputValue('report');

            const bugEmbed = createEmbedForDev(client, guild, user, message);
            const userEmbed = createEmbedForUser(client, guild, user, message);
            const channelEmbed = createEmbedForChannel(message);

            await sendBugReport(client, bugEmbed, channelEmbed, userEmbed, interaction);
            await response.reply({ embeds: [channelEmbed], flags: 64 });

        } catch (err) {
            client.logs.error(err);
            await interaction.reply({ content: "An error occurred while submitting the bug report.", flags: 64 });
        }
    }
};

function createModal() {
    let textInput = new TextInputBuilder()
        .setCustomId('report')
        .setPlaceholder('Type your issue here')
        .setLabel('Bug Report - Issue')
        .setMaxLength(300)
        .setMinLength(5)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    let report = new ActionRowBuilder().addComponents(textInput);

    return new ModalBuilder()
        .setCustomId('report')
        .setTitle('Report a bug')
        .addComponents(report);
}

function createEmbedForDev(client, guild, user, message) {
    return new EmbedBuilder()
        .setTitle(`New Bug Report from ${user}`)
        .setDescription(`Bug report from ${user}: \n> **${message}**`)
        .setColor(client.config.embedDev)
        .setFields({ name: "User: ", value: `<@${user}>`, inline: false })
        .setFooter({ text: `Bug report sent from ${guild.name}`, iconURL: guild.iconURL({ size: 1024 }) })
        .setTimestamp();
}

function createEmbedForUser(client, guild, user, message) {
    return new EmbedBuilder()
        .setTitle(`Thank you for your bug report`)
        .setThumbnail(client.user.avatarURL())
        .setDescription(`Thank you for reporting: \n> **${message}**`)
        .setColor(client.config.embedColor)
        .setFooter({ text: `Bug report sent from ${guild.name}`, iconURL: guild.iconURL({ size: 1024 }) })
        .setTimestamp();
}

function createEmbedForChannel(message) {
    return new EmbedBuilder()
        .setTitle(`Bug Report Received`)
        .setDescription(`Thank you for the bug report: \n> **${message}**`)
        .setColor(embedColor)
        .setTimestamp();
}

async function sendBugReport(client, bugEmbed, channelEmbed, userEmbed, interaction) {
    const channel = interaction.client.channels.cache.get(client.config.bugReportChannel);

    try {
        await channel.send({ embeds: [bugEmbed] });
    } catch (err) {
        interaction.user.send({ content: "Failed to send the bug report to the developers." }).catch(() => {});
    }

    try {
        await interaction.user.send({ embeds: [userEmbed] });
    } catch (err) {
        interaction.user.send({ content: "Failed to send the bug report confirmation." }).catch(() => {});
    }
}
