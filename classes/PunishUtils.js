/**
 * 
 *  This code is ASS! Punish me daddy. :3
 *  Author: Naughty Klaus
 * 
 *  I am ashamed.
 * 
 */

const {
    SlashCommandBuilder, ActionRowBuilder, Events, ModalBuilder,
    TextInputBuilder, TextInputStyle, ButtonInteraction, ButtonBuilder,
    ButtonStyle, EmbedBuilder, DMChannel, Collection, hyperlink
} = require('discord.js');

const Infraction = require("./Infraction");
const TimeUtils = require("./TimeUtils");

const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const Logger = require(`./Logger`);

const mongo = require('./Mongo');
const guild_settings = require(`${appDir}/schemas/GuildSettings`);

module.exports = {
    async listInfractions(bot, interaction, guildSettings) {
        let users;

        if (guildSettings) {
            users = guildSettings.users;
        }

        if (users) {
            const memberIndex = users.findIndex(member => member._id === interaction.targetMember.id);

            if (memberIndex > -1) {
                const member = users[memberIndex];

                if (member.infractions == undefined || member.infractions == []) {
                    await interaction.user.createDM(true);
                    await interaction.user.send({contents: `Member of ${interaction.guild.name}, ${interaction.targetMember.displayName} has no infractions.`});

                    return;
                }

                let totalPoints = 0;

                member.infractions.forEach(infraction => {
                    let expired = false;

                    if(infraction.expired)
                        expired = true;
                    else
                        totalPoints += infraction.infractionPoints;

                    const embed = new EmbedBuilder()
                        .setColor('#FFFFFF')
                        .setTitle(`Infracted member: ${interaction.targetMember.displayName}`)
                        .setDescription(`${hyperlink(`${interaction.guild.name}`, `https://discord.com/channels/${interaction.guild.id}`)}`)
                        .addFields(
                            { name: 'Type:', value: `${infraction.infractionType}` },
                            { name: 'Reason:', value: `${infraction.infractionReason}` },
                            { name: 'Points:', value: `${infraction.infractionPoints}` },
                            { name: expired ? 'Expired?' : 'Expires on:', value: expired ? 'yes' : `${infraction.infractionExpiration}`},
                        ).setFooter({ text: `Member's username: ${interaction.targetUser.username}#${interaction.targetUser.discriminator}` });
                    

                    interaction.user.createDM(true);
                    interaction.user.send({ embeds: [embed] });
                });

                interaction.user.createDM(true);
                interaction.user.send({ content: `Member of ${interaction.guild.name}, has ${totalPoints} infraction points.` });
            } else {
                const newMember = {
                    _id: interaction.targetMember.id,
                    permissions: 0,
                    infractions: [],
                };
                users.push(newMember);

                await interaction.user.createDM(true);
                await interaction.user.send({contents: `Member of ${interaction.guild.name}, ${interaction.targetMember.displayName} has no infractions.`});
            }
        }
    },

    async applyInfraction(bot, interaction, type, guildSettings) {

        let nameInput = new TextInputBuilder()
            .setCustomId('nameInput')
            .setLabel(`Who you're ${type}ing (id):`)
            .setStyle(TextInputStyle.Short)
            .setValue(interaction.targetUser.id)
            .setRequired(true);

        let reasonInput = new TextInputBuilder()
            .setCustomId('reasonInput')
            .setLabel(`Why they're being ${type}ed:`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        let lengthInput = new TextInputBuilder()
            .setCustomId('lengthInput')
            .setLabel("Length (e.g: 1yr 2mo 3day 4hr 5min 6sec)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("infinite")
            .setRequired(true);

        let ticket = new Date().getTime().toString();
        const postModal = new ModalBuilder()
            .setCustomId(`${type}-user-modal`)
            .setTitle(`${type} Member`.replace("Mut", "Mute"))
            .addComponents(
                new ActionRowBuilder().setComponents(nameInput),
                new ActionRowBuilder().setComponents(reasonInput),
                new ActionRowBuilder().setComponents(lengthInput),
            )

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
            reasonInput = submitted.fields.getTextInputValue("reasonInput");
            lengthInput = submitted.fields.getTextInputValue("lengthInput");

            if(!interaction.targetMember.manageable) {
                // await interaction.deferReply();
                interaction.member.createDM(true);
                return interaction.member.send({ content: `${interaction.targetMember.displayName} cannot be managed in ${interaction.guild.name}.` });
            }

            if (reasonInput == "")
                reasonInput = "Not specified.";

            let expireTimeUnix = 0;

            if (lengthInput == "infinite")
                expireTimeUnix = -1
            else {
                expireTimeUnix = TimeUtils.addTime(lengthInput);
                //console.log(expireTimeUnix);
            }

            let expiresOn = "";

            if (expireTimeUnix != -1) {
                expiresOn = TimeUtils.getFormattedDateTime(expireTimeUnix) + " (PST)"
            } else {
                expiresOn = "Never";
            }

            Logger.log(`Infraction in guild ${interaction.guild.name}:`);
            Logger.log_all(`User: ${interaction.targetUser.username}`, `ID: ${interaction.targetUser.id}`,
                           `Reason: ${reasonInput}`, `Expiration: ${expiresOn}`,
                           `Type: ${type}`, `Moderator: ${interaction.user.username}`);

            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(`You have been ${type}ed!`)
                .setDescription(`${hyperlink(`${interaction.guild.name}`, `https://discord.com/channels/${interaction.guild.id}`)}`)
                .addFields(
                    { name: 'Reason:', value: `${reasonInput}` },
                    { name: 'Expires on:', value: `${expiresOn}` },
                ).setFooter({ text: `${type}ed by ${interaction.user.username}.` });

            interaction.targetUser.createDM(true);
            interaction.targetUser.send({ embeds: [embed] });
            
            let points = 0;

            switch(type) {
                case "ban":
                case "Bann":
                    points = 3;
                    break;
                
                case "mute":
                case "Mut":
                case "Kick":
                    points = 2;
                    break;
                
                case "Warn":
                    points = 1;
                    break;
            }

            const infraction = new Infraction(interaction.targetUser.id, type, reasonInput, points, expireTimeUnix);

            let users;

            if (guildSettings) {
                users = guildSettings.users;
            }

            if (users) {
                const memberIndex = users.findIndex(member => member._id === interaction.targetMember.id);

                if (memberIndex > -1) {
                    const member = users[memberIndex];
                    if (member.infractions == undefined)
                        member.infractions = [];

                    member.infractions.push(infraction);
                    users[memberIndex] = member;
                } else {
                    const newMember = {
                        _id: interaction.targetMember.id,
                        permissions: 0,
                        infractions: [infraction],
                    };
                    users.push(newMember);
                }
            }

            try {

                await guild_settings.findOneAndUpdate(
                    {
                        _id: `${interaction.guild.id}`,
                    },
                    {
                        users: users,
                    }, 
                    {
                        new: true,
                        upsert: true // Make this update into an upsert
                    }
                );
                //await guild_settings.save();
            } catch(e) {
                console.log(e);
                //mongoose.connection.close();
            }

            switch (infraction.getType()) {
                case "ban":
                    if(interaction.targetMember.manageable)
                        await interaction.targetMember.ban({ reason: reasonInput });
                    break;
                case "kick":
                    if(interaction.targetMember.manageable)
                        await interaction.targetMember.kick(reasonInput);
                    break;
                case "mute":
                    if(interaction.targetMember.manageable)
                        await interaction.targetMember.timeout(expireTimeUnix - new Date().getTime());
                    break;
                case "warn":

                    break;
            }
        }
    }
}