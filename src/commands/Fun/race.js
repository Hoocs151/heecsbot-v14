const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const arrayMove = require('array-move-item');

// Language data structure
const languages = {
    vi: {
        race_started: '🏁 Đã bắt đầu cuộc đua! Ấn `join` để tham gia! 🏁\n**➜** Cuộc đua sẽ bắt đầu sau **1 phút** nữa!!!!',
        max_players: 'Tối đa 25 người chơi!',
        player_joined: '<@{player}> đã tham gia',
        not_enough_players: 'Phải có trên 1 người để bắt đầu',
        participants: 'Những người tham gia: {participants}',
        race_result: '🚩 **Kết quả cuộc đua** 🚩\n   **⤷** Người Chiến thắng: {winner}',
        leaderboard: '🏆 Bảng Xếp Hạng 🏆',
        weather_options: {
            sunny: 'Nắng',
            rainy: 'Mưa',
            snowy: 'Tuyết',
            windy: 'Gió lớn',
            foggy: 'Sương mù',
            stormy: 'Bão'
        },
        events: {
            speed_boost: '💨 {player} nhận được tăng tốc!',
            speed_reduction: '🐢 {player} bị giảm tốc độ!',
            distraction: '😵 {player} bị mất lái và không di chuyển được!',
            slippery: '❄️ {player} bị trượt trên đường tuyết!',
            engine_failure: '🔧 {player} bị hỏng máy!',
            shortcut: '🛣️ {player} tìm được lối tắt và tiến nhanh hơn!',
            wind_blow: '🌬️ {player} bị gió thổi bay đi!',
            fog_slow: '🌫️ {player} bị sương mù làm chậm lại!',
            stormy_drift: '🌪️ {player} bị bão làm trôi xe!',
            powerup_used: '⚡ {player} đã sử dụng vật phẩm {item}!'
        }
    },
    en: {
        race_started: '🏁 The race has started! Type `join` to participate! 🏁\n**➜** The race will start in **1 minute**!!!!',
        max_players: 'A maximum of 25 players!',
        player_joined: '<@{player}> has joined',
        not_enough_players: 'There must be more than 1 player to start',
        participants: 'Participants: {participants}',
        race_result: '🚩 **Race Results** 🚩\n   **⤷** Winner: {winner}',
        leaderboard: '🏆 Leaderboard 🏆',
        weather_options: {
            sunny: 'Sunny',
            rainy: 'Rainy',
            snowy: 'Snowy',
            windy: 'Windy',
            foggy: 'Foggy',
            stormy: 'Stormy'
        },
        events: {
            speed_boost: '💨 {player} got a speed boost!',
            speed_reduction: '🐢 {player} got a speed reduction!',
            distraction: '😵 {player} got distracted and stopped moving!',
            slippery: '❄️ {player} slipped on the snowy road!',
            engine_failure: '🔧 {player} had an engine failure!',
            shortcut: '🛣️ {player} found a shortcut and moved faster!',
            wind_blow: '🌬️ {player} was blown away by the wind!',
            fog_slow: '🌫️ {player} was slowed down by the fog!',
            stormy_drift: '🌪️ {player} was drifted away by the storm!',
            powerup_used: '⚡ {player} used a power-up: {item}!'
        }
    }
};

// Game modes and their vehicles
const gamemodes = {
    car: ['🏎️', '🚗', '🚙', '🚓', '🚑', '🚕', '🚌', '🚎', '🚚', '🚜'],
    horse: ['🐎', '🏇', '🐴'],
    bike: ['🚲', '🚴', '🚵'],
    plane: ['✈️', '🛫', '🛬', '🛩️', '🚀', '🛸'],
    boat: ['⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢'],
    custom: ['🚀', '🚁', '🛴', '🚲', '🏍️', '🛵', '🦽', '🦼', '🛶', '🚂', '🛸', '🦯', '🛺', '🚡', '🚝']
};

// Weather effects on race
const weatherEffects = {
    sunny: 1,
    rainy: 0.75,
    snowy: 0.5,
    windy: 0.9,
    foggy: 0.8,
    stormy: 0.6
};

// Random events during the race
const randomEvents = [
    { type: 'speed_boost', effect: 2, message: 'speed_boost' },
    { type: 'speed_reduction', effect: 0.5, message: 'speed_reduction' },
    { type: 'distraction', effect: 0, message: 'distraction' },
    { type: 'engine_failure', effect: 0, message: 'engine_failure' },
    { type: 'shortcut', effect: 3, message: 'shortcut' },
    { type: 'wind_blow', effect: 0.7, message: 'wind_blow' },
    { type: 'fog_slow', effect: 0.6, message: 'fog_slow' },
    { type: 'stormy_drift', effect: 0.4, message: 'stormy_drift' }
];

