const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const mongo = require('./Mongo');
const guild_settings = require(`${appDir}/schemas/GuildSettings`);

const { Client, GatewayIntentBits, Partials, Events, Collection } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, hyperlink } = require('discord.js');
const { ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, UserContextMenuCommandInteraction } = require('discord.js');
const { DMChannel, TextChannel } = require('discord.js');

const Rain = require(`./Rain`);
const BotPermissions = require("./Permissions");
const PriorityQueue = require('js-priority-queue');

class Bot {

    async totalServersNextGoal() {
        const x = await this.totalGuilds();
        return (((x + 1) + 63) & (-64));
    }

    async totalGuilds() {
        return this.client.shard.fetchClientValues('guilds.cache.size')
            .then(shards => {
                return shards.reduce((acc, guilds) => acc + guilds, 0)
            })
    }

    refreshCommands() {
        this.client.commands = new Collection();

        /** Context Menu Commands **/

        const contextMenuCommandPath = join(appDir, 'context_menu_commands');
        const contextMenuCommandFiles = fs.readdirSync(contextMenuCommandPath).filter(file => file.endsWith('.js'));

        for (const file of contextMenuCommandFiles) {
            const filePath = join(contextMenuCommandPath, file);
            const contextMenuCommand = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in contextMenuCommand && 'execute' in contextMenuCommand) {
                this.client.commands.set(contextMenuCommand.data.name, contextMenuCommand);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        /** Slash Commands **/

        const slashCommandsPath = join(appDir, 'slash_commands');
        const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

        for (const file of slashCommandFiles) {
            const filePath = join(slashCommandsPath, file);
            const slashCommand = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in slashCommand && 'execute' in slashCommand) {
                this.client.commands.set(slashCommand.data.name, slashCommand);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    async start() {
        this.mongoose = await mongo();
        /*this.client = new Client({ 
            intents: [ 
                GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.MessageContent, GatewayIntentBits.GuildEmojisAndStickers
            ],
        });*/

        this.client = new Client({
            intents: 131071,
            partials: [Partials.Channel],
            messageEditHistoryMaxSize: 1,
            messageCacheMaxSize: 25,
            messageCacheLifetime: 21600,
            messageSweepInterval: 43200,
        });

        this.refreshCommands();
        this.login();

        /* Rain(this, function() {
            return true;
        }, "TestSplash"); */
    }

    login() {
        //console.log(BotPermissions.calculateAllPermissions());
        this.client.on(Events.InteractionCreate, async interaction => {
            let message, embed, author, authorId, title, body, price, member, ticket;

            let guildSettings = null;

            try {
                guildSettings = await guild_settings.findOne({ _id: interaction.guildId });
            } finally {
                //mongoose.connection.close();
            }

            let marketplace_channel = -1;
            let marketplace_staff_channel = -1;
            let permission = 0x00000000;

            if (guildSettings) {
                const feature = guildSettings.features;
                const marketplace = feature.find((f) => f.name == "marketplace");
                if (marketplace && marketplace.enabled) {
                    marketplace_channel = marketplace.settings.marketplace_channel;
                    marketplace_staff_channel = marketplace.settings.marketplace_staff_channel;
                }

                const user = this.findUserById(interaction.user.id, guildSettings.users);
                if (user != undefined && user.permissions != undefined) {
                    permission = user.permissions;
                }
            }

            /*await mongo().then(async mongoose => {
                try {
                    const res = await guild_settings.findOne({ _id: interaction.guildId });
                    if (res) {
                        
                    };
                } finally {
                    mongoose.connection.close();
                }
            });*/

            switch (interaction.constructor) {
                case ModalSubmitInteraction:
                    interaction.deferUpdate();
                    return;

                case ButtonInteraction:
                    switch (interaction.customId) {
                        case "marketplace-approve":
                            if (!BotPermissions.hasPermission("MANAGE_MARKETPLACE_POSTS", permission) && !BotPermissions.hasPermission("GUILD_ADMINISTRATOR", permission)) {
                                await interaction.reply("You do not have permissions to manage marketplace advertisements.");
                                return;
                            }

                            if (marketplace_channel == -1)
                                return;
                            message = interaction.message;
                            message.edit({ components: [] });

                            embed = message.embeds.at(0);

                            author = embed.data.fields.find((m) => m.name == 'Contact:').value;
                            authorId = Number(author.replace("<@", "").replace(">", ""));
                            title = embed.data.fields.find((m) => m.name == 'Title:').value;
                            body = embed.data.fields.find((m) => m.name == 'Body:').value;
                            price = embed.data.fields.find((m) => m.name == 'Price:').value;
                            if (!price) {
                                price = " ";
                            }

                            const newEmbed = new EmbedBuilder()
                                .setColor('#FFFFFF')
                                .setTitle('Approved Marketplace Advertisement')
                                .addFields(
                                    { name: 'Title:', value: `${title}` },
                                    { name: 'Body:', value: `${body}` },
                                    { name: 'Price:', value: `${price}` },
                                    { name: 'Contact:', value: `${author}` },
                                );

                            const guildChannel = interaction.guild.channels.cache.find((ch) => ch.id == marketplace_channel);
                            member = interaction.guild.members.cache.find((mem) => mem.id == authorId);

                            if (guildChannel) {
                                guildChannel.send({ embeds: [newEmbed] }).then(msg => {
                                    // const link = hyperlink("post", ``);
                                    member.createDM(true);
                                    member.send(`Your marketplace advertisement has been approved!\n\nhttps://discord.com/channels/${msg.guildId}/${msg.channelId}/${msg.id}`);
                                })
                            }
                            return;

                        case "marketplace-deny":
                            if (!BotPermissions.hasPermission("MANAGE_MARKETPLACE_POSTS", permission) && !BotPermissions.hasPermission("GUILD_ADMINISTRATOR", permission)) {
                                await interaction.reply("You do not have permissions to manage marketplace advertisements.");
                                return;
                            }

                            message = interaction.message;
                            message.edit({ components: [] });

                            embed = message.embeds.at(0);

                            ticket = embed.data.footer.text.replaceAll("Ticket: ", "");

                            author = embed.data.fields.find((m) => m.name == 'Contact:').value;
                            authorId = Number(author.replace("<@", "").replace(">", ""));

                            member = interaction.guild.members.cache.find((mem) => mem.id == authorId);
                            member.createDM(true);
                            member.send(`One of your marketplace advertisements have been denied.\n\nTicket number: ${ticket}`);
                            return;
                    }
                    return;

                case ChatInputCommandInteraction:
                    const slashCommand = interaction.client.commands.get(interaction.commandName);

                    if (!slashCommand) {
                        console.error(`No slash command matching ${interaction.commandName} was found.`);
                        return;
                    }

                    try {
                        await slashCommand.execute(interaction, permission, this);
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                    return;

                case UserContextMenuCommandInteraction:
                    const contextMenuCommand = interaction.client.commands.get(interaction.commandName);

                    if (!contextMenuCommand) {
                        console.error(`No context menu command matching ${interaction.commandName} was found.`);
                        return;
                    }

                    try {
                        await contextMenuCommand.execute(interaction, permission, this);
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                    break;

            }
        });

        this.client.on(Events.MessageCreate, async (msg) => {
            switch (msg.channel.constructor) {
                case DMChannel:
                    //console.log(`${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
                    return;

                case TextChannel:
                    switch (msg.channel.id) {
                        case 719263651160391770:
                            if (msg.embeds.length > 0 || msg.attachments.size > 0) {
                                msg.react(msg.guild.emojis.cache.get('765394519226843168'));
                            } else {
                                msg.delete();
                            }
                            return;
                    }
                    return;

                default: return;
            }

            /* if(!msg.content.startsWith(prefix) && !msg.author.bot) {
                db.serialize(function() {
                    
                    let last_message_timestamp = 2 ^ 51;
 
                    let record = db.get("SELECT last_message_timestamp FROM members WHERE discord_id=" + msg.member.id, function(err, row) {
                        if(err)
                            throw err;
                        last_message_timestamp = row.last_message_timestamp;
                        const now = Date.now() / 1000;
                        if(now >= last_message_timestamp + 0) {
                            db.get("SELECT server_exp FROM members WHERE discord_id=" + msg.member.id, function(err, inner_row) {
                                const currentLevel = GetLevel(inner_row.server_exp);
                                inner_row.server_exp += 50;
                                const thisLevel = GetLevel(inner_row.server_exp);
 
                                if(thisLevel > currentLevel) {
                                    msg.channel.send(`Level up! <@${msg.member.id}> is now level ${thisLevel}!`);
                                    const levRole = bot.guild.roles.cache.find((r) => r.name.includes("(Lv. " + thisLevel + ")"));
                                    if(levRole != null) {
                                        if(msg.member.roles.cache.find(r => r == bot.Iron)) {
                                            msg.member.roles.remove(bot.Iron);
                                        } else if(msg.member.roles.cache.find(r => r == bot.Silver)) {
                                            msg.member.roles.remove(bot.Silver);
                                        } else if(msg.member.roles.cache.find(r => r == bot.Gold)) {
                                            msg.member.roles.remove(bot.Gold);
                                        }
                                        msg.member.roles.add(levRole);
                                        msg.author.send("Congratulations! You've just ranked up to: " + levRole.name + "!");
                                    }
                                }
                                
                                db.exec("UPDATE members SET server_exp=" + inner_row.server_exp + " WHERE discord_id=" + msg.member.id);
                            });
                        }
                        last_message_timestamp = now;
                        db.exec("UPDATE members SET last_message_timestamp=" + last_message_timestamp + " WHERE discord_id=" + msg.member.id);
                    });
                    
                    record = null;
                });
            } */
        });

        this.client.once(Events.GuildCreate, async (guild) => {
            try {
                await new guild_settings({
                    _id: guild.id,
                    users: [
                        {
                            _id: guild.ownerId,
                            permissions: BotPermissions.calculatePermissions(["GUILD_ADMINISTRATOR"]),
                            infractions: []
                        }
                    ],
                    features: [
                        {
                            name: "marketplace",
                            enabled: false,
                            settings: {
                                marketplace_channel: -1,
                                marketplace_staff_channel: -1,
                            }
                        },
                        {
                            name: "moderation",
                            enabled: false,
                            settings: {
                                recordPoints: true,
                                infractionMessage: "You've been %type% in the %server_name% server for %reason% by %infracted_by_user%. This expires on %expiration_date%.",
                            }
                        },
                        {
                            name: "socials",
                            enabled: false,
                        },
                        {
                            name: "voice",
                            enabled: false,
                        },
                        {
                            name: "utilities",
                            enabled: true,
                        }
                    ],
                }).save();
                /*await guild_settings.findOneAndUpdate(
                    {
                        _id: guild.id
                    },
                    {
                        _id: guild.id,
                        users: [
                            {
                                _id: guild.ownerId,
                                permissions: BotPermissions.calculatePermissions(["BOT_ADMINISTRATOR"]),
                                infractions: []
                            }
                        ],
                        features: [
                            {
                                name: "marketplace",
                                enabled: false,
                                settings: {
                                    marketplace_channel: -1,
                                    marketplace_staff_channel: -1,
                                }
                            },
                            {
                                name: "moderation",
                                enabled: false
                            },
                            {
                                name: "socials",
                                enabled: false,
                            },
                            {
                                name: "voice",
                                enabled: false,
                            },
                            {
                                name: "utilities",
                                enabled: true,
                            }
                        ],
                        banTable: [],
                        muteTable: [],
                    },
                    {
                        upsert: true
                    }
                );*/
            } finally {
                //mongoose.connection.close();
            }
        });

        this.client.once(Events.ClientReady, async (c) => {
            this.guild = this.client.guilds.cache.find((g) => g.id == 719249964852838441); // guildId 719249964852838441
            /*await mongo().then(async mongoose => {
                try {
                    await guild_settings.findOneAndUpdate(
                        {
                            _id: this.guild.id
                        },
                        {
                            _id: this.guild.id,
                            users: [
                                {
                                    _id: this.guild.ownerId,
                                    permissions: BotPermissions.calculatePermissions(["GUILD_ADMINISTRATOR"]),
                                    infractions: []
                                }
                            ],
                            features: [
                                {
                                    name: "marketplace",
                                    enabled: false,
                                    settings: {
                                        marketplace_channel: -1,
                                        marketplace_staff_channel: -1,
                                    }
                                },
                                {
                                    name: "moderation",
                                    enabled: false,
                                    settings: {
                                        recordPoints: true,
                                        infractionMessage: "You've been %type% in the %server_name% server for %reason% by %infracted_by_user%. This expires on %expiration_date%",
                                    }
                                },
                                {
                                    name: "socials",
                                    enabled: false,
                                },
                                {
                                    name: "voice",
                                    enabled: false,
                                },
                                {
                                    name: "utilities",
                                    enabled: true,
                                }
                            ],
                            banTable: [],
                            muteTable: [],
                        },
                        {
                            upsert: true
                        }
                    );
                } finally {
                    mongoose.connection.close();
                }
            });*/
            console.log(`Ready! Logged in as ${c.user.tag}`);

            const intervalDuration = 5 * 1000; // 1 minute in milliseconds

            // Function to check for expired infractions
            async function checkExpiredInfractions() {
                const currentTimestamp = new Date().getTime();
                let guildSettings;

                try {
                    const all = await guild_settings.find({});

                    for (const g of all) {
                        const guild = c.guilds.cache.find((gu) => gu.id === g._id);
                        const users = g.users;

                        for (const user of users) {
                            if (user.infractions) {
                                /** Remove expired infractions - this is temporary! **/
                                const expiredInfractions = user.infractions.filter(infraction => currentTimestamp > infraction.infractionExpiration);

                                for (const i of expiredInfractions) {
                                    if(!i.expired)
                                        switch (i.infractionType) {
                                            case "ban":
                                                guild.members.unban(`${user._id}`)
                                                    .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
                                                    .catch(console.error);
                                                break;
                                            case "mute":
                                                /** Timeouts will be done regardless. This case is not needed. **/

                                                /*
                                                    const member = guild.members.cache.find((u) => u.id === user._id);
                                                    if(member)
                                                        member.timeout(null);
                                                */
                                                break;
                                        }

                                    i.expired = true;
                                }
                                // Should keep a history of all infractions, including expired ones. Following line no longer needed for testing.
                                // user.infractions = user.infractions.filter(infraction => currentTimestamp < infraction.infractionExpiration);
                            }
                        }

                        await guild_settings.findOneAndUpdate(
                            { _id: g.id },
                            { users: users }
                        );
                    }
                } finally {
                    //mongoose.connection.close();
                }
            }

            const interval = setInterval(checkExpiredInfractions, intervalDuration);
            interval.unref();

        });
        this.client.login(this.token);
    }

    hasPermission(userId, permission, array) {
        const user = findUserById(userId, array);
        if (user != undefined) {
            if (user.permissions != undefined) {
                if (BotPermissions.hasPermission(permission, user.permissions)) {
                    return true;
                }
            }
        }
        return false;
    }

    findUserById(userId, array) {
        return array.find(user => user._id == userId);
    }

    stop() {
        this.client.destroy();
        this.client = null;
    }

    reset() {
        this.stop();
        this.start();
    }

    constructor(token, AvatarOverrideURI) {
        this.token = token;
        this.start();
    }
}

module.exports = Bot