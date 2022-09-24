const Discord = require("discord.js");
// cont { joinVoiceChannel, createAudioPlayer } = require("@discordjs/voice");
// const ytSearch = require("yt-search");s
const config = require("../config.json");

module.exports = {
	regexs() {
		return {
			commas: /,( )?/g,
			urls: /(http(s?):\/\/www\.)*([A-z]+(\.([a-z]+)?)+)+/gi,
			maths: {
				correctMaths:
					/^(-|\+)?(\d(\.\d)?)+( ?)(?:[-+*\/]( ?)(-?|\+?)+\d+(?:\.\d+)?(?:=\d+(?:\.\d+)?)?)$/g,
			},
			// firstSmallChar: /^[a-z]?/gm
		};
	},

	async smartEval(interaction, evaluation, showPromise = true, game, client) {
		if (showPromise === false) {
			await interaction.deferReply({ ephemeral: true });
			interaction.editReply({
				content: "Executing: ```js\n" + evaluation + "```",
				ephemeral: true,
			});
			try {
				await eval(evaluation);
			} catch (e) {
				await interaction.followUp({ content: `${e}`, ephemeral: true });
				console.error(e);
			}
		} else if (showPromise === true) {
			await interaction.deferReply({ ephemeral: true });
			try {
				const promise = await eval(evaluation);
				await interaction.editReply({
					ephemeral: true,
					content: `Successful!\nResult:\n\`\`\`${promise}\`\`\``,
				});
			} catch (e) {
				await interaction.followUp({ content: `${e}`, ephemeral: true });
				console.error(e);
			}
		}
	},

	createPoll(channel, question, choice1 = "✅ - Yes", choice2 = "❌ - No") {
		//Choices format : "[emoji] - [option]"
		if (!question || !channel) return console.error("Error in createPoll()");
		var emoji1 = choice1.charAt(0);
		var emoji2 = choice2.charAt(0);
		let poll = new Discord.MessageEmbed()
			.setTitle(question)
			.description(`${choice1}\n${choice2}`)
			.setColor("RANDOM")
			.setTimestamp();
		//console.log(`${emoji1} / ${emoji2}`)
		channel
			.send({ embeds: [poll] })
			.then(async (message) => {
				await message.react(emoji1);
				await message.react(emoji2);
			})
			.then(() => {
				return console.log("Poll sent perfectly");
			})
			.catch(console.error);
	},

	async youtubeSearch(query) {
		const videoFinder = async (query) => {
			const videoResult = await ytSearch(query);
			return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
		};
		const video = await videoFinder(query);
		console.log(video);

		if (video) return video;
		if (!video) return console.error('No YT videos found with "' + query + '"');
	},

	correctEpoch(epoch = "1533135944000") {
		epoch = epoch.toString();
		if (epoch.length !== 13) {
			console.error("Incorrect Epoch");
			return epoch;
		}
		return epoch.substring(0, epoch.length - 3);
	},

	setFirstCap(string) {
		string = string.toLowerCase();

		let firstChar = string.charAt(0).toUpperCase();
		let end = string.substring(1);

		return `${firstChar}${end}`;
	},

	snowflakeToCreation(snowflake) {
		if (!snowflake || typeof snowflake == "undefined" || snowflake < 4194304)
			return console.error("No valid snowflakes provided");

		const epochwords = new Date(snowflake / 4194304 + 1420070400000).toString();
		var epochunix = Date.parse(epochwords).toString();

		const epoch = this.correctEpoch(epochunix);
		return epoch;
	},

	humanTimeToEpoch(humanTime, correct = true) {
		date = new Date(humanTime); // Your timezone!
		epoch = date.getTime() / 1000.0;
		epoch = epoch.toString().replace(".", "");
		if (correct === true) epoch = this.correctEpoch(epoch);

		return epoch;
	},

	async calculate(operation) {
		var regexs = this.regexs();
		if (typeof operation !== "string") return null;
		o = operation.replace(" ", "");
		o = o.replace(",", ".");
		if (o.match(regexs.maths.correctMaths)) {
			res = o.split(regexs.maths.correctMaths);
			const userResult = res[res.length - 1];
			o = o.split(/(?:=\d+(?:\.\d+)?)?$/)[0];
			const result = await eval(o);
			if (userResult !== "") {
				if (userResult.split("=")[1] == `${result}`) return `good|${result}`;
				if (userResult.split("=")[1] !== `${result}`)
					return `bad|${result}|${userResult.split("=")[1]}`;
			} else {
				return `${result}`;
			}
		} else {
			return null;
		}
	},

	async prettyMaths(operation) {
		const signs = ["+", "-", "*", "/", "="];
		signs.forEach((sign) => {
			operation = operation.replace(sign, ` ${sign} `);
		});
		return operation;
	},

	async play(channel, resource) {
		const connection = await joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		const player = await createAudioPlayer();
		const audioResource = await createAudioResource(resource);

		await player.play(audioResource);
		connection.subscribe(player);

		return player;
	},

	checkConfig() {
		if (typeof config !== "object") throw new Error("Config hasn't been found");
	},

	/**
	 * Randomizes an array
	 * @param {*} array The array to shuffle
	 * @returns Randomized Array
	 */
	shuffle(array) {
		if (!Array.isArray(array)) throw new Error("Item is not an array");

		let currentIndex = array.length,
			randomIndex;

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex],
				array[currentIndex],
			];
		}

		return array;
	},

	/**
	 *
	 * @param {Discord.TextBasedChannel} channel The channel to send the messages
	 * @param {Number} timestamp The timestamp of the event you want to get pinged for
	 * @param data Necessary Informations
	 */
	pingAtTimestamp(
		channel,
		timestamp = Date.now() + 60,
		data = {
			title: "",
			description: "",
			pingWho: [`<@${channel.id}>`], // dummy value
			everyone: false,
			whyCall: "Reminder",
		}
	) {
		setInterval(() => {
			var now = Date.now();
			var regexs = this.regexs();

			if (now >= timestamp) {
				let embed = new Discord.MessageEmbed()
					.setTitle(`${data.whyCall}: ${data.title}`)
					.setDescription(data.description)
					.setTimestamp(timestamp);

				let pinged = data.pingWho.toString().replace(regexs.commas, " ");

				channel.send({
					content: `${everyone ? "@everyone" : `${pinged}`}`,
					embeds: [embed],
				});
			}
		}, 5 * 1000);
	},

	checkUrls(string) {
		if (string.match(this.regexs().urls)) {
			return string.replace(this.regexs().urls, "[Website]");
		}
	},
};
