const { Client, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        const { user, member } = interaction;

        const sub = interaction.options.getSubcommand();
        const embed = new EmbedBuilder()
            .setColor(client.config.embedSuccess || '#2f3136')
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
        
        try {
            const confirmationEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('Confirmation')
                .setDescription(`Are you sure you want to reload the ${sub}?`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ embeds: [confirmationEmbed], components: [row], flags: 64 });

            const filter = i => ['confirm', 'cancel'].includes(i.customId) && i.user.id === user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm') {
                    if (sub === 'commands') {
                        await handleCommands(client);
                        embed.setTitle('`🔄` Commands Reloaded')
                            .setDescription('All commands have been successfully reloaded.');
                        console.log(`[Reload] ${user.tag} (ID: ${user.id}) has reloaded the commands.`);
                    } else if (sub === 'events') {
                        await handleEvents(client);
                        embed.setTitle('`🔄` Events Reloaded')
                            .setDescription('All events have been successfully reloaded.');
                        console.log(`[Reload] ${user.tag} (ID: ${user.id}) has reloaded the events.`);
                    }

                    await i.update({ embeds: [embed], components: [], flags: 64 });
                } else if (i.customId === 'cancel') {
                    await i.update({ content: 'Reload action cancelled.', embeds: [], components: [], flags: 64 });
                    console.log(`[Reload] ${user.tag} (ID: ${user.id}) cancelled the reload action.`);
                }
                collector.stop();
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Reload action timed out.', embeds: [], components: [], flags: 64 });
                }
            });

        } catch (error) {
            embed.setTitle('`⚠️` Error')
                .setDescription(`An error occurred while reloading: ${error.message}`)
                .setColor(client.config.embedERROR || '#FF0000');
            await interaction.reply({ embeds: [embed], flags: 64 });
            console.error(`[Reload] Error occurred: ${error.message}`);
        }
    }
};
