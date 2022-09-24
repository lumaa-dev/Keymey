const { Client, EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const { correctEpoch } = require("../functions/js/other");


module.exports = {
    data: {
        name: "ping",
        description: "Get the latency of this bot",
    },
    
    /**
     * Ping Command (API & WS Ping)
     * @param {Info}
     */
    async execute(info) {
        /**@type {Client} */
        const client = info.client;
        /**@type {ChatInputCommandInteraction} */
        const interaction = info.interaction;

        const ws = client.ws.ping;
        let now = Date.now()
        let m = await interaction.reply({ embeds: [embed(ws)] })
        const api = Number(correctEpoch(interaction.createdTimestamp - now))
        
        await interaction.editReply({ embeds: [embed(ws, api)] })
    }
}

/**
 * 
 * @param {Number} ws 
 * @param {Number} api 
 */
function embed(ws, api) {
    const field = typeof api == "number" ? { name: "API Ping", value: `${api}ms`, inline: true } : { name: "API Ping", value: "*Loading...*", inline: true }
    const e = new EmbedBuilder()
    .setColor("Green")
    .setFields([{ name: "Bot Ping", value: `${ws}ms`, inline: true }, field])

    return e;
}