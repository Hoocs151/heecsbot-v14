const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

// Danh sách các loại fact từ API
const factTypes = [
  "cat",
  "fox",
  "birb",
  "panda",
  "koala",
  "kangaroo",
  "racoon",
  "giraffe",
  "whale",
  "elephant",
  "dog",
  "bird",
  "red_panda",
];

const BASE_FACTS_URL = "https://api.some-random-api.com/facts";

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("randomfact")
    .setDescription("Get a random fact, optionally by topic")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("Choose a topic to get a fact about")
        .setRequired(false)
        .addChoices(...factTypes.map((t) => ({ name: t, value: t })))
    ),

  async execute(interaction, client) {
    const user = interaction.user;
    const topic = interaction.options.getString("topic");

    await interaction.deferReply();

    try {
      const url = topic ? `${BASE_FACTS_URL}/${topic}` : BASE_FACTS_URL;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch fact");
      const data = await res.json();

      let factText = "";
      if (Array.isArray(data)) {
        factText = data.length > 0 ? data[0].fact || data[0] : null;
      } else if (data.fact) {
        factText = data.fact;
      } else {
        factText = JSON.stringify(data);
      }

      if (!factText) {
        return interaction.editReply({
          content: "`❌` Could not get a fact right now, please try again later.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(client.config?.embedColor || "#5865F2")
        .setTitle(`Random Fact ${topic ? `— ${topic.charAt(0).toUpperCase() + topic.slice(1)}` : ""}`)
        .setDescription(factText)
        .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor(client.config?.embedError || "#ff3333")
        .setTitle("`❌` Error")
        .setDescription(`Something went wrong: ${err.message}`)
        .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
