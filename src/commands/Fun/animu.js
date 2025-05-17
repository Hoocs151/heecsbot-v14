const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

const animuTypes = [
  "nom",
  "poke",
  "cry",
  "kiss",
  "pat",
  "hug",
  "wink",
  "face-palm",
  "quote",
];

const typeEmojis = {
  nom: "🍽️",
  poke: "👉",
  cry: "😢",
  kiss: "😘",
  pat: "🤚",
  hug: "🤗",
  wink: "😉",
  "face-palm": "🤦",
  quote: "💬",
};

const BASE_ANIMU_URL = "https://api.some-random-api.com/animu";

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("animu")
    .setDescription("Get a random anime image or reaction")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Choose the anime image type")
        .setRequired(false)
        .addChoices(...animuTypes.map((t) => ({ name: t, value: t })))
    ),

  async execute(interaction, client) {
    const user = interaction.user;
    const choice =
      interaction.options.getString("type") ||
      animuTypes[Math.floor(Math.random() * animuTypes.length)];

    await interaction.deferReply();

    try {
      const res = await fetch(`${BASE_ANIMU_URL}/${choice}`);
      if (!res.ok) throw new Error("Failed to fetch animu image");

      const data = await res.json();

      if (!data || !data.link) {
        return interaction.editReply({
          content:
            "`❌` Sorry, couldn't retrieve the anime image right now. Try again later!",
          ephemeral: true,
        });
      }

      const formattedType = choice
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const emoji = typeEmojis[choice] || "";

      const embed = new EmbedBuilder()
        .setColor(client.config?.embedColor || "#5865F2")
        .setTitle(`${emoji} Anime Image — ${formattedType}`)
        .setImage(data.link)
        .setFooter({
          text: `Requested by ${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor(client.config?.embedError || "#ff3333")
        .setTitle("`❌` Error")
        .setDescription(`Something went wrong: ${err.message}`)
        .setFooter({
          text: `Requested by ${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
