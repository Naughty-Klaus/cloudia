const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const wait = require('node:timers/promises').setTimeout;

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Rain = require(`${appDir}/classes/Rain.js`);

const BotPermissions = require("../classes/Permissions");

module.exports = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restarts this bot (Cloudia).'),
	async execute(interaction, permission, bot)  {
		if (BotPermissions.hasPermission("BOT_ADMINISTRATOR", permissions)) {
			await interaction.reply({ content: "Restarting Cloudia. This may take a bit.", ephemeral: true });
			await wait(5000)
			await interaction.deleteReply();

			Rain(bot, function() {
				if(!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
					return false;
				}
				return true;
			}, "RefreshBot");
		} else {
			await interaction.reply(`You are lacking permissions to use this command.`);
		}
	},
};