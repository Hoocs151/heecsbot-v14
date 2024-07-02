const { Client, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const handleCommands = require('../../functions/handleCommands');
const handleEvents = require('../../functions/handleEvents');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload the commands oder events.')
        .addSubcommand(subcommand => subcommand.setName('commands').setDescription('Reload your commands.'))
        .addSubcommand(subcommand => subcommand.setName('events').setDescription('Reload your events.')),

    async execute(interaction, client) {
        const { user } = interaction;

        const sub = interaction.options.getSubcommand()
        const embed = new EmbedBuilder()
            .setColor('#2f3136')
        
        switch (sub) {
            case 'commands': {
                handleCommands(client);
                interaction.reply({ embeds: [embed.setDescription('Commands Reloaded!')] });
                console.log(`${user.username} has reloaded the commands. (User ID: ${user})`);
            }
            break;
            case 'events': {
                handleEvents(client);
                interaction.reply({ embeds: [embed.setDescription('Events Reloaded!')] });
                console.log(`${user.username} has reloaded the events. (User ID: ${user})`);
            }
            break;
        }
    }
}