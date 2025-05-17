const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const rollingEmojis = ['🎲', '🎯', '🎰', '🎳', '🎮'];

function aOrAn(num) {
    const vowels = [8, 11, 18, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89];
    return vowels.includes(num) ? 'an' : 'a';
}

const cooldownUsers = new Set();

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll one or multiple dice!')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of dice to roll')
                .setRequired(true)
                .addChoices(
                    { name: 'd4', value: '4' },
                    { name: 'd6', value: '6' },
                    { name: 'd8', value: '8' },
                    { name: 'd10', value: '10' },
                    { name: 'd12', value: '12' },
                    { name: 'd20', value: '20' },
                    { name: 'd100', value: '100' }
                )
        )
        .addIntegerOption(option =>
            option
                .setName('count')
                .setDescription('Number of dice to roll (max 5)')
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(false)
        ),
    async execute(interaction) {
        const { options, user } = interaction;

        if (cooldownUsers.has(user.id)) {
            return interaction.reply({ content: '⏳ Chill for a bit, you\'re on cooldown.', ephemeral: true });
        }
        cooldownUsers.add(user.id);
        setTimeout(() => cooldownUsers.delete(user.id), 3000); // 3s cooldown

        const count = options.getInteger('count') || 1;
        const faces = parseInt(options.getString('type'));
        
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * faces) + 1);

        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`${user.username} rolled ${count} ${count === 1 ? `d${faces}` : `d${faces}'s`}`)
            .setDescription(`${rollingEmojis[Math.floor(Math.random() * rollingEmojis.length)]} Rolling... ${rollingEmojis[Math.floor(Math.random() * rollingEmojis.length)]}`);

        await interaction.reply({ embeds: [embed] });

        for (let i = 0; i < 2; i++) {
            await new Promise(r => setTimeout(r, 600));
            embed.setDescription(`${rollingEmojis[Math.floor(Math.random() * rollingEmojis.length)]} Rolling... ${rollingEmojis[Math.floor(Math.random() * rollingEmojis.length)]}`);
            await interaction.editReply({ embeds: [embed] });
        }

        const resultsStr = rolls.map(r => `${aOrAn(r)} **${r}**`).join(', ');

        const resultEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`${user.username} rolled ${count} ${count === 1 ? `d${faces}` : `d${faces}'s`}`)
            .setDescription(`:game_die: Results: ${resultsStr} :game_die:`);

        await interaction.editReply({ embeds: [resultEmbed] });
    }
};
