const { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, ChannelType, GuildMember } = require("discord.js");
const { v4: uuid } = require("uuid");
const ModalCreator = require("../functions/modalCreator");

module.exports = {
    data: {
        name: "create",
        description: "Create something in particular",
        options: [
            {
                name: "modal",
                description: "Change things about Modals",
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [
                    {
                        name: "new",
                        description: "Create a new Modal",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "title",
                                description: "The title of the Modal",
                                type: ApplicationCommandOptionType.String,
                                required: true,
                                min_length: 1,
                                max_length: 256
                            },
                            {
                                name: "output",
                                description: "The channel the Modal respones will be sent in",
                                type: ApplicationCommandOptionType.Channel,
                                required: false,
                                channel_types: [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread]
                            }
                        ]
                    }
                ]
            }
        ]
    },

    /**
     * Create Command (Create Modal/Embeds/Etc...)
     * @param {Info} info
     */
    async execute(info) {
        /**@type {Client} */
        const client = info.client;
        /**@type {ChatInputCommandInteraction} */
        const interaction = info.interaction;

        const type = interaction.options.getSubcommandGroup();
        const action = interaction.options.getSubcommand();

        if (type == "modal") {
            if (action == "new") {
                await interaction.deferReply();

                const modalCreator = new ModalCreator(client)
                const outputChannel = interaction.options.getChannel("outputChannel") ?? interaction.channel;
                let title = interaction.options.getString("title");

                createModal(modalCreator, interaction.member, title, info.modalCreators)
                modalCreator.channels.output = outputChannel;
                

                await interaction.editReply(modalCreator.builder)
            }
        }
    }
}

/**
 * It creates a modalCreator object, which is a function that creates a modal, and pushes it to an
 * array of modalCreators.
 * @param {ModalCreator} modalCreator - The modal creator object
 * @param {GuildMember} member - the member object
 * @param {String} title - string
 * @param {ModalCreator[]} modalCreators - an array of objects that contain the uuid and the function to create the
 * modal
 * 
 * @todo Stock modals in guildmember
 */
function createModal(modalCreator, member, title, modalCreators) {
    modalCreator.build(member, title, [], [], new Array(5).fill(100))
    modalCreator.uuid = uuid();
}