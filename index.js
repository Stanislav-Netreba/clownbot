const { Client } = require('discord.js-selfbot-v13');
const {ids, check, emoji} = require('./config.json')
require('dotenv').config()
const client = new Client();
const { promisify } = require('util');
const setTimeoutAsync = promisify(setTimeout);

let reactionLock = false;

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
})

client.on('messageCreate', async msg => {
    if(msg.author.bot) return;

    if(
        (!check.guild || (check.guild && ids.guild.includes(msg.guildId))) &&
        (!check.channel || (check.channel && ids.channel.includes(msg.channelId))) &&
        (!check.user || (check.user && ids.user.includes(msg.author.id)))
    ){
        await addReaction(msg);
        await setTimeoutAsync(700);
        await removeReaction(msg);
    }

})

async function addReaction(msg) {
    if (reactionLock) return;
    reactionLock = true;

    try {
        await msg.react(emoji);
    } catch (err) {
        console.error('Request failed:', err);
        reactionLock = false;
    }
}

async function removeReaction(msg) {
    try {
        const reaction = msg.reactions.cache.get(emoji);
        if (reaction) {
            await reaction.users.remove(client.user.id);
            console.log(`[${msg.author.displayName}-${msg.author.id}]`);
        } else {
            console.log("Reaction not found in cache.");
        }
    } catch (err) {
        console.error('Request failed:', err);
    } finally {
        reactionLock = false;
    }
}

client.login(process.env.TOKEN);