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
        (!check.guild || (check.guild && ids.guild === msg.guildId)) &&
        (!check.channel || (check.channel && ids.channel.includes(msg.channelId))) &&
        (!check.user || (check.user && ids.user.includes(msg.author.id)))
    ){
        await addAndRemoveReaction(msg);
    }

})

async function addAndRemoveReaction(msg) {
    if (reactionLock) return;
    reactionLock = true;

    try {
        await msg.react(emoji);
        await setTimeoutAsync(700);

        await removeReaction(msg);
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
            console.log()

            console.log(`Succses [${msg.author.displayName}]`);
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