const { SlashCommandBuilder } = require('discord.js');
const BotPermissions = require("../classes/Permissions");

module.exports = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, permission, bot)  {
		await interaction.reply('Pong!');
	},
};