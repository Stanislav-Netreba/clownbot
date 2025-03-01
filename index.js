const { Client } = require('discord.js-selfbot-v13');
const {ids, check, emoji, delay} = require('./config.json')
require('dotenv').config()
const readline = require('readline');
const { promisify } = require('util');
const setTimeoutAsync = promisify(setTimeout);

const client = new Client();
let reactionLock = false;
let on_off = false;

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

    if (check.guild) {
        for (const guildId of ids.guild) {
            if (guildId) {
                try {
                    const guild = await client.guilds.fetch(guildId);
                    result.guild.push(guild.name);
                } catch (error) {
                    console.error(`Не вдалося отримати сервер з ID ${guildId}:`, error);
                }
            }
        }
    }

    if (check.channel) {
        for (const channelId of ids.channel) {
            if (channelId) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    result.channel.push(channel.name);
                } catch (error) {
                    console.error(`Не вдалося отримати канал з ID ${channelId}:`, error);
                }
            }
        }
    }

    if (check.user) {
        for (const userId of ids.user) {
            if (userId) {
                try {
                    const user = await client.users.fetch(userId);
                    result.user.push(user.username);
                } catch (error) {
                    console.error(`Не вдалося отримати користувача з ID ${userId}:`, error);
                }
            }
        }
    }

    return result;
}


client.login(process.env.TOKEN);