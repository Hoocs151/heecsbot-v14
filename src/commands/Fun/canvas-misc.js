const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

const miscEffects = [
  "circle",
  "heart",
  "horny",
  "its-so-stupid",
  "lied",
  "lolice",
  "namecard",
  "nobitches",
  "oogway",
  "oogway2",
  "simpcard",
  "tonikawa",
  "tweet",
  "youtube-comment",
  "pansexual",
  "transgender",
];

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("canvas-misc")
    .setDescription("Apply a Miscellaneous canvas effect to a user's avatar")
    .addStringOption((option) =>
      option
        .setName("effect")
        .setDescription("Choose the miscellaneous effect")
        .setRequired(true)
        .addChoices(...miscEffects.map((e) => ({ name: e, value: e })))
    )
    .addUserOption((option) =>
      option.setName("target").setDescription("Select a user").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("text1")
        .setDescription("Additional text parameter 1 (if needed)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("text2")
        .setDescription("Additional text parameter 2 (if needed)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("text3")
        .setDescription("Additional text parameter 3 (if needed)")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser("target") || interaction.user;
    const effect = interaction.options.getString("effect");
    const text1 = interaction.options.getString("text1") || "";
    const text2 = interaction.options.getString("text2") || "";
    const text3 = interaction.options.getString("text3") || "";

    await interaction.deferReply();

    const avatarURL = user.displayAvatarURL({ extension: "png" });

    // Build query string tùy effect
    const params = new URLSearchParams();
    params.append("avatar", avatarURL);

    // Các effect cần tham số thêm
    if (effect === "its-so-stupid") {
      if (!text1) {
        return interaction.editReply({
          content: "❌ You must provide the 'dog' text for this effect in text1 parameter.",
          ephemeral: true,
        });
      }
      params.append("dog", text1);
    } else if (effect === "namecard") {
      if (!text1 || !text2) {
        return interaction.editReply({
          content:
            "❌ You must provide 'username' (text1) and 'birthday' (text2) for the namecard effect.",
          ephemeral: true,
        });
      }
      params.append("username", text1);
      params.append("birthday", text2);
      params.append("avatar", avatarURL);
    } else if (effect === "tweet") {
      if (!text1 || !text2 || !text3) {
        return interaction.editReply({
          content:
            "❌ You must provide 'displayname' (text1), 'username' (text2), and 'comment' (text3) for the tweet effect.",
          ephemeral: true,
        });
      }
      params.append("displayname", text1);
      params.append("username", text2);
      params.append("comment", text3);
    } else if (effect === "youtube-comment") {
      if (!text1 || !text2) {
        return interaction.editReply({
          content:
            "❌ You must provide 'username' (text1) and 'comment' (text2) for the youtube-comment effect.",
          ephemeral: true,
        });
      }
      params.append("username", text1);
      params.append("comment", text2);
    }

    const endpoint = `https://api.some-random-api.com/canvas/misc/${effect}?${params.toString()}`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`API request failed with status ${res.status}`);

      const buffer = await res.buffer();

      await interaction.editReply({
        content: `✨ Miscellaneous effect \`${effect}\` applied for ${user.tag}`,
        files: [{ attachment: buffer, name: `${effect}.png` }],
      });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor(client.config?.embedError || "#ff3333")
        .setTitle("❌ Error")
        .setDescription(`Could not generate image: ${err.message}`)
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
