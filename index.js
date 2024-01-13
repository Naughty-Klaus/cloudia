// Testing some cool shit.

const fs = require('fs');

const configFile = 'config.json';
const initialConfigFile = 'config.json.initial';

// Check if config.json does not exist
if (!fs.existsSync(configFile)) {
    // Check if config.json.initial exists
    if (fs.existsSync(initialConfigFile)) {
        // Rename config.json.initial to config.json
        fs.renameSync(initialConfigFile, configFile);
        console.log(`${initialConfigFile} was renamed to ${configFile}`);
    } else {
        console.log(`${initialConfigFile} does not exist.`);
    }
} else {
    console.log(`${configFile} already exists.`);
}

const { token, prefix, mongodb_srv } = require('./config.json');

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./Cloudia.js', { totalShards: 'auto', token: token });

manager.spawn();
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));