const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands.'),
    async execute(interaction, client) {
        const commands = [];
        const commandsPath = path.join(__dirname, '..');

        function readCommands(dir) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                if (file.isDirectory()) {
                    readCommands(path.join(dir, file.name));
                } else if (file.name.endsWith('.js')) {
                    const command = require(path.join(dir, file.name));
                    if (command.data && command.data.name) {
                        commands.push({
                            name: command.data.name,
                            description: command.data.description,
                            category: path.relative(commandsPath, dir).split(path.sep).join(' > '),
                            aliases: command.aliases || [],
                            permissions: command.permissions || 'None'
                        });
                    }
                }
            }
        }

        readCommands(commandsPath);

        const commandCategories = {};
        commands.forEach(command => {
            if (!commandCategories[command.category]) {
                commandCategories[command.category] = [];
            }
            commandCategories[command.category].push(command);
        });

        const categoryIcons = {
            'Developer': '👨‍💻',
            'Fun': '🎉',
            'Moderation': '🛡️',
            'Reports': '📊',
            'Utility': '🔧',
        };

        const isBotOwner = client.config.developers.includes(interaction.user.id);
        const categoryOptions = [{ label: 'Main page', value: 'main', emoji: '🏠' }].concat(
            Object.keys(commandCategories).filter(category => isBotOwner || category !== 'Developer').map(category => ({
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

        const response = await interaction.reply({
            embeds: [mainEmbed],
            components: [row],
            fetchReply: true,
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
        });

        collector.on('collect', async i => {
            const selectedCategory = i.values[0];
            
            if (selectedCategory === 'main') {
                await i.update({ embeds: [mainEmbed], components: [row] });
                return;
            }

            const selectedCommands = commandCategories[selectedCategory];

            const itemsPerPage = 5;
            const totalPages = Math.ceil(selectedCommands.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const embed = new EmbedBuilder()
                    .setTitle(`📂 ${selectedCategory}: `)
                    .setColor(0x00FFFF)
                    .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const commandsToShow = selectedCommands.slice(start, end);

                commandsToShow.forEach(command => {
                    embed.addFields({ 
                        name: `/${command.name}`, 
                        value: `**Description**: ${command.description || 'No description provided.'}`,
                        inline: false 
                    });
                });

                return embed;
            };

            let currentEmbed = generateEmbed(currentPage);

            const paginationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                );

            await i.update({ embeds: [currentEmbed], components: [row, paginationRow] });

            const buttonCollector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000,
            });

            buttonCollector.on('collect', async b => {
                if (b.customId === 'prev') {
                    currentPage--;
                } else if (b.customId === 'next') {
                    currentPage++;
                }

                currentEmbed = generateEmbed(currentPage);
                await b.update({
                    embeds: [currentEmbed],
                    components: [
                        row,
                        paginationRow
                            .setComponents(
                                new ButtonBuilder()
                                    .setCustomId('prev')
                                    .setLabel('Previous')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(currentPage === 0),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('Next')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(currentPage === totalPages - 1)
                            )
                    ],
                });
            });

            buttonCollector.on('end', async () => {
                await interaction.editReply({ components: [row] });
            });
        });

        collector.on('end', async collected => {
            if (!collected.size) {
                await interaction.editReply({ content: 'No category selected within the time limit.', components: [] });
            } else {
                await interaction.editReply({ components: [] });
            }
        });
    },
};
