const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

const filterEffects = [
  "blue",
  "blurple",
  "pixelate",
  "blur",
  "blurple2",
  "brightness",
  "color",
  "green",
  "greyscale",
  "invert",
  "red",
  "invertgreyscale",
  "sepia",
  "threshold",
];

const filtersWithParams = {
  brightness: { param: "brightness", default: 75 },
  color: { param: "color", default: "FF4FF4" },
  threshold: { param: "threshold", default: 75 },
};

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("canvas-filter")
    .setDescription("Apply a Filter canvas effect to a user's avatar")
    .addStringOption((option) =>
      option
        .setName("filter")
        .setDescription("Choose the filter effect")
        .setRequired(true)
        .addChoices(...filterEffects.map((f) => ({ name: f, value: f })))
    )
    .addUserOption((option) =>
      option.setName("target").setDescription("Select a user").setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("value")
        .setDescription("Value for brightness, threshold (0-100)")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Hex color code for color filter (without #)")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser("target") || interaction.user;
    const filter = interaction.options.getString("filter");
    const value = interaction.options.getInteger("value");
    const color = interaction.options.getString("color");

    await interaction.deferReply();

    const avatarURL = user.displayAvatarURL({ extension: "png" });

    const params = new URLSearchParams();
    params.append("avatar", avatarURL);

    if (filter in filtersWithParams) {
      const paramName = filtersWithParams[filter].param;
      if (filter === "color") {
        params.append(paramName, color || filtersWithParams[filter].default);
      } else {
        params.append(paramName, value !== null ? value : filtersWithParams[filter].default);
      }
    }

    const endpoint = `https://api.some-random-api.com/canvas/filter/${filter}?${params.toString()}`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`API request failed with status ${res.status}`);

      const buffer = await res.buffer();

      await interaction.editReply({
        content: `🎨 Filter effect \`${filter}\` applied for ${user.tag}`,
        files: [{ attachment: buffer, name: `${filter}.png` }],
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
