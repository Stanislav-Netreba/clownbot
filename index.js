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

    if(
        // ids.guild.includes(msg.guildId) &&
        ids.channel.includes(msg.channelId)
        // ids.user.includes(msg.author.id)
    ){
        await addAndRemoveReaction(msg);
    }

})

async function addAndRemoveReaction(msg) {
    if (reactionLock) return;
    reactionLock = true;

    try {
        await msg.react(emoji);
        await setTimeoutAsync(250);

        await removeReaction(msg);
    } catch (err) {
        console.error('Request failed:', err);
        reactionLock = false;
    }
}

async function removeReaction(msg) {
    try{
        await msg.reactions.cache.get(emoji).remove()
    } catch (err) {
        console.error('Request failed:', err);
    } finally {
        reactionLock = false;
    }
}

client.login(process.env.TOKEN);