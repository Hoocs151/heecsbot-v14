const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    async execute(message, client) {

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Help - ${client.user.username}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTitle('Available Commands:')
            .setDescription('Use the command prefix to invoke commands. For example, `/help`.')
            .setColor(0x00FFFF)
            .addFields(
                { 
                    name: '<:info:1089225972693348362> INFORMATION:', 
                    value: '```Please use /help :(```', 
                    inline: false 
                },
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.avatarURL() });

        message.channel.send({ embeds: [embed] });
    }
};
