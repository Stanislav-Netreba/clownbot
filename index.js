const { Client } = require('discord.js-selfbot-v13');
const {ids, check, emoji} = require('./config.json')
require('dotenv').config()
const client = new Client();
const { promisify } = require('util');
const setTimeoutAsync = promisify(setTimeout);

let reactionLock = false;

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    console.log(Object.values(await getInfo()));
})

// client.on('messageCreate', async msg => {
//     if(msg.author.bot) return;
//
//     if(
//         (!check.guild || (check.guild && ids.guild.includes(msg.guildId))) &&
//         (!check.channel || (check.channel && ids.channel.includes(msg.channelId))) &&
//         (!check.user || (check.user && ids.user.includes(msg.author.id)))
//     ){
//         await addReaction(msg);
//         await setTimeoutAsync(700);
//         await removeReaction(msg);
//     }
//
// })

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

async function getInfo() {
    const result = {
        guilds: [],
        channels: [],
        users: []
    };

    if (check.guild) {
        for (const guildId of ids.guild) {
            if (guildId) {
                try {
                    const guild = await client.guilds.fetch(guildId);
                    result.guilds.push(guild.name);
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
                    result.channels.push(channel.name);
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
                    result.users.push(user.username);
                } catch (error) {
                    console.error(`Не вдалося отримати користувача з ID ${userId}:`, error);
                }
            }
        }
    }

    return result;
}


client.login(process.env.TOKEN);