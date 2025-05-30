const { EmbedBuilder, Events } = require('discord.js');
const { AFKSchema } = require('../schemas/AFK');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (
            message.author.bot || !message.guild || message.system || message.webhookId
        )
            return;

        try {
            let afkData = await AFKSchema.findOne({
                guild: message.guild.id,
                user: message.author.id
            });

            if (afkData) {
                await AFKSchema.deleteOne({
                    guild: message.guild.id,
                    user: message.author.id
                });

                const welcomeBackMessage = new EmbedBuilder()
                    .setColor(client.config.embedSuccess)
                    .setDescription(`\`✅\` Welcome back, ${message.author.username}! I have removed your AFK status.`)
                    .setTimestamp();

                message.reply({ embeds: [welcomeBackMessage], ephemeral: true });
            }

            for (const user of message.mentions.users.values()) {
                const mentionedAFK = await AFKSchema.findOne({
                    guild: message.guild.id,
                    user: user.id
                });

                if (mentionedAFK) {
                    const afkMentionMessage = new EmbedBuilder()
                        .setColor(client.config.embedWarning)
                        .setDescription(`\`💤\` ${user.username} is currently AFK. Reason: ${mentionedAFK.reason || 'No reason provided.'}`)
                        .setTimestamp();

                    message.reply({ embeds: [afkMentionMessage], ephemeral: true });
                }
            }
        } catch (error) {
            console.error(`Error handling AFK status: ${error.message}`);
        }

        if (!message.content.startsWith(client.config.prefix)) return;
        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);

        const color = {
            red: '\x1b[31m',
            orange: '\x1b[38;5;202m',
            yellow: '\x1b[33m',
            green: '\x1b[32m',
            blue: '\x1b[34m',
            reset: '\x1b[0m'
        };

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

        let cmd = args.shift().toLowerCase();
        if (cmd.length === 0) return;

        let command = client.pcommands.get(cmd);
        if (!command) command = client.pcommands.get(client.aliases.get(cmd));

        if (!command) {
            try {
                const embed = new EmbedBuilder()
                    .setColor(client.config.embedError)
                    .setTitle(`${client.user.username} prefix system`)
                    .setDescription(`> The command you tried **does not exist**. \n> To see **all** commands, use \`\`/help\`\``);

                return message.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                client.logs.error(`[PREFIX_ERROR] Error sending 'cannot find prefix' embed.`, error);
            }
        }

        if (!command) return;

        if (command.args && !args.length) {
            return message.reply(`You **didn't** provide any \`\`arguments\`\`.`);
        }

        try {
            command.execute(message, client, args);
        } catch (error) {
            console.error(`${color.red}[${getTimestamp()}] [MESSAGE_CREATE] Error while executing command. \n${color.red}[${getTimestamp()}] [MESSAGE_CREATE] Please check you are using the correct execute method: "async execute(message, client, args)":`, error);

            const embed = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`There was an error while executing this command!\n\`\`\`${error}\`\`\``);

            await message.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
