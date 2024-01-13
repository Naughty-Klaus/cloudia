const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');
const BotPermissions = require("../classes/Permissions");

module.exports = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('bot')
		.setDescription('Displays statistics regarding Cloudia.'),
	async execute(interaction, permission, bot) {
        let disc = "https://discord.gg/f6fYMY73Yq";

        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('Bot Information')
            .setDescription(`Have any suggestions or feedback? Join our ${hyperlink(`community`, `${disc}`)}!`)
            .addFields(
                { name: 'About Cloudia', value: `Cloudia aims to be powerful, user-friendly, and feature rich. Whether Cloudia is used for social activity, economy, or moderation; we aim to be the best there is.`},
                { name: 'Community Outreach', value: `So far, Cloudia serves a total of ${await bot.totalGuilds()} servers!`},
                { name: 'Current Goal', value: `We hope to soon serve a total of ${await bot.totalServersNextGoal()} servers.` },
            ).setFooter({ text: `Thank you for your interest in Cloudia!` });

        /*const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('Cloudia Rules & Guidelines')
            .setDescription(`These include terms of use for Cloudia as a Discord bot.`)
            .addFields(
                { name: '1. Offensive Speech', value: `Do not harass, or intentionally offend another user or group. Do not post any NSFW material in the service center.`},
                { name: '2. Spam, Advertising & Privacy', value: `Do not spam any channel or member's private messages. Do not share private conversations or information. All member's have a right to privacy. All server advertisements should remain in the official #discovery channel.`},
                { name: '3. Common sense', value: `If you think something you might say or do may break this rule, try asking a moderator for approval. All action taken by moderators is up to their discretion. Do not abuse Cloudia's abilities.` },
            ).setFooter({ text: `Thank you for your interest in Cloudia!` });*/

        if(interaction.guildId) {
            await interaction.reply({embeds: [embed]});
        } else {
            const user = interaction.user;

            await user.createDM(true);
            await user.send({embeds: [embed]});
        }
	},
};