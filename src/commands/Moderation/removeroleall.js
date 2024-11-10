const { SlashCommandBuilder, PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeroleall')
        .setDescription('Removes a role from all users of the server at once.')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to remove from all members')
                .setRequired(true)),
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        try {
            const botMember = await interaction.guild.members.fetch(client.user.id);

            if (!botMember.permissions.has([Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles, Flags.ManageGuild])) {
                return interaction.reply({ content: '\`❌\` I do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            if (!interaction.member.permissions.has(Flags.ManageGuild)) {
                return interaction.reply({ content: '\`❌\` You do not have the necessary permissions to execute this command.', ephemeral: true });
            }

            if (botMember.roles.highest.comparePositionTo(role) < 0) {
                return interaction.reply({ content: `\`❌\` I cannot manage the ${role.name} role due to role hierarchy.`, ephemeral: true });
            }

            const wait = require('node:timers/promises').setTimeout;

            const initialEmbed = new EmbedBuilder()
                .setColor(client.config.embedSuccess)
                .setTitle('Remove Role from All Members')
                .setDescription(`\`✅\` I will remove the role ${role} from all members of this server.\nThis process may take a few minutes, so please be patient.`)
                .setAuthor({ name: 'REMOVE ROLE ALL', iconURL: client.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) })
                .setThumbnail(role.iconURL({ format: 'png', size: 512, dynamic: true }) || interaction.guild.iconURL({ format: 'png', size: 512, dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [initialEmbed] });

            let count = 0;
            let skipped = 0;

            await interaction.guild.members.fetch();

            const members = interaction.guild.members.cache;

            for (const member of members.values()) {
                try {
                    if (!member.roles.cache.has(role.id)) {
                        skipped++;
                    } else {
                        await member.roles.remove(role);
                        count++;
                    }

                    const progressEmbed = new EmbedBuilder()
                        .setColor(client.config.embedSuccess)
                        .setTitle('Remove Role from All Members')
                        .setDescription(`**Total Members:** ${interaction.guild.memberCount}\n**Processed:** ${count + skipped}\n**Role Removed from:** ${count} members\n**Skipped:** ${skipped} members (Did not have the role)`)
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
                .setTitle('Remove Role from All Members')
                .setDescription(`\`✅\` Process completed! ${count} of ${interaction.guild.memberCount} users have successfully had the ${role} role removed!`)
                .setTimestamp()
                .setFooter({ text: 'Completed', iconURL: client.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }) });

            await interaction.editReply({ embeds: [completionEmbed] });
        } catch (error) {
            console.error(`Error executing removeroleall command: ${error.message}`);

            const errorMessage = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setTitle('Error')
                .setDescription(`\`❌\` An error occurred while removing the role. Please try again later.`)
                .setTimestamp();

            await interaction.reply({ embeds: [errorMessage], ephemeral: true });
        }
    },
};
