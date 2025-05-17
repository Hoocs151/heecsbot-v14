const { SlashCommandBuilder, parseEmoji, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { parse } = require("twemoji-parser");

module.exports = {
  developer: true,

  data: new SlashCommandBuilder()
    .setName("bigemoji")
    .setDescription("Enlarge an emoji with style!")
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Paste your emoji here 🎉")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { user, client } = interaction;
    const emojiInput = interaction.options.getString("emoji");

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Big Emoji" })
      .setColor(client.config?.embedSuccess || "Blurple")
      .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const custom = parseEmoji(emojiInput);

    if (custom.id) {
      const url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`;
      embed.setImage(url);
      return interaction.reply({ embeds: [embed] });
    }

    const parsed = parse(emojiInput, { assetType: "png" });
    if (!parsed[0]) {
      return interaction.reply({ content: "❌ That doesn't look like a valid emoji, fam.", ephemeral: true });
    }

    embed.setImage(parsed[0].url);
    return interaction.reply({ embeds: [embed] });
  },

  async messageRun(message, args) {
    const emojiInput = args[0];
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Big Emoji" })
      .setColor(message.client.config?.embedSuccess || "Blurple")
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const custom = parseEmoji(emojiInput);
    if (custom.id) {
      const url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`;
      embed.setImage(url);
      return message.safeReply({ embeds: [embed] });
    }

    const parsed = parse(emojiInput, { assetType: "png" });
    if (!parsed[0]) {
      return message.safeReply("❌ That doesn't look like a valid emoji, fam.");
    }

    embed.setImage(parsed[0].url);
    return message.safeReply({ embeds: [embed] });
  },
};
