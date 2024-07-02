const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Replies with pong`),
    async execute(interaction) {
        const { user } = interaction;

        await interaction.reply({ content: "Sent message in channel", ephemeral: true})
        await interaction.channel.send({ content: 'Pong!'})
    }
}