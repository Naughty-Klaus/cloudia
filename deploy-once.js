const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./slash_commands').filter(file => file.endsWith('.js'));
const ccommandFiles = fs.readdirSync('./context_menu_commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./slash_commands/${file}`);
	commands.push(command.data.toJSON());
}

for (const file of ccommandFiles) {
	const command = require(`./context_menu_commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

let hasError = false;

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
        hasError = true
	}
})();


if(!hasError)
    console.log("Deployed global commands.");
else
    console.log("Failed to deploy global commands.");