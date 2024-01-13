const Bot = require('./classes/Bot.js');
const { token, prefix, mongodb_srv } = require('./config.json');

module.exports = {
    bot: new Bot(token),
}

/*
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildEmojisAndStickers
    ],
    messageEditHistoryMaxSize: 1,
    messageCacheMaxSize: 25,
    messageCacheLifetime: 21600,
    messageSweepInterval: 43200,
});

client.on("ready", () => {
    console.log("Hello World");
});

client.on("message", (message) => {
    if (message.content === "ping") {
        message.channel.send("pong");
    }
});

client.login(process.env.TOKEN);
*/