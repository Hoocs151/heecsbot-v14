const discord = require("discord.js");
module.exports = {
    data: new discord.SlashCommandBuilder()
        .setName("avatar")
        .setDescription("display the avatar")
        .addUserOption(user => user
            .setName("user")
            .setDescription("select the user")
        ),
    /**
     * @param {discord.ChatInputCommandInteraction} interaction
     */

    async execute(interaction, client) {
        let userID = interaction.options.getUser("user") || interaction.user;
        await interaction.deferReply({ ephemeral: false })
        await this.displayAvatar(interaction, userID)
    },
    async displayAvatar(interaction, userID) {
        const sizeLanguage = "Size";
        const serverAvatarLanguage = "Server Avatar";
        const displayAvatarLanguage = "Displayed Avatar";
        const displayBannerLanguage = "Displayed Banner";
        const animatedLanguage = "Animated";
        const formatLanguage = "Format";
        const fieldTitleLanguage = "General"
        const errorLanguage = "Only {X} can use these selectMenus/Buttons"
        const falseEmoji = "❌";
        const trueEmoji = "✅";
        const changeEmoji = "🔁";

      const user = await interaction.client.users.fetch(userID, { force: true });
        const memberExists = await interaction.guild.members.fetch(userID).then(() => true).catch(() => false);
        const member = await interaction.guild.members.fetch(memberExists ? user.id : interaction.user.id);

        let type = "avatar";
        let sizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
        let formats = ['png', 'webp', 'jpg', 'jpeg', ...(user.displayAvatarURL().includes(".gif") ? ["gif"] : [])];
        let change = "user";

        const embed = new discord.EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 1024 }) })
        embed.setColor(interaction.member.displayColor)
            .setImage(user.displayAvatarURL({ size: 1024 }))
        const button = new discord.ActionRowBuilder().addComponents(new discord.ButtonBuilder().setCustomId("change-to-banner").setLabel("Banner").setEmoji(changeEmoji).setStyle("Primary").setDisabled(!user.banner), new discord.ButtonBuilder().setURL(user.displayAvatarURL({ size: 1024 })).setLabel("Avatar Link").setStyle("Link"))
        const size_menu = new discord.ActionRowBuilder().addComponents(new discord.StringSelectMenuBuilder().addOptions(sizes.map(size => ({ label: `${size}x${size}`, value: size.toString() }))).setCustomId("size_menu").setPlaceholder(`${sizeLanguage}: 1024x1024`).setMaxValues(1).setDisabled(!user.avatar))
        const format_menu = new discord.ActionRowBuilder().addComponents(new discord.StringSelectMenuBuilder().addOptions(formats.map(format => ({ label: format.toUpperCase(), value: format }))).setCustomId("format_menu").setPlaceholder(`${formatLanguage}: ${user.displayAvatarURL().includes(".gif") ? "GIF" : "WEBP"}`).setMaxValues(1).setDisabled(!user.avatar))
        const change_menu = new discord.ActionRowBuilder().addComponents(new discord.StringSelectMenuBuilder().addOptions({ label: "Server", value: "server", emoji: changeEmoji }).setCustomId("change_menu").setPlaceholder(`${displayAvatarLanguage}: User`).setMaxValues(1))
        if (memberExists === false) {
            await change_menu.components[0].setDisabled(true)
        } else {
            if (member.displayAvatarURL() === user.displayAvatarURL()) {
                await change_menu.components[0].setDisabled(true)
            } else {
                await change_menu.components[0].setDisabled(false)
            }
        }
        const e = await interaction.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
        e.createMessageComponentCollector({ idle: 3e5 })
            .on("collect", async (i) => {
                await i.deferUpdate()
                var size = 1024;
                var format = user.avatar.includes("a_") ? "gif" : embed.data.image.url.split('.').pop().split("?")[0] || "webp";
                if (i.user.id === interaction.user.id) {
                    if (type === "avatar") {
                        // ---------------Avatar--------------------------//
                        size = embed.data.image.url.split("?size=")[1] || 1024
                        format = embed.data.image.url.split('.').pop().split("?")[0] || "webp";
                        if (i.customId === "change-to-banner") {
                            format = user.banner.includes("a_") ? "gif" : "webp";
                            type = "banner"
                            change = "user";
                            let formats1 = ['png', 'webp', 'jpg', 'jpeg', ...(user.bannerURL().includes(".gif") ? ['gif'] : [])];
                            await button.components[0].setCustomId("change-to-avatar").setLabel("Avatar").setEmoji(changeEmoji)
                            await format_menu.components[0].setOptions(formats1.map(format => ({ label: format.toUpperCase(), value: format }))).setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                            await button.components[1].setURL(user.bannerURL({ size: Number(size), extension: format, forceStatic: true })).setLabel("Banner Link")
                            await change_menu.components[0].setPlaceholder(`${displayBannerLanguage}: User`).setDisabled(true)
                            embed.setImage(user.bannerURL({ forceStatic: true, extension: format, size: Number(size) }))
                            await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                        } if (i.customId === "change_menu") {
                            if (i.values[0] === "server") {
                                let formats1 = ['png', 'webp', 'jpg', 'jpeg', ...(member.displayAvatarURL().includes(".gif") ? ['gif'] : [])];
                                change = "server"
                                format = member.displayAvatarURL().includes("a_") ? "gif" : "webp";
                                embed.setImage(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await change_menu.components[0].setOptions({ label: "User", value: "user", emoji: changeEmoji }).setPlaceholder(`${displayAvatarLanguage}: Server`)
                                await format_menu.components[0].setOptions(formats1.map(format => ({ label: format.toUpperCase(), value: format }))).setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                                await button.components[1].setURL(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })

                            } else if (i.values[0] === "user") {
                                let formats2 = ['png', 'webp', 'jpg', 'jpeg', ...(user.displayAvatarURL().includes(".gif") ? ['gif'] : [])];
                                change = "user"
                                format = user.displayAvatarURL().includes("a_") ? "gif" : "webp";
                                embed.setImage(user.avatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await change_menu.components[0].setOptions({ label: "Server", value: "server", emoji: changeEmoji}).setPlaceholder(`${displayAvatarLanguage}: User`)
                                await format_menu.components[0].setOptions(formats2.map(format => ({ label: format.toUpperCase(), value: format }))).setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                                await button.components[1].setURL(user.avatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            }
                        } else if (i.customId === "size_menu") {
                            size = i.values[0];
                            if (change === "user") {
                                embed.setImage(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await button.components[1].setURL(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await size_menu.components[0].setPlaceholder(`${sizeLanguage}: ${size}x${size}`)
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            } else if (change === "server") {
                                embed.setImage(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await button.components[1].setURL(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await size_menu.components[0].setPlaceholder(`${sizeLanguage}: ${size}x${size}`)
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            }
                        } else if (i.customId === "format_menu") {
                            var format = i.values[0];
                            size = embed.data.image.url.split("?size=")[1]
                            if (change === "user") {
                                embed.setImage(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await button.components[1].setURL(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await format_menu.components[0].setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            } else if (change === "server") {
                                embed.setImage(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await button.components[1].setURL(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }))
                                await format_menu.components[0].setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            }
                        }
                        // ---------------Avatar--------------------------//

                        // ---------------Banner--------------------------//
                    } else if (type === "banner") {
                        size = embed.data.image.url.split("?size=")[1] || 1024
                        format = embed.data.image.url.split('.').pop().split("?")[0] || "webp";
                        if (i.customId === "change-to-avatar") {
                            format = user.displayAvatarURL().includes("a_") ? "gif" : "webp";
                            type = "avatar"
                            change = "user";
                            let formats3 = ['png', 'webp', 'jpg', 'jpeg', ...(user.displayAvatarURL().includes(".gif") ? ['gif'] : [])];
                            await button.components[0].setCustomId("change-to-banner").setLabel("Banner").setEmoji(changeEmoji)
                            await format_menu.components[0].setOptions(formats3.map(format => ({ label: format.toUpperCase(), value: format }))).setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                            await button.components[1].setURL(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true })).setLabel("Avatar Link")
                            await change_menu.components[0].setPlaceholder(`${displayAvatarLanguage}: User`).setOptions({ label: "Server", value: "server", emoji: changeEmoji})
                            if (memberExists === false) {
                                await change_menu.components[0].setDisabled(true)
                            } else {
                                if (member.displayAvatarURL() === user.displayAvatarURL()) {
                                    await change_menu.components[0].setDisabled(true)
                                } else {
                                    await change_menu.components[0].setDisabled(false)
                                }
                            }
                            embed.setImage(user.displayAvatarURL({ forceStatic: true, extension: format, size: Number(size) }))
                            await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                        } if (i.customId === "size_menu") {
                            size = i.values[0];
                            if (change === "user") {
                                embed.setImage(user.bannerURL({ size: Number(size), extension: format, forceStatic: true }))
                                await button.components[1].setURL(user.bannerURL({ size: Number(size), extension: format, forceStatic: true }))
                                await size_menu.components[0].setPlaceholder(`${sizeLanguage}: ${size}x${size}`)
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            }
                        } else if (i.customId === "format_menu") {
                            var format = i.values[0];
                            size = embed.data.image.url.split("?size=")[1]
                            if (change === "user") {
                                embed.setImage(user.bannerURL({ size: Number(size), extension: format, forceStatic: true }))
                                await button.components[1].setURL(user.bannerURL({ size: Number(size), extension: format, forceStatic: true }))
                                await format_menu.components[0].setPlaceholder(`${formatLanguage}: ${format.toUpperCase()}`)
                                await i.editReply({ embeds: [embed], components: [size_menu, format_menu, change_menu, button] })
                            }
                        }
                        // ---------------Banner--------------------------//
                    }
                } else {
                    let X = `${interaction.user.toString()}`
                    await i.followUp({ content: `${errorLanguage.replace("{X}", X)}`, ephemeral: true })
                }
            })
            .on("end", async () => {
                change_menu.components[0].setDisabled(true)
                size_menu.components[0].setDisabled(true)
                format_menu.components[0].setDisabled(true)
                button.components[0].setDisabled(true)

                interaction.editReply({ components: [size_menu, format_menu, change_menu, button] })
            })
    }
}