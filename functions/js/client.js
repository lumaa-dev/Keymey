const { ActivityType } = require("discord.js");
const Discord = require("discord.js");

module.exports = {
	/**
	 * 
	 * @param {Discord.IntentsBitField[]} intents 
	 * @returns {Discord.Client}
	 */
	createClient(intents) {
		const client = new Discord.Client({ intents: intents });
		client.hasContent = intents.includes(Discord.IntentsBitField.Flags.MessageContent);
		if (!client || typeof client == "undefined")
			return console.error("Discord changed the way to get new clients");
		return client;
	},

	/**
	 * 
	 * @param {Discord.Client} client 
	 * @param {String} name 
	 * @param {"PLAYING"|"LISTENING"|"COMPETING"|"WATCHING"} type 
	 */
	async setStatus(client, name, type = "PLAYING") {
		var t = ActivityType.Playing;
		switch (type) {
			case "PLAYING":
				t = ActivityType.Playing;
				break;

			case "WATCHING":
				t = ActivityType.Watching;
				break;

			case "LISTENING":
				t = ActivityType.Listening;
				break;

			case "COMPETING":
				t = ActivityType.Competing;
				break;

			default:
				t = ActivityType.Playing;
				break;
		}

		await client.user.setActivity({ name: name, type: t });
	},
};
