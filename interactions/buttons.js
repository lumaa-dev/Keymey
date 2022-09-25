const { Client, ButtonInteraction } = require("discord.js")
const Info = require("../functions/info")
const { awaitMessage } = require("../functions/js/cmds")
const ModalCreator = require("../functions/modalCreator")

module.exports = {
    data: {
        name: "buttons",
        description: "Executes when clicking a button"
    },

    /**
     * Executes when clicking a button
     * @param {Info} info
     */
    async execute(info) {
        /**@type {Client} */
        const client = info.client
        /**@type {ButtonInteraction} */
        const interaction = info.interaction
        /**@type {ModalCreator[]} */
        const modalCreators = info.modalCreators

        if (interaction.customId.startsWith("cm")) {
            // create modal = cm

            const action = interaction.customId.split("_")[1];
            const oldEmbed = interaction.message.embeds[0];

            if (oldEmbed.footer.iconURL !== interaction.user.displayAvatarURL())
                return interaction.reply({
                    content: "You cannot interact with this Modal Creator.",
                    ephemeral: true,
                });

            if (action === "addQst") {
                if (oldEmbed.fields !== null && oldEmbed.fields.length >= 4)
                    return interaction.reply({
                        content: "You cannot add any more questions.",
                        ephemeral: true,
                    });

                const newQstModal = new ModalBuilder()
                    .setTitle("Add a question")
                    .setCustomId(`cm_qst`);

                const qstInput = new TextInputBuilder()
                    .setCustomId("qst")
                    .setLabel("What is the label you want to put?")
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(45)
                    .setRequired(true);

                const phInput = new TextInputBuilder()
                    .setCustomId("ph")
                    .setLabel("What is the placeholder you want?")
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)
                    // .setPlaceholder(`Comme celui que vous lisez actuellement`)
                    .setRequired(true);

                const newQstAr = new ActionRowBuilder().addComponents([qstInput]);
                const phAr = new ActionRowBuilder().addComponents([phInput]);

                newQstModal.addComponents([newQstAr, phAr]);

                await interaction.showModal(newQstModal);
            } else if (action === "dlt") {
                await interaction.deferReply({ ephemeral: true })
                await interaction.message.delete()
                await interaction.editReply({ content: "Your Modal has been canceled.", ephemeral: true })
            } else if (action === "try") {
                const userModal = embedToModal(message.embeds[0]);

                await interaction.showModal(userModal);
            } else if (action === "edtQsts") {
                // edt = edit

                let selectMenu = new SelectMenuBuilder()
                    .setCustomId("edt_qst")
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setDisabled(false);

                var options = [];

                await interaction.deferReply();

                for (let i = 0; i < oldEmbed.fields.length; i++) {
                    const field = oldEmbed.fields[i];
                    options.push({
                        value: `qst_${i}`,
                        description: field.value.substring(1, field.value.length - 1),
                        label: field.name,
                    });
                }

                selectMenu.setOptions(options);

                await interaction.deleteReply();
                let msgMenu = await message.reply({
                    embeds: [
                        succeed(translate("edit.modal.question", interaction.guild)),
                    ],
                    components: [new ActionRowBuilder().setComponents([selectMenu])],
                });

                await awaitInteraction(
                    msgMenu,
                    interaction.user,
                    ComponentType.SelectMenu,
                    async (collected) => {
                        let { customId: name, values, message: _message } = collected;

                        if (name === "edt_qst") {
                            const value = values[0];
                            const qstIndex = value.split("_")[1];

                            message.modalEdit = new Collection();
                            message.modalEdit = qstIndex;

                            const edtModal = new ModalBuilder()
                                .setTitle(
                                    translate("edit.modal.title", interaction.guild, qstIndex)
                                )
                                .setComponents(
                                    fieldToRows(
                                        message.embeds[0].fields[qstIndex],
                                        interaction.guild
                                    )
                                )
                                .setCustomId("cm_edt");

                            await collected.showModal(edtModal);
                            // _message.delete();
                        }
                    }
                );
            } else if (action === "rmvQsts") {
                // remove questions

                let selectMenu = new SelectMenuBuilder()
                    .setCustomId("del_qst")
                    .setMaxValues(oldEmbed.fields.length)
                    .setMinValues(1)
                    .setDisabled(false);

                var options = [];

                await interaction.deferReply();

                for (let i = 0; i < oldEmbed.fields.length; i++) {
                    const field = oldEmbed.fields[i];
                    options.push({
                        value: `qst_${i}`,
                        description: field.value.substring(1, field.value.length - 1),
                        label: field.name,
                    });
                }

                selectMenu.setOptions(options);

                await interaction.deleteReply();

                const msgMenu = await interaction.channel.send({
                    embeds: [
                        loading(translate("delete.modal.questions", interaction.guild)),
                    ],
                    components: [new ActionRowBuilder().setComponents([selectMenu])],
                    ephemeral: false,
                });

                //console.log(msgMenu.interaction.message);

                await awaitInteraction(
                    msgMenu,
                    interaction.user,
                    ComponentType.SelectMenu,
                    async (collected) => {
                        let { customId: name, values, message: _message } = collected;

                        if (name === "del_qst") {
                            var hasQuestions = true;
                            var i = 0;

                            values.sort(function (a, b) {
                                return (
                                    Number(new String(a).split("_")[1]) -
                                    Number(new String(b).split("_")[1])
                                );
                            });
                            values.forEach((value) => {
                                const index = value.split("_")[1];
                                oldEmbed.fields.splice(Number(index - i), 1);
                                i = i + 1;
                            });

                            //oldEmbed.fields = qstsKeep;
                            console.log(oldEmbed.fields);
                            if (oldEmbed.fields === null || oldEmbed.fields.length < 1)
                                hasQuestions = false;

                            await _message.delete();
                            await message.edit({
                                content: message.content,
                                embeds: [oldEmbed],
                                components: modalComponent(hasQuestions, interaction),
                            });

                            collected.reply({
                                embeds: [
                                    succeed(
                                        translate("delete.modal.succeed", interaction.guild)
                                    ),
                                ],
                                ephemeral: true,
                            });
                        }
                    }
                );
            } else if (action === "done") {
                const mainChannel = interaction.channel;
                /**
                 * @type {BaseGuildTextChannel} the channel that the modal will be sent in
                 */

                var modalChannel, outputChannel;

                await interaction.reply({
                    embeds: [
                        loading(translate("finish.modal.channel", interaction.guild)),
                    ],
                    ephemeral: false,
                });

                await awaitMessage(
                    interaction.channel,
                    interaction.user,
                    /**
                     * @param {Collection} collected
                     */
                    async (collected) => {
                        /**
                         * @type {Message}
                         */
                        const _message = collected.first();

                        if (_message.content.match(/<#\d+>/g)) {
                            /**
                             * @type {TextChannel}
                             */
                            modalChannel = await _message.guild.channels.cache.get(
                                String(_message.content.match(/<#\d+>/g)[0]).match(/\d+/g)[0]
                            );

                            if (!modalChannel.isText())
                                throw new Error("error.insertVoice");

                            await modalChannel.sendTyping();

                            await _message.delete();
                        } else {
                            await _message.delete();
                            throw new Error("error.noInsertChannel");
                        }
                    },
                    (e) => {
                        return mainChannel.send({
                            embeds: [error(translate(e, _message.guild))],
                        });
                    }
                );

                if (!modalChannel) return;

                await awaitMessage(
                    interaction.channel,
                    interaction.user,
                    /**
                     * @param {Collection} collected
                     */
                    async (collected) => {
                        /**
                         * @type {Message}
                         */
                        const _message = collected.first();

                        if (_message.content.match(/<#\d+>/g)) {
                            /**
                             * @type {TextChannel}
                             */
                            outputChannel = await _message.guild.channels.cache.get(
                                String(_message.content.match(/<#\d+>/g)[0]).match(/\d+/g)[0]
                            );

                            if (!outputChannel.isText())
                                throw new Error("error.insertVoice");

                            await _message.delete();
                        } else {
                            await _message.delete();
                            throw new Error("error.noInsertChannel");
                        }
                    },
                    (e) => {
                        return mainChannel.send({
                            embeds: [error(translate(e, _message.guild))],
                        });
                    }
                );

                if (modalChannel.isText()) {
                    const schema = compactModalEmbed(
                        oldEmbed,
                        interaction.guild,
                        client.user,
                        outputChannel.id,
                        false
                    )

                    

                    const modalMsg = await modalChannel.send({
                        embeds: [
                            schema.embed
                        ],
                        components: [
                            new ActionRowBuilder().setComponents([
                                new ButtonBuilder()
                                    .setLabel(
                                        translate("button.modal.open", outputChannel.guild)
                                    )
                                    .setCustomId("openModal")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji({
                                        id: "977607026991595641",
                                        name: "paper",
                                        animated: false,
                                    }),
                            ]),
                        ],
                    });

                    const serverData = new Data(DataType("server"));
                    new ModalCreator(client).build(interaction.member, )

                    await interaction.editReply({
                        embeds: [
                            succeed(
                                translate(
                                    "finish.modal.sent",
                                    interaction.guild,
                                    modalChannel
                                )
                            ),
                        ],
                    });
                }
            }
        }
    }
}

/**
 * If the uuid is in the array, return the uuid, otherwise return the title and questions.
 * @param modalCreators - an array of objects that contain a uuid and a cm (cm is a component)
 * @param uuid - the uuid of the modal creator
 * @param creator - {
 * @returns An array of booleans.
 */
 function findModal(modalCreators, uuid, creator) {
    let uuids = modalCreators.map((cm) => cm.uuid == uuid)
    if (uuids.length > 0) {
        return uuids;
    } else {
        return modalCreators.map((cm) => { cm.cm.data.title == creator.data.title && cm.cm.data.questions == creator.data.questions })
    }
}