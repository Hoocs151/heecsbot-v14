const { SlashCommandBuilder, PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addroleall')
        .setDescription('Adds a role to all users of the server at once.')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to add to all members')
                .setRequired(true)),
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        try {
            // Fetch the bot's member object to ensure it's up-to-date
            const botMember = await interaction.guild.members.fetch(client.user.id);

            // Check bot permissions
            if (!botMember.permissions.has([Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles, Flags.ManageGuild])) {
                return interaction.reply({ content: '\`❌\` I do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            // Check user permissions
            if (!interaction.member.permissions.has(Flags.ManageGuild)) {
                return interaction.reply({ content: '\`❌\` You do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            // Check role hierarchy
            if (botMember.roles.highest.comparePositionTo(role) < 0) {
                return interaction.reply({ content: `\`❌\` I cannot manage the ${role.name} role due to role hierarchy.`, ephemeral: true });
            }

            const wait = require('node:timers/promises').setTimeout;

            const initialEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setTitle('Add Role to All Members')
                .setDescription(`\`✅\` I will add the role ${role} to all members of this server.\nThis process may take a few minutes, so please be patient.`)
                .setAuthor({ name: 'ADD ROLE ALL', iconURL: client.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
                .setThumbnail(role.iconURL({ format: 'png', size: 512, dynamic: true }) || interaction.guild.iconURL({ format: 'png', size: 512, dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [initialEmbed] });

            let count = 0;
            let skipped = 0;

            await interaction.guild.members.fetch();

            const members = interaction.guild.members.cache;

            for (const member of members.values()) {
                try {
                    if (member.roles.cache.has(role.id)) {
                        skipped++;
                    } else {
                        await member.roles.add(role);
                        count++;
                    }

                    const progressEmbed = new EmbedBuilder()
                        .setColor(client.config.embedSuccess)
                        .setTitle('Add Role to All Members')
                        .setDescription(`**Total Members:** ${interaction.guild.memberCount}\n**Processed:** ${count + skipped}\n**Role Added to:** ${count} members\n**Skipped:** ${skipped} members (Already had the role)`)
                        .setFooter({ text: 'Progressing...', iconURL: client.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
                        .setTimestamp();

                    await interaction.editReply({ embeds: [progressEmbed] });
                    await wait(3000);
                } catch (err) {
                    console.error(err);
                    client.logger.error(err);
                }
            }

            const completionEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setTitle('Add Role to All Members')
                .setDescription(`\`✅\` Process completed! ${count} of ${interaction.guild.memberCount} users have successfully received the ${role} role!`)
                .setTimestamp()
                .setFooter({ text: 'Completed', iconURL: client.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) });

            await interaction.editReply({ embeds: [completionEmbed] });
        } catch (error) {
            console.error(`Error executing addroleall command: ${error.message}`);

            const errorMessage = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setTitle('Error')
                .setDescription(`\`❌\` An error occurred while adding the role. Please try again later.`)
                .setTimestamp();

            await interaction.reply({ embeds: [errorMessage], ephemeral: true });
        }
    },
};
