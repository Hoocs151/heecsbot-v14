const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch"); // nhớ npm i node-fetch@2 nếu chưa cài

const animals = [
  "fox",
  "cat",
  "birb",
  "panda",
  "red_panda",
  "racoon",
  "koala",
  "kangaroo",
  "whale",
  "dog",
  "bird"
];

const BASE_URL = "https://some-random-api.com/animal";

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("animal")
    .setDescription("🐾 Show a random animal image, guaranteed to melt your heart!")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Pick your favorite animal 🐕🐈🦊")
        .setRequired(true)
        .addChoices(...animals.map((animal) => ({ name: animal, value: animal })))
    ),

  /**
   * Executes the animal command
   * @param {import('discord.js').CommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const user = interaction.user;
    const choice = interaction.options.getString("type");

    await interaction.deferReply();

    try {
      const res = await fetch(`${BASE_URL}/${choice}`);
      if (!res.ok) throw new Error("Failed to fetch from API");
      const response = await res.json();

      if (!response || !response.image) {
        const errEmbed = new EmbedBuilder()
          .setColor(client.config.errorEmbed ?? "#ff3333")
          .setTitle("\`⚠️\` API Error")
          .setDescription(
            "Oops! Couldn't fetch that animal image right now. Try again later!"
          )
          .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        return await interaction.editReply({ embeds: [errEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor ?? "#5865F2")
        .setTitle(`Here's your ${choice} 🐾`)
        .setImage(response.image)
        .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errEmbed = new EmbedBuilder()
        .setColor(client.config.errorEmbed ?? "#ff3333")
        .setTitle("\`❌\` Error")
        .setDescription(
          "Something went sideways while getting your animal pic. Try again in a bit!"
        )
        .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.editReply({ embeds: [errEmbed] });
    }
  },
};