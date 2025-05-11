const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const BlackListGuild = require('../../schemas/BlackListGuild');
const BlackListUser = require('../../schemas/BlackListUser');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("BlackList Command")
        .addStringOption((options) =>
            options
                .setName("options")
                .setDescription(`Are you blacklisting a Guild or a User?`)
                .setRequired(true)
                .addChoices(
                    { name: "Guild", value: "guild" },
                    { name: "User", value: "user" }
                )
        )
        .addStringOption((options) =>
            options
                .setName("id")
                .setDescription("Input user's or guild's id")
                .setRequired(true)
        )
        .addStringOption((options) =>
            options.setName("reason").setDescription("Reason to blacklist user")
        ),
    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });
        const { options } = interaction;
        const choices = options.getString("options");
        const ID = options.getString("id");
        const reason = options.getString("reason") || "No reason provided.";

        if (isNaN(ID)) {
            return interaction.editReply({ content: `ID must be a number.` });
        }

        switch (choices) {
            case "guild": {
                const Guild = await client.guilds.fetch(ID);
                let Data = await BlackListGuild.findOne({ Guild: Guild.id }).catch((err) => { });

                const embed = new EmbedBuilder()
                    .setColor(client.config.embedDev)
                    .setThumbnail(Guild.iconURL({ dynamic: true }))
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                if (!Data) {
                    Data = new BlackListGuild({ Guild: Guild.id, Reason: reason, Time: Date.now() });
                    await Data.save();
                    embed
                        .setTitle('\`⚠️\` Guild Blacklisted')
                        .setDescription(`**${Guild.name}** (ID: ${Guild.id}) has been blacklisted.`)
                        .addFields({ name: 'Reason', value: reason, inline: true })
                        .setTimestamp();
                } else {
                    await Data.delete();
                    embed
                        .setTitle('\`✅\` Guild Removed from Blacklist')
                        .setDescription(`**${Guild.name}** (ID: ${Guild.id}) has been removed from the blacklist.`)
                        .setTimestamp();
                }

                interaction.editReply({ embeds: [embed] });
                break;
            }
            case "user": {
                const User = await client.users.fetch(ID);
                let Data = await BlackListUser.findOne({ User: User.id }).catch((err) => { });

                const embed = new EmbedBuilder()
                    .setColor(client.config.embedError)
                    .setThumbnail(User.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                if (!Data) {
                    Data = new BlackListUser({ User: User.id, Reason: reason, Time: Date.now() });
                    await Data.save();
                    embed
                        .setTitle('\`🚫\` User Blacklisted')
                        .setDescription(`**${User.tag}** (ID: ${User.id}) has been blacklisted.`)
                        .addFields({ name: 'Reason', value: reason, inline: true })
                        .setTimestamp();
                } else {
                    await Data.delete();
                    embed
                        .setTitle('\`✅\` User Removed from Blacklist')
                        .setDescription(`**${User.tag}** (ID: ${User.id}) has been removed from the blacklist.`)
                        .setTimestamp();
                }

                interaction.editReply({ embeds: [embed] });
                break;
            }
        }
    },
};
