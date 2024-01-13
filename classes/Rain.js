/**
 * 
 *  I have no clue why I named this system "Rain" and "Splashes". 
 *  I wrote this years ago, and I guess it's some sort of precached executable scripts system.
 *  
 *  @Author Naughty Klaus < shamefully
 * 
 */

const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const splashes = [];
const splashesScripts = fs.readdirSync(`${appDir}/classes/splash/`).filter(file => file.endsWith('.js'));

for (const script of splashesScripts) {
	const Splash = require(`${appDir}/classes/splash/${script}`);
	splashes.push(Splash);
}

function execute(bot, splashName) {
    const splash = splashes.find(element => element.name == splashName);
    if(splash) {
        try {
            let sp = new splash(bot);

            sp.execute({
                isReady: true,
            });
        } catch(error) {
            console.log(`${splashName} doesn't implement the execute(params) function!`);
            console.log(error);
        }
    } else
        console.log(`Could not run splash: ${splashName}`);
}

module.exports = (bot, check, splashName) => {
    if(check())
        execute(bot, splashName);
    else
        console.log(`Rain evaporated before ${splashName} could execute.`);
}