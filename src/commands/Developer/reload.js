const { Client, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const handleCommands = require('../../functions/handleCommands');
const handleEvents = require('../../functions/handleEvents');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload the commands or events.')
        .addSubcommand(subcommand => 
            subcommand.setName('commands').setDescription('Reload your commands.')
        )
        .addSubcommand(subcommand => 
            subcommand.setName('events').setDescription('Reload your events.')
        ),

    async execute(interaction, client) {
        const { user } = interaction;
        const sub = interaction.options.getSubcommand();
        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        try {
            switch (sub) {
                case 'commands': {
                    handleCommands(client);
                    embed.setTitle('`🔄` Commands Reloaded')
                          .setDescription('All commands have been successfully reloaded.');
                    interaction.reply({ embeds: [embed] });
                    console.log(`[Reload] ${user.tag} (ID: ${user.id}) has reloaded the commands.`);
                    break;
                }
                case 'events': {
                    handleEvents(client);
                    embed.setTitle('`🔄` Events Reloaded')
                          .setDescription('All events have been successfully reloaded.');
                    interaction.reply({ embeds: [embed] });
                    console.log(`[Reload] ${user.tag} (ID: ${user.id}) has reloaded the events.`);
                    break;
                }
                default: {
                    interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
                    console.error(`[Reload] ${user.tag} (ID: ${user.id}) attempted to use an invalid subcommand.`);
                    break;
                }
            }
        } catch (error) {
            embed.setTitle('`⚠️` Error')
                  .setDescription(`An error occurred while reloading: ${error.message}`)
                  .setColor('#FF0000');
            interaction.reply({ embeds: [embed] });
            console.error(`[Reload] Error occurred: ${error.message}`);
        }
    }
}
