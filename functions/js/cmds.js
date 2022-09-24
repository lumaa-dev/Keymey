const Discord = require("discord.js");
const config = require("../config.json");
const { checkConfig } = require("./other");
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
	/**
	 * Help Embed with Select Menu
	 * @param {Discord.Interaction} interaction Any sort of interaction
	 * @param {Discord.User} user The user that initiated the command
	 * @param {boolean} reply Uses a reply or not
	 * @param {string} description Change the description
	 */
	showHelp(
		interaction,
		user,
		reply = true,
		description = "Select a command in the menu bellow\n\nThis bot is entirely new, and you might not get along with the commands, so that's why we made the `/help` better than ever!"
	) {
		function sortObj(obj, key) {
			function sortOn(property) {
				return function (a, b) {
					if (a[property] < b[property]) {
						return -1;
					} else if (a[property] > b[property]) {
						return 1;
					} else {
						return 0;
					}
				};
			}

			return obj.sort(sortOn(key));
		}

		options = [];
		let cmds = sortObj(config.cmds, "name");
		cmds.forEach((cmd) => {
			let option = {
				label: `/${cmd.name}`,
				description: cmd.description,
				value: cmd.name,
			};
			options.push(option);
		});

		const helpEmbed = new Discord.EmbedBuilder()
			.setTitle("Help Menu")
			.setColor("RANDOM")
			.setDescription(description)
			.setFooter({text: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) });

		const cmdMenu = new Discord.ActionRowBuilder().addComponents(
			new Discord.SelectMenuBuilder()
				.setCustomId("helpcmds")
				.setPlaceholder("Select a command")
				.addOptions(options)
		);

		if (reply === true)
			interaction.reply({ embeds: [helpEmbed], components: [cmdMenu] });
		if (reply === false) {
			interaction.deferReply();
			interaction.deleteReply();
			interaction.channel.send({ embeds: [helpEmbed], components: [cmdMenu] });
		}
	},

	/**
	 * It takes an array of file names, and returns an array of only the file names that end with ".js"
	 * @param {Array<String>} files - An array of file names.
	 * @param {Boolean} removeJs - Removes the ".js" at the end of the file name.
	 * @returns {Array<String>} An array of file names with .js at the end.
	 */
	 onlyJs(files, removeJs = false) {
		var output = [];
		files.forEach((file) => {
			if (file.endsWith(".js")) {
				output.push(removeJs ? file.replace(".js", "") : file);
			} else {
				console.log(file + " isn't .js");
			}
		});

		return output;
	},

	async selectHelpMenu(interaction, value = interaction.values[0]) {
		checkConfig();
		const cmdhelp = value;
		config.cmds.forEach((cmd) => {
			if (cmdhelp == cmd.name) {
				if (typeof cmd.options !== "undefined") {
					output = "";
					cmd.options.forEach((option) => {
						if (option.required === true) {
							output = `${output} ${option.name} [Arg]`;
						}
					});
					var example = `${output}`;
				} else {
					var example = "";
				}
				cmdEmbed = new Discord.EmbedBuilder()
					.setTitle(`/${cmd.name}`)
					.setDescription(
						`Description: \`${cmd.description}\`\nExample: \`/${cmd.name}${example}\``
					);
			}
		});
		if (typeof cmdEmbed !== "undefined") {
			interaction.reply({
				content: `Informations on /${cmdhelp}`,
				embeds: [cmdEmbed],
				ephemeral: true,
			});
			cmdEmbed = undefined;
		}
	},

	/**
	 * 
	 * @param {Discord.Client} client 
	 * @param {Discord.Message} message 
	 */
	/**
	 * Initiates all the commands
	 * @param {Discord.Client} client Bot client
	 * @param {Discord.Message} message
	 * @param {Boolean} hasCustomData If the command file(s) has the customData object
	 */
	 async initiate(client, message, hasCustomData = true) {
		checkConfig();
		if (!client.hasContent) throw new Error("Cannot deploy because the bot cannot receive message contents")
		if (
			message.author.id === config.ownerId &&
			message.content === `${config.devPrefix}deploy`
		) {
			var a = [];
			const fileSep = __dirname.includes("/") ? "/" : "\\";
			const filePath = __dirname.split(/\/|\\/g).slice(0, -2).join(fileSep);
			const files = await fs.readdirSync(filePath + "/commands");
			const cmds = onlyJs(files);

			cmds.forEach((cmd) => {
				const rfile = require("../../commands/" + cmd.replace(".js", ""));
				a.push(rfile.data);
				console.log(`/${rfile.data.name}`);
			});

			await client.guilds.cache.get(message.guild.id)?.commands.set(a);
			await client.guilds.cache
				.get(message.guild.id)
				?.commands?.cache.each(async (cmd) => {
					if (cmd.description === "Dev") {
						const all = {
							id: message.guild.roles.everyone.id,
							type: "ROLE",
							permission: false,
						};
						const owner = {
							id: config.ownerId,
							type: "USER",
							permission: true,
						};

						// v NEED A FIX v
						await cmd.permissions.set({
							command: cmd.id,
							permissions: [owner, all],
						});
						console.log("dev command");
					} else {
						console.log("global command");
					}
				});
			console.log("Initialized all commands");
			message.react({
				animated: false,
				id: "902286320536289281",
				name: "atada",
			});
		} else if (
			message.author.id === config.ownerId &&
			message.content === `${config.devPrefix}gdeploy`
		) {
			var a = [];
			const fileSep = __dirname.includes("/") ? "/" : "\\";
			const filePath = __dirname.split(/\/|\\/g).slice(0, -2).join(fileSep);
			const files = await fs.readdirSync(filePath + "/commands");
			const cmds = onlyJs(files);

			cmds.forEach((cmd) => {
				const cmdFile = require("../../commands/" + cmd.replace(".js", ""));
				if (
					(hasCustomData !== true && cmdFile.data.description === "Dev") ||
					(hasCustomData === true && cmdFile.customData.dev === true)
				)
					return;
				a.push(cmdFile.data);
			});

			await client.application?.commands.set(/*convert(a)*/ a);
			await client.guilds.cache.get(message.guild.id)?.commands.set([]);
			console.log("Initialized everywhere default commands");
			message.react({
				animated: false,
				id: "973972321436065802",
				name: "check",
			});
		}

		/**
		 * It takes an array of file names, and returns an array of only the file names that end with ".js"
		 * @param {Array<String>} files - An array of file names.
		 * @returns {Array<String>} An array of file names with .js at the end.
		 */
		function onlyJs(files) {
			var output = [];
			files.forEach((file) => {
				if (file.endsWith(".js")) {
					output.push(file);
				} else {
					console.log(file + " isn't .js");
				}
			});

			return output;
		}

		/**
		 * It takes a directory name and returns the path to that directory
		 * @param {String} mainDirectory - The name of the directory you want to get the path of.
		 * @param {String} fileSeparator [fileSeparator] - The file separator for the current OS.
		 * @returns {String} The directory of the main directory.
		 */
		function fixDirName(
			mainDirectory,
			fileSeparator = __dirname.includes("/") ? "/" : "\\"
		) {
			const splitted = __dirname.split(fileSeparator);

			if (splitted[0] === "") splitted.shift();

			const directoryIndex = splitted.indexOf(mainDirectory);
			if (directoryIndex === -1)
				throw new RangeError(`No directory found with index -1`);

			for (let i = 0; i < Number(splitted.length - directoryIndex); i++) {
				splitted.pop();
			}

			return splitted.join(fileSeparator);
		}
	},

	/**
	 * Waits for a message in a channel
	 * @param {Discord.TextChannel} channel The channel to wait in
	 * @param {Discord.User} user The user that will respond
	 * @param {Function} succeed The function when it will succeed
	 * @param {Function} error The function when it will get an error
	 */
	 async awaitMessage(
		channel,
		user,
		succeed = (collected) => console.log(collected),
		error = (e) => {
			return console.error(e);
		}
	) {
		const filter = (i) => i.author.id == user.id;

		return await channel
			.awaitMessages({ filter, max: 1 })
			.then(succeed)
			.catch(error);
	},

	/**
	 * Waits for an interaction in a message
	 * @param {Discord.Message} message The message with interactors
	 * @param {Discord.User} user The user that will respond
	 * @param {Discord.MessageComponentType | String} componentType The type of interactor (BUTTON, ACTION_ROW, SELECT_MENU)
	 * @param {Function} succeed The function when it will succeed
	 * @param {Function} error The function when it will get an error
	 */
	async awaitInteraction(
		message,
		user,
		componentType = "BUTTON",
		succeed = (collected) => console.log(collected),
		error = (e) => {
			return console.error(e);
		}
	) {
		const filter = (i) => i.user.id == user.id;
		return await message
			.awaitMessageComponent({
				componentType: componentType,
				filter,
				max: 1,
			})
			.then(succeed)
			.catch(error);
	},

	/**
	 * Waits for an modal in a interaction
	 * @param {Discord.Interaction} interaction The interaction
	 * @param {Discord.User} user The user that will respond
	 * @param {Function} succeed The function when it will succeed
	 * @param {Function} error The function when it will get an error
	 */
	async awaitModal(
		interaction,
		user,
		succeed = (collected) => console.log(collected),
		error = (e) => {
			return console.error(e);
		}
	) {
		const filter = (i) => i.user.id == user.id;
		return await interaction
			.awaitModalSubmit({ filter, max: 1, time: 86400 }) // 86400 = 24h
			.then(succeed)
			.catch(error);
	},
};