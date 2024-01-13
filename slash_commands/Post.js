const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const BotPermissions = require("../classes/Permissions");

const {
    SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder,
    TextInputBuilder, TextInputStyle, ButtonInteraction, ButtonBuilder,
    ButtonStyle, EmbedBuilder, DMChannel, Collection
} = require('discord.js');

const mongo = require(`${appDir}/classes/Mongo`);
const guild_settings = require(`${appDir}/schemas/GuildSettings`);

module.exports = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('post')
        .setDescription('Request to add a marketplace advertisement.'),
    async execute(interaction, permission, bot) {
        if (!BotPermissions.hasPermission("MARKETPLACE_BANNED", permission) || BotPermissions.hasPermission("GUILD_ADMINISTRATOR", permission)) {
            try {
                guildSettings = await guild_settings.findOne({ _id: interaction.guildId });
            } finally {
                //mongoose.connection.close();
            }

            let marketplace_channel = -1;
            let marketplace_staff_channel = -1;
            let enabled = false;

            if (guildSettings) {
                const feature = guildSettings.features;
                const marketplace = feature.find((f) => f.name == "marketplace");
                if (marketplace) {
                    enabled = marketplace.enabled;
                    marketplace_channel = marketplace.settings.marketplace_channel;
                    marketplace_staff_channel = marketplace.settings.marketplace_staff_channel;
                }
            }

            if (!enabled || marketplace_staff_channel == "-1") {
                await interaction.reply('The marketplace feature is not enabled on this server.');
                return;
            }

            /* if(bot.userAttributes[interaction.member.id] == null)
                bot.initializeAttributes(interaction.member.id);
    
            bot.userAttributes[interaction.user.id].set("activeCommand", "post");
            bot.userAttributes[interaction.user.id].set("commandStage", 1); */

            let nameInput = new TextInputBuilder()
                .setCustomId('nameInput')
                .setMaxLength(48)
                .setLabel("Name your advertisement (Max 48 Characters):")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            let bodyInput = new TextInputBuilder()
                .setCustomId('bodyInput')
                .setMaxLength(2000)
                .setLabel("Describe your advertisement:")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            let priceInput = new TextInputBuilder()
                .setCustomId('priceInput')
                .setMaxLength(48)
                .setLabel("Set your price (Max 48 Characters):")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);


            let ticket = new Date().getTime().toString();
            const postModal = new ModalBuilder()
                .setCustomId(`marketplace-post-modal`)
                .setTitle('Create Marketplace Advertisement')
                .addComponents(
                    new ActionRowBuilder().setComponents(nameInput),
                    new ActionRowBuilder().setComponents(bodyInput),
                    new ActionRowBuilder().setComponents(priceInput),
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
                nameInput = submitted.fields.getTextInputValue("nameInput");
                bodyInput = submitted.fields.getTextInputValue("bodyInput");
                priceInput = submitted.fields.getTextInputValue("priceInput");
                if (!priceInput) {
                    priceInput = " ";
                }

                const embed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('Pending Marketplace Advertisement')
                    .addFields(
                        { name: 'Title:', value: `${nameInput}` },
                        { name: 'Body:', value: `${bodyInput}` },
                        { name: 'Price:', value: `${priceInput}` },
                        { name: 'Contact:', value: `<@${interaction.member.id}>` },
                    ).setFooter({ text: `Ticket: ${ticket}` });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`marketplace-approve`)
                            .setLabel('Approve')
                            .setStyle(ButtonStyle.Success),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`marketplace-deny`)
                            .setLabel('Deny')
                            .setStyle(ButtonStyle.Danger),
                    );

                console.log("id: " + marketplace_staff_channel);

                const channel = interaction.guild.channels.cache.find((ch) => ch.id == marketplace_staff_channel);
                channel.send({ embeds: [embed], components: [row] });

                interaction.member.createDM(true);
                interaction.member.send("Your advertisement has been queued. You'll be notified if your advertisement is approved or denied.");
            }
        } else {
            await interaction.reply(`You have been banned from the marketplace and cannot use this command.`);
        }

        // interaction.member.createDM(true);
        // interaction.member.send("Tell us what you're offering. (Max 256 Characters)");

        // interaction.delete();

        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild
        //await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    },
};