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

        if (!interaction.guild) {
            return interaction.reply({ content: '\`❌\` This command can only be run in a server.', flags: 64 });
        }

        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
        const botPermissions = botMember.permissions;
        const requiredBotPermissions = [Flags.ManageChannels, Flags.SendMessages, Flags.EmbedLinks];

        if (!requiredBotPermissions.every(permission => botPermissions.has(permission))) {
            return interaction.reply({ 
                content: '\`❌\` I do not have the necessary permissions to lock channels.', 
                flags: 64
            });
        }

        if (!interaction.member.permissions.has(Flags.ManageChannels)) {
            return interaction.reply({ 
                content: '\`❌\` You do not have the necessary permissions to lock channels.', 
                flags: 64
            });
        }

        try {
            await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false });

            const successEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setDescription(`\`✅\` Successfully locked the channel ${channel}.`)
                .setFooter({ text: 'Channel Locked' });

            return interaction.reply({ embeds: [successEmbed], flags: 64 });
        } catch (err) {
            console.error(`Error executing lock command: ${err.message}`);

            const errorEmbed = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while locking the channel: ${err.message}`);

            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    },
};
