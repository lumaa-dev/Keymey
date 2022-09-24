const { Client } = require("discord.js");

class Info {
    /**
     * 
     * @param {Client} client 
     * @param {import("discord.js").Interaction} interaction
     * @example const info = new Info(Discord.Client, Discord.CommandInteraction) // put a real client & real interaction
     * info.client.on("messageCreate", () => console.log("New Message!"))
     */
    constructor(client, interaction) {
        let data = {}
        data.client = client;
        data.interaction = interaction;

        return data;
    }
}

module.exports = Info;