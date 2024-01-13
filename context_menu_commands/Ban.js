const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const BotPermissions = require("../classes/Permissions");
const TimeUtils = require("../classes/TimeUtils");
const PunishUtils = require("../classes/PunishUtils");

const {
    SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder,
    TextInputBuilder, TextInputStyle, ButtonInteraction, ButtonBuilder,
    ButtonStyle, EmbedBuilder, DMChannel, Collection, hyperlink
} = require('discord.js');

const mongo = require(`${appDir}/classes/Mongo`);
const guild_settings = require(`${appDir}/schemas/GuildSettings`);

module.exports = {
    global: true,
    data: new ContextMenuCommandBuilder()
        .setName("Ban")
        .setType(ApplicationCommandType.User),
    async execute(interaction, permissions, bot) {
        if (BotPermissions.hasPermission("GUILD_ADMINISTRATOR", permissions)
            || BotPermissions.hasPermission("SIMPLE_BAN_MENU", permissions)) {

            try {
                guildSettings = await guild_settings.findOne({ _id: interaction.guildId });
            } finally {
                //mongoose.connection.close();
            }
            let enabled = false;

            if (guildSettings) {
                const features = guildSettings.features;
                const feature = features.find((f) => f.name == "moderation");
                if (feature) {
                    enabled = feature.enabled;
                }
            }

            if (!enabled) {
                await interaction.reply({ content: 'The moderation feature is not enabled on this server.', ephemeral: true });
                return;
            }

            await PunishUtils.applyInfraction(bot, interaction, "Bann", guildSettings);
        } else {
            await interaction.reply({ content: `You are lacking permissions to use this command.`, ephemeral: true });
        }
    },
};