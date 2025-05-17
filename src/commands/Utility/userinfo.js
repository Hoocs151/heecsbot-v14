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

        const member = interaction.options.getMember('user') || interaction.member;

        try {
            const fetchedUser = await member.user.fetch();

            const [usernameData, nicknameData, joinPosition, profileBuffer] = await Promise.all([
                Usernames.findOne({ discordId: member.id }).lean(),
                Nickname.findOne({ discordId: member.id, guildId: interaction.guild.id }).lean(),
                getJoinPosition(interaction.guild, member),
                profileImage(member.id),
            ]);

            const userFlags = fetchedUser.flags?.toArray() || [];

            const usernames = usernameData?.usernames?.length
                ? usernameData.usernames.join(' - ')
                : 'No Tags Tracked';

            const nicknames = nicknameData?.nicknames?.length
                ? nicknameData.nicknames.join(' - ')
                : 'No Nicknames Tracked';

            const imageAttachment = profileBuffer
                ? new AttachmentBuilder(profileBuffer, { name: 'profile.png' })
                : null;

            const avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
            const avatarButton = new ButtonBuilder()
                .setLabel('Avatar')
                .setStyle(5)
                .setURL(avatarURL);

            const bannerURL = fetchedUser.bannerURL({ size: 1024 }) || 'https://example.com/default-banner.jpg';
            const bannerButton = new ButtonBuilder()
                .setLabel('Banner')
                .setStyle(5)
                .setURL(bannerURL);

            const row = new ActionRowBuilder().addComponents(avatarButton, bannerButton);

            const createdAtUnix = Math.floor(member.user.createdAt.getTime() / 1000);
            const joinedAtUnix = Math.floor(member.joinedAt.getTime() / 1000);

            const presence = member.presence?.status || 'offline';

            const boostSince = member.premiumSince
                ? `<t:${Math.floor(member.premiumSince.getTime() / 1000)}:f> (${Math.round((Date.now() - member.premiumSince.getTime()) / 86400000)} days ago)`
                : 'Not boosting';

            const rolesArray = member.roles.cache
                .filter(role => role.name !== '@everyone')
                .sort((a, b) => b.position - a.position)
                .map(role => role.name);

            const displayedRoles = rolesArray.length > 20
                ? rolesArray.slice(0, 20).join(', ') + `... (+${rolesArray.length - 20} more)`
                : rolesArray.join(', ');

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('User Information')
                .setThumbnail(avatarURL)
                .setImage(imageAttachment ? 'attachment://profile.png' : null)
                .addFields(
                    { name: 'Username', value: member.user.username, inline: true },
                    { name: 'Discriminator', value: `#${member.user.discriminator}`, inline: true },
                    { name: 'ID', value: member.id, inline: true },
                    { name: 'Nickname', value: member.nickname || 'None', inline: true },
                    { name: 'Status', value: presence.charAt(0).toUpperCase() + presence.slice(1), inline: true },
                    { name: 'Last 5 Tags', value: usernames, inline: true },
                    { name: 'Last 5 Nicknames', value: nicknames, inline: true },
                    { name: 'Emblems', value: userFlags.length ? userFlags.map(flag => flags[flag] ?? flag).join(', ') : 'None', inline: true },
                    { name: 'Account Created', value: `<t:${createdAtUnix}:f> (${Math.round((Date.now() - member.user.createdAt.getTime()) / 86400000)} days ago)`, inline: false },
                    { name: 'Joined Server', value: `<t:${joinedAtUnix}:f> (${Math.round((Date.now() - member.joinedAt.getTime()) / 86400000)} days ago)`, inline: false },
                    { name: 'Join Position', value: `${member.displayName} was the ${addSuffix(joinPosition)} person to join this server.`, inline: false },
                    { name: 'Boosting Since', value: boostSince, inline: false },
                    { name: `Roles [${rolesArray.length}]`, value: displayedRoles || 'No roles assigned', inline: false },
                    { name: `Permissions [${member.permissions.toArray().length}]`, value: member.permissions.toArray().map(perm => perm.toLowerCase().replace(/_/g, ' ')).join(' » ') || 'None', inline: false }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) })
                .setTimestamp();

            const options = { embeds: [embed], components: [row] };
            if (imageAttachment) options.files = [imageAttachment];

            await interaction.editReply(options);

        } catch (error) {
            console.error(`Error in userinfo command: ${error.message}`, error);
            await interaction.editReply({ content: `\`❌\` There was an error generating the info for **${member.user.tag}**.` });
        }
    }
};

async function getJoinPosition(guild, member) {
    const members = await guild.members.fetch();
    const sortedMembers = [...members.values()].sort((a, b) => a.joinedAt - b.joinedAt);
    return sortedMembers.findIndex(m => m.id === member.id) + 1;
}

function addSuffix(number) {
    if (!number || number <= 0) return 'Unknown';
    if (number % 100 >= 11 && number % 100 <= 13) return number + 'th';
    switch (number % 10) {
        case 1: return number + 'st';
        case 2: return number + 'nd';
        case 3: return number + 'rd';
        default: return number + 'th';
    }
}
