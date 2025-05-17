const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('emoji-list')
        .setDescription('List the server emojis')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages | PermissionFlagsBits.EmbedLinks),
    async execute(interaction) {
        const { guild, user, client } = interaction;

        // Check quyền bot
        const botMember = guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.SendMessages)) {
            return interaction.reply({ content: "Tôi không có quyền gửi tin nhắn ở kênh này nha!", ephemeral: true });
        }
        if (!botMember.permissions.has(PermissionFlagsBits.EmbedLinks)) {
            return interaction.reply({ content: "Tôi cần quyền Embed Links mới gửi được embed nha!", ephemeral: true });
        }

        // Lấy emoji
        const emojis = guild.emojis.cache.map(e =>
            e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`
        );

        if (emojis.length === 0) {
            return interaction.reply({ content: "Server này không có emoji nào nha!", ephemeral: true });
        }

        // Chia chunk
        const chunkArray = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        const total = guild.emojis.cache.size;
        const animated = guild.emojis.cache.filter(e => e.animated).size;
        const regular = total - animated;

        const chunked = chunkArray(emojis, 40);

        const embedBase = new EmbedBuilder()
            .setColor(client.config?.embedSuccess || 'Purple')
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        // Gửi embed đầu tiên
        const firstEmbed = EmbedBuilder.from(embedBase)
            .setTitle(`Server emojis — ${regular} Regular, ${animated} Animated, ${total} Total`)
            .setDescription(chunked[0].join(' '));

        await interaction.reply({ embeds: [firstEmbed] });

        // Gửi các chunk tiếp theo
        for (let i = 1; i < chunked.length; i++) {
            const embed = EmbedBuilder.from(embedBase)
                .setDescription(chunked[i].join(' '));
            await interaction.followUp({ embeds: [embed] });
        }
    }
};
