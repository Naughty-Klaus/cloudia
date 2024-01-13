const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require('discord.js');
const BotPermissions = require("../classes/Permissions");

module.exports = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('Safely shuts down Cloudia.'),
	async execute(interaction, permission, bot)  {
		if (BotPermissions.hasPermission("BOT_ADMINISTRATOR", permissions)) {
			bot.stop();
			console.log("Cloudia has safely shut down.");
			process.on('exit', () => {});
		} else {
			await interaction.reply(`You are lacking permissions to use this command.`);
		} 
	},
};