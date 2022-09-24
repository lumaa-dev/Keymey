const Discord = require("discord.js");

module.exports = {
	async createChannel(
		guild = Discord.Guild,
		name,
		type = "text",
		nsfw = false,
		slowmode = 0,
		category = Discord.GuildChannel
	) {
		if (!guild.me.permissions.has("MANAGE_CHANNELS"))
			return console.error("Permission missing in " + guild.id);
		await guild.channels.create(name, {
			type: type,
			nsfw: nsfw,
			rateLimitPerUser: slowmode,
			parent: category,
			reason: "Lumaa#4880",
		});

		return console.log("Created channel");
	},

	async lockChannel(channel) {
		if (!channel) return console.error("No channel to lock");

		await channel.updateOverwrite(channel.guild.roles.everyone, {
			SEND_MESSAGES: false,
		});
		return console.log("Locked channel");
	},

	async unlockChannel(channel) {
		if (!channel) return console.error("No channel to unlock");

		await channel.updateOverwrite(channel.guild.roles.everyone, {
			SEND_MESSAGES: true,
		});
		return console.log("Unlocked channel");
	},

	async sudo(message, args) {
		const target =
			message.mentions.users.first() ||
			message.guild.members.cache.get(args[0]) ||
			message.guild.members.cache.find(
				(member) => member.user.username === args.join(" ").split(", ")[0]
			);
		if (!target) return message.channel.send("Unkown member");

		const guildMember = message.guild.members.cache.get(target.id);
		let webhook;
		const webhooks = await message.channel.fetchWebhooks();

		if (webhooks.first()) {
			webhook = webhooks.first();
		} else {
			message.channel.createWebhook("sudo");
			const newWebhooks = await message.channel.fetchWebhooks();
			webhook = newWebhooks.first();
		}

		webhook.send(args.join(" ").split(", ").slice(1).join(", "), {
			avatarURL: guildMember.user.avatarURL(),
			username: guildMember.nickname || guildMember.user.username,
		});
	},
};
