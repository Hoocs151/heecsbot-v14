const { Interaction, EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const BlackListGuild = require("./../schemas/BlackListGuild");
const BlackListUser = require("./../schemas/BlackListUser");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const color = {
            red: '\x1b[31m',
            orange: '\x1b[38;5;202m',
            yellow: '\x1b[33m',
            green: '\x1b[32m',
            blue: '\x1b[34m',
            reset: '\x1b[0m'
        }

        function getTimestamp() {
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({
                content: `This Command is Outdated.`,
                ephemeral: true,
            });
        }

        if (command.developer && interaction.user.id !== "627013557695021087") {
            return interaction.reply({
                content: `This Command Is only for developers`,
                ephemeral: true,
            });
        }

        const Embed = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTimestamp();

        try {
            const GuildData = await BlackListGuild.findOne({ Guild: interaction.guild.id }).catch(() => {});
            const UserData = await BlackListUser.findOne({ User: interaction.user.id }).catch(() => {});

            if (GuildData) {
                return interaction.reply({
                    embeds: [
                        Embed.setTitle(`Server Blacklisted`)
                            .setDescription(`Your server has been blacklisted from using this bot on <t:${parseInt(GuildData.Time / 1000)}:R>, for the reason: **${GuildData.Reason}**`)
                    ],
                    ephemeral: true,
                });
            }

            if (UserData) {
                return interaction.reply({
                    embeds: [
                        Embed.setTitle(`User Blacklisted`)
                            .setDescription(`You have been blacklisted from using this bot on <t:${parseInt(UserData.Time / 1000)}:R>, for the reason: **${UserData.Reason}**`)
                    ],
                    ephemeral: true,
                });
            }

            await command.execute(interaction, client);
        } catch (error) {
            console.error(`${color.red}[${getTimestamp()}] [INTERACTION_CREATE] Error while executing command. \n${color.red}[${getTimestamp()}] [INTERACTION_CREATE] Please check you are using the correct execute method: "async execute(interaction, client)":`, error);

            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`There was an error while executing this command!\n\`\`\`${error}\`\`\``);

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
