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
            return interaction.reply({ content: '❌ You must have the Manage Channels permission to use this command.', ephemeral: true });
        }

        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has([Flags.ManageChannels, Flags.SendMessages, Flags.EmbedLinks])) {
            return interaction.reply({ content: '❌ I do not have the necessary permissions to unlock the channel.', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: true });

            const successEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setDescription(`✅ The channel ${channel} has been unlocked.`)
                .setFooter({ text: 'Channel Unlocked' });

            return interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error unlocking channel: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`❌ An error occurred while unlocking the channel: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
