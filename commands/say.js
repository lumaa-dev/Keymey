const { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, TextBasedChannel, PermissionFlagsBits } = require("discord.js");
const { regexs } = require("../functions/js/other");

module.exports = {
    data: {
        name: "say",
        description: "Say some random things...",
        options: [
            {
                name: "input",
                description: "The things you wanna say",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "anonymous",
                description: "Hides your username",
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: "channel",
                description: "Sends your input in a channel",
                type: ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    },

    /**
     * Ping Command (API & WS Ping)
     * @param {Info}
     */
     async execute(info) {
        /**@type {ChatInputCommandInteraction} */
        const interaction = info.interaction;

        const input = interaction.options.getString("input");
        const anonymous = interaction.options.getBoolean("anonymous") ?? false;
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;

        await interaction.deferReply()

        if (channel.isTextBased()) {
            /**@type {TextBasedChannel} */
            let textChannel = channel;
            if (textChannel.permissionsFor(interaction.member).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
                const embed = new EmbedBuilder()
                .setTitle(`${anonymous ? "Anonymous" : interaction.user.tag} says...`)
                .setDescription(input.replace(regexs().urls, "[Website]"))
                .setTimestamp()
                
                await textChannel.send({ embeds: [embed] })
                await interaction.deleteReply()
            } else {
                await interaction.editReply({ content: "You do not have the permissions in this channel"})
            }
        } else {
            await interaction.editReply({ content: "Cannot send messages in a voice channel"})
        }
     }
}