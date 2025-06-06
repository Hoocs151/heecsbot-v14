const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AFKSchema } = require('../../schemas/AFK');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set yourself AFK on the server.')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The AFK reason.')
                .setRequired(false)),
    developer: false,
    async execute(interaction) {
        const reasonInput = interaction.options.getString('reason') || null;

        try {
            let data = await AFKSchema.findOne({
                guild: interaction.guild.id,
                user: interaction.user.id
            });

            if (!data) {
                data = new AFKSchema({
                    guild: interaction.guild.id,
                    user: interaction.user.id,
                    reason: reasonInput
                });

                await data.save();

                const replyMessage = new EmbedBuilder()
                    .setColor(client.config.embedSuccess)
                    .setDescription(`\`✅\` I have set you AFK${reasonInput ? ` with the reason: **${reasonInput}**` : ''}`)
                    .setTimestamp();

                return interaction.reply({ embeds: [replyMessage], flags: 64 });
            } else {
                const alreadyAfkMessage = new EmbedBuilder()
                    .setColor(client.config.embedError)
                    .setDescription(`\`❌\` You already set yourself AFK. To stop this from happening, send a message in any channel!`)
                    .setTimestamp();

                return interaction.reply({ embeds: [alreadyAfkMessage], flags: 64 });
            }
        } catch (error) {
            console.error(`Error executing AFK command: ${error.message}`);

            const errorMessage = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while setting you AFK. Please try again later.`)
                .setTimestamp();

            return interaction.reply({ embeds: [errorMessage], flags: 64 });
        }
    }
};
