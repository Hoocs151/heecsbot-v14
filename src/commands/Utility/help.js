const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands.'),

    async execute(interaction, client) {
        const commands = new Map();
        const commandsPath = path.join(__dirname, '..');
        const cache = new Map();

        async function readCommands(dir) {
            if (cache.has(dir)) return cache.get(dir);

            const files = await fs.readdir(dir, { withFileTypes: true });
            const categoryCommands = [];

            for (const file of files) {
                if (file.isDirectory()) {
                    categoryCommands.push(...await readCommands(path.join(dir, file.name)));
                } else if (file.name.endsWith('.js')) {
                    const command = require(path.join(dir, file.name));
                    if (command.data && command.data.name) {
                        categoryCommands.push({
                            name: command.data.name,
                            description: command.data.description,
                            category: path.relative(commandsPath, dir).split(path.sep).join(' > '),
                            aliases: command.aliases || [],
                            permissions: command.permissions || 'None'
                        });
                    }
                }
            }

            cache.set(dir, categoryCommands);
            return categoryCommands;
        }

        const allCommands = await readCommands(commandsPath);

        const commandCategories = allCommands.reduce((acc, command) => {
            if (!acc[command.category]) {
                acc[command.category] = [];
            }
            acc[command.category].push(command);
            return acc;
        }, {});

        const categoryIcons = {
            'Developer': '👨‍💻',
            'Fun': '🎉',
            'Moderation': '🛡️',
            'Reports': '📊',
            'Utility': '🔧',
        };

        const isBotOwner = client.config.developers.includes(interaction.user.id);
        const categoryOptions = [{ label: 'Main page', value: 'main', emoji: '🏠' }]
            .concat(Object.keys(commandCategories).filter(category => isBotOwner || category !== 'Developer')
                .map(category => ({
                    label: category,
                    value: category,
                    emoji: categoryIcons[category] || '📂'
                }))
            );

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-category')
            .setPlaceholder('Select a category')
            .addOptions(categoryOptions);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const mainEmbed = new EmbedBuilder()
            .setAuthor({
                name: 'Heecs Help',
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .setDescription('The bot prefix is: **`/help`**\nUse the menu to view commands based on categories!\n\n')
            .setColor(0x00FFFF)
            .addFields(
                {
                    name: '<:info:1089225972693348362> INFORMATION:',
                    value: '```CON CAC CON CAC CON CAC CON CAC ```',
                    inline: false
                },
            )
            .setTimestamp()
            .setFooter({
                text: `/help | Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({
            embeds: [mainEmbed],
            components: [row],
            flags: 64,
        });
        
        const response = await interaction.fetchReply();
        

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
        });

        collector.on('collect', async i => {
            const selectedCategory = i.values[0];

            if (selectedCategory === 'main') {
                await i.update({ embeds: [mainEmbed], components: [row], flags: 64 });
                return;
            }

            const selectedCommands = commandCategories[selectedCategory];
            const embed = new EmbedBuilder()
                .setTitle(`📂 ${selectedCategory}: `)
                .setColor(0x00FFFF);

            selectedCommands.forEach(command => {
                embed.addFields({
                    name: `/${command.name}`,
                    value: `${command.description || 'No description provided.'}`,
                    inline: false
                });
            });

            await i.update({ embeds: [embed], components: [row], flags: 64 });
        });

        collector.on('end', async collected => {
            if (!collected.size) {
                await interaction.editReply({ content: 'No category selected within the time limit.', components: [], flags: 64 });
            } else {
                await interaction.editReply({ components: [], flags: 64 });
            }
        });
    },
};
