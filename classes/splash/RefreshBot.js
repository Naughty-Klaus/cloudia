const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const { Collection} = require('discord.js');

const Splash = require(`${appDir}/classes/Splash`);

module.exports = class RefreshBot extends Splash {

    /* refreshCommands() {
        this.bot.client.commands = new Collection();

        const commandsPath = join(appDir, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                this.bot.client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    } */

    execute = function(params) {
        this.bot.reset();
        console.log("Bot refreshed!");
    }
}