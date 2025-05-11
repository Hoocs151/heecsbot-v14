const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Display the avatar")
        .addUserOption(option => option.setName("user").setDescription("Select the user")),

    async execute(interaction) {
        const userID = interaction.options.getUser("user") || interaction.user;
        await interaction.deferReply({ ephemeral: false });
        await this.displayAvatar(interaction, userID);
    },

    async displayAvatar(interaction, userID) {
        const user = await interaction.client.users.fetch(userID, { force: true });
        const memberExists = await interaction.guild.members.fetch(userID).then(() => true).catch(() => false);
        const member = memberExists ? await interaction.guild.members.fetch(userID) : null;

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 1024 }) })
            .setColor(interaction.member.displayColor)
            .setImage(user.displayAvatarURL({ size: 1024 }));

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId("change-to-banner").setLabel("Banner").setEmoji("🔁").setStyle("Primary").setDisabled(!user.banner),
                new ButtonBuilder().setURL(user.displayAvatarURL({ size: 1024 })).setLabel("Avatar Link").setStyle("Link")
            );

        const sizeOptions = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
        const avatarFormatOptions = ['png', 'webp', 'jpg', 'jpeg', ...(user.displayAvatarURL().includes(".gif") ? ["gif"] : [])];

        const sizeMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .addOptions(sizeOptions.map(size => ({ label: `${size}x${size}`, value: size.toString() })))
                .setCustomId("size_menu")
                .setPlaceholder("Size: 1024x1024")
                .setMaxValues(1)
                .setDisabled(!user.avatar)
        );

        const formatMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .addOptions(avatarFormatOptions.map(format => ({ label: format.toUpperCase(), value: format })))
                .setCustomId("format_menu")
                .setPlaceholder(`Format: ${user.displayAvatarURL().includes(".gif") ? "GIF" : "WEBP"}`)
                .setMaxValues(1)
                .setDisabled(!user.avatar)
        );

        const changeMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .addOptions({ label: "Server", value: "server", emoji: "🔁" })
                .setCustomId("change_menu")
                .setPlaceholder("Displayed Avatar: User")
                .setMaxValues(1)
        );

        if (!memberExists || member.displayAvatarURL() === user.displayAvatarURL()) {
            changeMenu.components[0].setDisabled(true);
        }

        const message = await interaction.editReply({ embeds: [embed], components: [sizeMenu, formatMenu, changeMenu, button] });

        message.createMessageComponentCollector({ idle: 300000 })
            .on("collect", async (i) => {
                await i.deferUpdate();
                let size = 1024;
                let format = user.avatar.includes("a_") ? "gif" : "webp";
                let change = "user";

                if (i.user.id === interaction.user.id) {
                    if (i.customId === "change-to-banner") {
                        format = user.banner.includes("a_") ? "gif" : "webp";
                        embed.setImage(user.bannerURL({ forceStatic: true, extension: format, size: Number(size) }));
                        await button.components[0].setCustomId("change-to-avatar").setLabel("Avatar").setEmoji("🔁");
                        await button.components[1].setURL(user.bannerURL({ size: Number(size), extension: format, forceStatic: true })).setLabel("Banner Link");
                        changeMenu.components[0].setPlaceholder("Displayed Banner: User").setDisabled(true);
                    } else if (i.customId === "change_menu") {
                        if (i.values[0] === "server" && member) {
                            embed.setImage(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                            await button.components[1].setURL(member.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                            changeMenu.components[0].setOptions({ label: "User", value: "user", emoji: "🔁" }).setPlaceholder("Displayed Avatar: Server");
                        } else if (i.values[0] === "user") {
                            embed.setImage(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                            await button.components[1].setURL(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                            changeMenu.components[0].setOptions({ label: "Server", value: "server", emoji: "🔁" }).setPlaceholder("Displayed Avatar: User");
                        }
                    } else if (i.customId === "size_menu") {
                        size = i.values[0];
                        embed.setImage(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                        await button.components[1].setURL(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                    } else if (i.customId === "format_menu") {
                        format = i.values[0];
                        embed.setImage(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                        await button.components[1].setURL(user.displayAvatarURL({ size: Number(size), extension: format, forceStatic: true }));
                    }

                    await i.editReply({ embeds: [embed], components: [sizeMenu, formatMenu, changeMenu, button] });
                } else {
                    await i.followUp({ content: `Only ${interaction.user.toString()} can use these select menus/buttons.`, ephemeral: true });
                }
            })
            .on("end", async () => {
                changeMenu.components[0].setDisabled(true);
                sizeMenu.components[0].setDisabled(true);
                formatMenu.components[0].setDisabled(true);
                button.components[0].setDisabled(true);

                interaction.editReply({ components: [sizeMenu, formatMenu, changeMenu, button] });
            });
    }
};
