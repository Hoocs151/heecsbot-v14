const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("guild-list")
        .setDescription("Lists all guilds the bot is in.")
        .setDefaultMemberPermissions(PermissionsBitField.Administrator),
    async execute(interaction, client) {
        try {
            await interaction.deferReply();  // Defer the reply immediately

            const guilds = client.guilds.cache;
            const pageSize = 5;
            const pages = Math.ceil(guilds.size / pageSize);
            let page = 1;

            const generateGuildList = async (page) => {
                const start = (page - 1) * pageSize;
                const end = page * pageSize;
                let guildList = "";
                let index = 0;

                for (const [guildId, guild] of guilds) {
                    if (index >= start && index < end) {
                        const owner = guild.members.cache.get(guild.ownerId);
                        const ownerTag = owner ? `**${owner.user.tag}** \`(${owner.user.id})\`` : "**Unknown**";
                        guildList += `🔸 **Guild: ${guild.name}** \`(${guildId})\`\n`;
                        guildList += `👥 **Members: ${guild.memberCount}**\n`;
                        guildList += `👑 **Owner:** ${ownerTag}\n`;

                        let bot = guild.members.cache.get(client.user.id);
                        if (bot.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) {
                            try {
                                const inviteChannel = guild.channels.cache.find((c) => c.type === 0);
                                if (inviteChannel) {
                                    const invite = await inviteChannel.createInvite();
                                    guildList += `🔗 **Invite**: [Click Here](${invite.url})\n\n`;
                                } else {
                                    guildList += "❌ **Invite**: Invite cannot be generated\n\n";
                                }
                            } catch (error) {
                                guildList += `❌ **Invite**: Error generating invite (${error.message})\n\n`;
                            }
                        } else {
                            guildList += "❌ **Invite**: Bot does not have permission to create invites\n\n";
                        }
                    }
                    index++;
                }

                return guildList || "No guilds available.";
            };

            const createEmbed = async (page) => {
                const guildList = await generateGuildList(page);
                return new EmbedBuilder()
                    .setAuthor({ name: `Guild List Command 📜`, iconURL: client.user.displayAvatarURL() })
                    .setDescription(guildList)
                    .setColor(client.config.embedDev)
                    .setFooter({ text: `Page ${page}/${pages}`, iconURL: client.user.displayAvatarURL() })
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTimestamp()
                    .addFields(
                        { name: '🌐 Total Guilds', value: `${guilds.size}`, inline: true },
                        { name: '📄 Page', value: `${page}/${pages}`, inline: true },
                        { name: '🤖 Bot ID', value: `${client.user.id}`, inline: true }
                    );
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setLabel('First')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⏮️'),
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('⬅️'),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('➡️'),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setLabel('Last')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⏭️')
                );

            const embed = await createEmbed(page);
            const msg = await interaction.editReply({ embeds: [embed], components: [row], fetchReply: true });

            const collector = msg.createMessageComponentCollector({ time: 30000 });

            collector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.customId === 'first') {
                    page = 1;
                } else if (buttonInteraction.customId === 'previous' && page > 1) {
                    page--;
                } else if (buttonInteraction.customId === 'next' && page < pages) {
                    page++;
                } else if (buttonInteraction.customId === 'last') {
                    page = pages;
                }

                const newEmbed = await createEmbed(page);
                await buttonInteraction.update({ embeds: [newEmbed], components: [row] });
            });

            collector.on("end", async () => {
                row.components.forEach(component => component.setDisabled(true));
                await msg.edit({ components: [row] });
                const inactiveEmbed = embed.setFooter({ text: `Page ${page}/${pages} (Inactive)`, iconURL: client.user.displayAvatarURL() });
                await msg.edit({ embeds: [inactiveEmbed] });
            });

        } catch (error) {
            console.error(`Error executing GUILD_LIST command: ${error.message}`);

            const errorMessage = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while fetching the guild list. Please try again later.`)
                .setTimestamp();

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ embeds: [errorMessage], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorMessage], ephemeral: true });
            }
        }
    },
};
