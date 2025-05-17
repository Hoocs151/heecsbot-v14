const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField: { Flags }, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the specified channel.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel you want to unlock')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        if (!interaction.member.permissions.has(Flags.ManageChannels)) {
            return interaction.reply({
                content: '\`❌\` You must have the "Manage Channels" permission to use this command.',
                flags: 64
            });
        }

        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has([Flags.ManageChannels, Flags.SendMessages, Flags.EmbedLinks])) {
            return interaction.reply({
                content: '\`❌\` I do not have the necessary permissions (Manage Channels, Send Messages, Embed Links) to unlock the channel.',
                flags: 64
            });
        }

        try {
            await unlockChannel(channel);

            const successEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setDescription(`\`✅\` The channel **${channel.name}** has been unlocked.`)
                .setFooter({ text: 'Channel Unlocked' });

            return interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error unlocking channel: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while unlocking the channel: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    },
};

async function unlockChannel(channel) {
    try {
        const overwrite = channel.permissionOverwrites.cache.get(channel.guild.id);

        if (overwrite && overwrite.allow.has(Flags.SendMessages)) {
            throw new Error('The channel is already unlocked.');
        }

        await channel.permissionOverwrites.create(channel.guild.id, { SendMessages: true });
    } catch (err) {
        throw new Error(`Failed to update permissions for channel: ${err.message}`);
    }
}
