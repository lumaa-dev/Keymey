const { IntentsBitField } = require("discord.js");
const Info = require("./functions/info");

const { createClient, setStatus } = require("./functions/js/client")
const { initiate } = require("./functions/js/cmds");

const client = createClient([IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds]);
// message content to initiate commands

const info = new Info(client, null)

client.once("ready", async () => {
    await setStatus(client, "Test", "WATCHING")
    console.log(`Logged as ${client.user.tag}`)
})

client.on("messageCreate", (message) => initiate(info.client, message, false))

client.login(require("./functions/config.json").token)