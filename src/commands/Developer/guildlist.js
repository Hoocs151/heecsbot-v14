const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("guild-list")
        .setDescription("Lists all guilds the bot is in.")
        .setDefaultMemberPermissions(PermissionsBitField.Administrator),
    async execute(interaction, client) {
        try {
            await interaction.deferReply();  // Đảm bảo await này sử dụng đúng async function
            const guilds = client.guilds.cache;
            
            // Tạo danh sách guilds
            let guildList = "";
            let guildCount = 0;
            const guildsPerPage = 10; // Số lượng guilds mỗi lần gửi

            const sendGuildList = async (guildList) => {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Guild List Command 📜`, iconURL: client.user.displayAvatarURL() })
                    .setDescription(guildList)
                    .setColor(client.config.embedDev)
                    .setFooter({ text: `Total Guilds: ${guilds.size}`, iconURL: client.user.displayAvatarURL() })
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTimestamp();
                
                // Gửi embed từng phần
                await interaction.followUp({ embeds: [embed] });
            };

            // Duyệt qua các guild và thêm vào danh sách
            for (const [guildId, guild] of guilds) {
                const owner = guild.members.cache.get(guild.ownerId);
                const ownerTag = owner ? `**${owner.user.tag}** \`(${owner.user.id})\`` : "**Unknown**";
                
                guildList += `🔸 **Guild: ${guild.name}** \`(${guildId})\`\n`;
                guildList += `👥 **Members: ${guild.memberCount}**\n`;
                guildList += `👑 **Owner:** ${ownerTag}\n`;

                let bot = guild.members.cache.get(client.user.id);
                if (bot.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) {
                    try {
                        const inviteChannel = guild.channels.cache.find((c) => c.type === 0);  // type === 0 for text channels
                        if (inviteChannel) {
                            const invite = await inviteChannel.createInvite();
                            guildList += `🔗 **Invite**: [Click Here](${invite.url})\n\n`;
                        } else {
                            guildList += "❌ **Invite**: No valid text channel for invite\n\n";
                        }
                    } catch (error) {
                        console.error(`Error generating invite for ${guild.name}: ${error.message}`);
                        guildList += `❌ **Invite**: Error generating invite (${error.message})\n\n`;
                    }
                } else {
                    guildList += "❌ **Invite**: Bot does not have permission to create invites\n\n";
                }

                guildCount++;

                // Kiểm tra nếu số lượng guilds đã đủ (guildsPerPage)
                if (guildCount >= guildsPerPage) {
                    await sendGuildList(guildList);  // Gửi danh sách guilds
                    guildList = "";  // Đặt lại danh sách guilds để chuẩn bị cho trang tiếp theo
                    guildCount = 0;  // Đặt lại số lượng guilds đã gửi
                }
            }

            // Gửi phần còn lại nếu có
            if (guildList.length > 0) {
                await sendGuildList(guildList);
            }

        } catch (error) {
            console.error(`Error executing GUILD_LIST command: ${error.message}`);
            
            const errorMessage = new EmbedBuilder()
                .setColor(client.config.embedError)
                .setDescription(`\`❌\` An error occurred while fetching the guild list. Please try again later.`)
                .setTimestamp();

            console.error("Detailed error:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ embeds: [errorMessage], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorMessage], ephemeral: true });
            }
        }
    },
};
