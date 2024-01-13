const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const {
    SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder,
    TextInputBuilder, TextInputStyle, ButtonInteraction, ButtonBuilder,
    ButtonStyle, EmbedBuilder, DMChannel, Collection, StringSelectMenuBuilder
} = require('discord.js');
const BotPermissions = require("../classes/Permissions");

const mongo = require(`${appDir}/classes/Mongo`);
const guild_settings = require(`${appDir}/schemas/GuildSettings`);

module.exports = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure current server settings for Cloudia.'),
    async execute(interaction, permission, bot) {
        if (BotPermissions.hasPermission("GUILD_ADMINISTRATOR", permission)) {
            if (true) { // Disabling this command until further notice. 
                await interaction.reply(`This function is not yet implemented.`);
                return;
            }
        } else {
            await interaction.reply(`You are lacking permissions to use this command.`);
        }
        /*
        if(!interaction.guildId) {
            await interaction.reply("Cloudia config may only be configured within a server.");
            return;
        }

        console.log()

        await mongo().then(async mongoose => {
            try {
                guildSettings = await guild_settings.findOne({ _id: interaction.guildId });
            } finally {
                mongoose.connection.close();
            }
        });

        if(guildSettings) {
            const feature = guildSettings.features;
            const marketplace = feature.find((f) => f.name == "marketplace");
            if(marketplace) {
                enabled = marketplace.enabled;
                marketplace_channel = marketplace.settings.marketplace_channel;
                marketplace_staff_channel = marketplace.settings.marketplace_staff_channel;
            }
        }

        if(!enabled || marketplace_staff_channel == "-1") {
            await interaction.reply('The marketplace feature is not enabled on this server.');
            return;
        }

        let nameInput = new StringSelectMenuBuilder()
            .setCustomId('enableMarketplace')
            .setPlaceholder('Enable Marketplace (true/false)')
            .addOptions(
                {
                    label: 'true',
                    description: 'This is a description',
                    value: 'true',
                },
                {
                    label: 'false',
                    description: 'This is also a description',
                    value: 'false',
                },
            );

        const postModal = new ModalBuilder()
            .setCustomId(`marketplace-post-modal`)
            .setTitle('Configure Cloudia')
            .addComponents(
                new ActionRowBuilder().setComponents(nameInput),
            );

        await interaction.showModal(postModal);

        const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id,
        }).catch(error => {
            console.error(error)
            return null
        })
        
        if (submitted) {
            //nameInput = submitted.fields.getTextInputValue("nameInput");
        }*/
    },
};