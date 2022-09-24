const Discord = require("discord.js");
const { correctEpoch } = require("./other");

module.exports = {
	getCreation(user) {
		const date = Date.parse(user.createdAt).toString();

		const timestamp = correctEpoch(date);
		return timestamp;
	},

	getJoined(member) {
		const timestamp = correctEpoch(member.guild.joinedTimestamp);
		return timestamp;
	},
};
