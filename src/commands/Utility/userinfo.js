const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');
const Nickname = require('../../schemas/nicknames');
const Usernames = require('../../schemas/usernames');

const flags = {
    ActiveDeveloper: '<:activedeveloper:1262098654559469639>',
    Staff: 'Discord Employee',
    Partner: '<:PartnerBadge:891916220603981855>',
    Hypesquad: '<:hypersquad:891916611177566259>',
    BugHunterLevel1: '<:discord_bughunterlv1:891923878081859584>',
    HypeSquadOnlineHouse1: '<:bravery:891915115451015239>',
    HypeSquadOnlineHouse2: '<:briliance:891915051743739944>',
    HypeSquadOnlineHouse3: '<:balance:891914223385452564>',
    PremiumEarlySupporter: '<:earlysupporter:891915499947053167>',
    TeamPseudoUser: '<:employee:891924394308407306>',
    BugHunterLevel2: '<:bughunterlv2:891923923137069056>',
    VerifiedBot: 'Verified Bot',
    VerifiedDeveloper: '<:verified:891915924565798913>',
    CertifiedModerator: '<:certifiedmoderator:1262037616061317250>',
    BotHTTPInteractions: '<:bot1:1262096411055358012><:bot2:1262096408958206055>',
    Spammer: 'Spammer'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get detailed information of a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to get information of')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const memberOption = interaction.options.getMember('user');
        const member = memberOption || interaction.member;

        try {
            const [userFlags, usernameData, nicknameData, joinPosition, profileBuffer] = await Promise.all([
                member.user.fetchFlags().then(flags => flags.toArray()),
                Usernames.findOne({ discordId: member.id }).lean(),
                Nickname.findOne({ discordId: member.id, guildId: interaction.guild.id }).lean(),
                getJoinPosition(interaction.guild, member),
                profileImage(member.id)
            ]);

            const usernames = usernameData?.usernames?.join(' - ') || 'No Tags Tracked';
            const nicknames = nicknameData?.nicknames?.join(' - ') || 'No Nicknames Tracked';
            const imageAttachment = new AttachmentBuilder(profileBuffer, { name: 'profile.png' });

            const avatarButton = new ButtonBuilder()
                .setLabel('Avatar')
                .setStyle(5)
                .setURL(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

            const bannerURL = (await member.user.fetch()).bannerURL() || 'https://example.com/default-banner.jpg';
            const bannerButton = new ButtonBuilder()
                .setLabel('Banner')
                .setStyle(5)
                .setURL(bannerURL);

            const row = new ActionRowBuilder()
                .addComponents(avatarButton, bannerButton);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('User Information')
                .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
                .setImage('attachment://profile.png')
                .addFields(
                    { name: 'Username', value: member.user.username, inline: true },
                    { name: 'Discriminator', value: member.user.discriminator, inline: true },
                    { name: 'ID', value: member.id, inline: true },
                    { name: 'Nickname', value: member.nickname || 'None', inline: true },
                    { name: 'Last 5 Tags', value: usernames, inline: true },
                    { name: 'Profile Picture', value: `[Click here](${member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })})`, inline: true },
                    { name: 'Last 5 Nicknames', value: nicknames, inline: true },
                    { name: 'Emblems', value: userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None', inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(member.user.createdAt / 1000)}:f> (${Math.round((new Date() - member.user.createdAt) / 86400000)} days ago)`, inline: false },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedAt / 1000)}:f> (${Math.round((new Date() - member.joinedAt) / 86400000)} days ago)`, inline: false },
                    { name: 'Join Position', value: `${member.displayName} was the ${addSuffix(joinPosition)} person to join this server.`, inline: false },
                    { name: 'Mutual Servers', value: `${interaction.client.guilds.cache.filter(a => a.members.cache.get(member.user.id)).map(a => a.name).join(', ') || 'None'}`, inline: true },
                    { name: `Roles [${member.roles.cache.size}]`, value: `${member.roles.cache.map(role => role).join(', ')}`, inline: false },
                    { name: `Permissions [${member.permissions.toArray().length}]`, value: member.permissions.toArray().map(perm => perm.toLowerCase().replace(/_/g, ' ')).join(' » '), inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}` })
                .setTimestamp(new Date());

            interaction.editReply({ embeds: [embed], components: [row], files: [imageAttachment] });

        } catch (error) {
            interaction.editReply({ content: `\`❌\` There was an error generating the info for **${member}**` });
            console.error(`Error in userinfo command: ${error.message}`, error);
        }
    }
};

async function getJoinPosition(guild, member) {
    const members = await guild.members.fetch();
    const sortedMembers = [...members.values()].sort((a, b) => a.joinedAt - b.joinedAt);
    return sortedMembers.findIndex(m => m.id === member.id) + 1;
}

function addSuffix(number) {
    if (number % 100 >= 11 && number % 100 <= 13) return number + 'th';
    switch (number % 10) {
        case 1: return number + 'st';
        case 2: return number + 'nd';
        case 3: return number + 'rd';
        default: return number + 'th';
    }
}