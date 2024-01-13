const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const { 
    SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder, 
    TextInputBuilder, TextInputStyle, ButtonInteraction, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, DMChannel, Collection, StringSelectMenuBuilder
} = require('discord.js');

const pages = [
    {   
        
        0: new StringSelectMenuBuilder()
            .setCustomId('enableMarketplace')
            .setPlaceholder('Enable Marketplace (true/false)')
            .addOptions(
                {
                    label: 'true',
                    description: 'This is a description',
                    value: true,
                },
                {
                    label: 'false',
                    description: 'This is also a description',
                    value: false,
                },
            ),
            
        1: new TextInputBuilder()
            .setCustomId('bodyInput')
            .setMaxLength(2000)
            .setLabel("Tell us what you're offering:")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true),

        2: new TextInputBuilder()
            .setCustomId('priceInput')
            .setMaxLength(48)
            .setLabel("Tell us your price (Max 48 Characters):")
            .setStyle(TextInputStyle.Short)
            .setRequired(false),
    },
];

const mongo = require(`${appDir}/classes/Mongo`);
const guild_settings = require(`${appDir}/schemas/GuildSettings`);