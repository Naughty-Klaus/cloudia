/*
const { permissions } = require("./permissions/permissions.js");

function checkPermission(command, member, guild) {
	if(permissions["purge"] == null)
		return false;
	else {
		if(member.id == guild.ownerID)
			return true;
		for(const id of permissions["purge"]) {
			if(member.roles.cache.some((r) => r.id == id)) 
				return true;
		}
	}
	return false;
}
*/

const { SlashCommandBuilder } = require('discord.js');
const BotPermissions = require("../classes/Permissions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Deletes # amount of the most recent messages from the present channel.')
		.addIntegerOption(option =>
			option.setName('amount')
			.setDescription('The amount of most recent messages to delete.')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(100)),
	async execute(interaction, permission, bot)  {
		if (BotPermissions.hasPermission("GUILD_ADMINISTRATOR", permissions)) {
			try {
				const limit = interaction.options.getInteger('amount');
				let amount = 0;

				await interaction.channel.messages.fetch({ limit: limit }).then(messages => {
					amount = messages.size;
					interaction.channel.bulkDelete(messages, true);
				}); 

				interaction.reply(`Purged ${amount} recent messages.`);
			} catch(error) {
				interaction.reply(`Purge command failed.`);
				console.log("Error: Couldn't execute command 'purge'. Out: \n" + error);
			}
		} else {
			await interaction.reply(`You are lacking permissions to use this command.`);
		}
	},
};