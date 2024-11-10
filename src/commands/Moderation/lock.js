const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField: { Flags }, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock the specified channel.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel you want to lock')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has([Flags.ManageChannels, Flags.SendMessages, Flags.EmbedLinks])) {
            return interaction.reply({ content: '\`❌\` I do not have the necessary permissions to lock channels.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(Flags.ManageChannels)) {
            return interaction.reply({ content: '\`❌\` You do not have the necessary permissions to lock channels.', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false });

            const successEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setDescription(`\`✅\` Successfully locked the channel ${channel}.`)
                .setFooter({ text: 'Channel Locked' });

            return interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            console.error(`Error executing lock command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(`\`❌\` An error occurred while locking the channel: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
