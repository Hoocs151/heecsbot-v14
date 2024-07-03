const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong and shows latency.'),
    async execute(interaction) {
        const { user, client } = interaction;
        
        const sent = await interaction.reply({ 
            content: "Calculating ping...", 
            fetchReply: true,
            ephemeral: true 
        });

        const pingEmbed = new EmbedBuilder()
            .setColor(client.config.embedSuccess)
            .setTitle('`🏓` Pong!')
            .setDescription(`🏠 **API Latency**: ${client.ws.ping}ms\n📨 **Message Latency**: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await interaction.channel.send({ embeds: [pingEmbed] });
    }
}
