const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config()
const readline = require('readline');
const { promisify } = require('util');
const {ids, check, emoji, delay} = require('./config.js')

const setTimeoutAsync = promisify(setTimeout);
const client = new Client();
let reactionLock = false;
let on_off = true;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    if (input.trim().toLowerCase() === 'toggle') {
        on_off = !on_off;
        console.log(`Бот ${on_off ? 'увімкнений' : 'вимкнений'}`);
    }
});

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);

    console.log('Фільтр активний по:');

    const activeObjects = await getInfo();
    for (const [key, values] of Object.entries(activeObjects)) {
        console.log(`🔹 ${key.charAt(0).toUpperCase() + key.slice(1)}: ${check[key] ? values.join(", ") : '-'}`)
    }
});

client.on('messageCreate', async msg => {
    if(msg.author.bot) return;

    if(
        (!check.guild || (check.guild && ids.guild.includes(msg.guildId))) &&
        (!check.channel || (check.channel && ids.channel.includes(msg.channelId))) &&
        (!check.user || (check.user && ids.user.includes(msg.author.id)))
    ){
        await addReaction(msg);
    }

})

async function addReaction(msg) {
    if (reactionLock || !on_off) return;
    reactionLock = true;

    try {
        await msg.react(emoji);
        await setTimeoutAsync(delay);
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
            console.log(`[${msg.author.displayName}-${msg.author.id}]`);
        } else {
            console.log("Reaction not found in cache.");
            await setTimeoutAsync(delay);
            await reaction.users.remove(client.user.id);
        }
    } catch (err) {
        console.error('Request failed:', err);
    } finally {
        reactionLock = false;
    }
}

async function getInfo() {
    const result = {
        guild: [],
        channel: [],
        user: []
    };
    for(const key of Object.keys(check)){
        if (check[key]) {
            for (const keyId of ids[key]) {
                if (keyId) {
                    try {
                        const data = await client[`${key}s`].fetch(keyId);
                        result[key].push(data.name);
                    } catch (error) {
                        console.error(`Не вдалося отримати сервер з ID ${keyId}:`, error);
                    }
                }
            }
        }
    }

    return result;
}


client.login(process.env.TOKEN);