// Helper function to apply random events
function applyRandomEvent(raceLine, weather, language, interaction) {
    const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    if (Math.random() < 0.2) { // 20% chance for a random event
        raceLine *= randomEvent.effect;
        interaction.channel.send(languages[language].events[randomEvent.message].replace('{player}', raceLine.split(' ')[2]));
    }
    return raceLine;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('race')
        .setDescription('Race with friends')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Select the race mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Car', value: 'car' },
                    { name: 'Horse', value: 'horse' },
                    { name: 'Bike', value: 'bike' },
                    { name: 'Plane', value: 'plane' },
                    { name: 'Boat', value: 'boat' },
                    { name: 'Custom', value: 'custom' }
                ))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Choose your emoji for the race')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('distance')
                .setDescription('Select race distance (default: 20)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Select language (default: vi)')
                .setRequired(false)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Vietnamese', value: 'vi' }
                ))
        .addStringOption(option =>
            option.setName('weather')
                .setDescription('Select the weather condition')
                .setRequired(false)
                .addChoices(
                    { name: 'Sunny', value: 'sunny' },
                    { name: 'Rainy', value: 'rainy' },
                    { name: 'Snowy', value: 'snowy' },
                    { name: 'Windy', value: 'windy' },
                    { name: 'Foggy', value: 'foggy' },
                    { name: 'Stormy', value: 'stormy' }
                )),

    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        const customEmoji = interaction.options.getString('emoji');
        const distance = interaction.options.getInteger('distance') || 20;
        const language = interaction.options.getString('language') || 'vi';
        const weather = interaction.options.getString('weather') || 'sunny';
        const gamemode = gamemodes[mode] ? mode : 'car';

        const userEmos = {};
        const finishOrder = [];
        let winner;

        const startEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(languages[language].race_started);
        await interaction.reply({ embeds: [startEmbed] });

        // Collecting participants
        const filter = m => m.content.toLowerCase().startsWith('join');
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });
        const participants = [];

        collector.on('collect', m => {
            if (!participants.includes(m.author.id)) {
                if (participants.length >= 25) {
                    const limitEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(languages[language].max_players);
                    return m.channel.send({ embeds: [limitEmbed] });
                }
                participants.push(m.author.id);
                userEmos[`<@${m.author.id}>`] = customEmoji || gamemodes[gamemode][Math.floor(Math.random() * gamemodes[gamemode].length)];
                const joinEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setDescription(languages[language].player_joined.replace('{player}', m.author.id));
                m.channel.send({ embeds: [joinEmbed] });
            }
        });

        collector.on('end', async () => {
            if (participants.length < 2) {
                const notEnoughEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(languages[language].not_enough_players);
                return interaction.channel.send({ embeds: [notEnoughEmbed] });
            }

            // Display participants
            const playerMentions = participants.map(id => `<@${id}>`).join(', ');
            const playersEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(languages[language].participants.replace('{participants}', playerMentions));
            await interaction.channel.send({ embeds: [playersEmbed], flags: 64 });

            let raceMsg = participants.map(player => `🏁 ${'≡ '.repeat(distance)}${userEmos[`<@${player}>`]} <@${player}>`).join('\n');
            const raceMessage = await interaction.channel.send(raceMsg);

            const interval = setInterval(async () => {
                raceMsg = move(raceMsg, interval);
                await raceMessage.edit(raceMsg);

                const raceProgressEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('📍 Tiến trình cuộc đua')
                    .setDescription(raceMsg)
                    .addField('Thời tiết', languages[language].weather_options[weather])
                    .setFooter({ text: 'Cuộc đua đang diễn ra!' });

                await interaction.channel.send({ embeds: [raceProgressEmbed] });
            }, 3000);

            // Move players function
            function move(raceMsg, interval) {
                const raceLines = raceMsg.split('\n');
                if (!raceLines.every(line => line.includes('🚩'))) {
                    const updatedLines = raceLines.map(line => {
                        if (!line.includes('🚩')) {
                            let movementNumber = Math.floor(Math.random() * 3) + 1;
                            movementNumber *= weatherEffects[weather];

                            // Apply random events
                            line = applyRandomEvent(line, movementNumber, weather, language, interaction);

                            // Ensure players at the back get a boost
                            if (finishOrder.length > 0 && finishOrder.length < participants.length / 2) {
                                movementNumber *= 1.5; // 50% speed boost for players at the back
                            }

                            const parts = line.split(' ');
                            const playerTag = parts[distance + 2];
                            const objectIndex = parts.indexOf(userEmos[playerTag]);

                            if (objectIndex - movementNumber < 2) {
                                const newParts = arrayMove(parts, objectIndex, 1);
                                if (!finishOrder.includes(playerTag)) {
                                    finishOrder.push(playerTag);
                                }
                                return `🚩 ${newParts.slice(1).join(' ')}`;
                            }
                            const newParts = arrayMove(parts, objectIndex, objectIndex - movementNumber);
                            return newParts.join(' ');
                        }
                        return line;
                    });

                    // Ensure that players overtake each other
                    updatedLines.sort((a, b) => {
                        const aDistance = a.indexOf('🚩') - a.indexOf(userEmos[a.split(' ')[distance + 2]]);
                        const bDistance = b.indexOf('🚩') - b.indexOf(userEmos[b.split(' ')[distance + 2]]);
                        return aDistance - bDistance;
                    });

                    return updatedLines.join('\n');
                } else {
                    clearInterval(interval);
                    winner = finishOrder[0];

                    const winnerEmbed = new EmbedBuilder()
                        .setColor('#ffda35')
                        .setDescription(languages[language].race_result.replace('{winner}', winner));
                    interaction.channel.send({ embeds: [winnerEmbed] });

                    const leaderboard = finishOrder.slice(0, 10).map((playerTag, index) => `${index + 1}. ${playerTag}`).join('\n');

                    const leaderboardEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(languages[language].leaderboard)
                        .setDescription(leaderboard);
                    interaction.channel.send({ embeds: [leaderboardEmbed] });
                }
            }
        });
    }
};
