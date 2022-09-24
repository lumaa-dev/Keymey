const Discord = require("discord.js");

module.exports = {
    async addEmoji(guild, attachment, name) {
        try {
            const emoji = await guild.emojis.create(attachment, name.replace(" ", ""), { reason: "_Lumination#5240"})
            if (emoji.animated) prefix = `<:a`
            else prefix = ""
            return `<${prefix}:${name.replace(" ", "")}:${emoji.id}>`
        } catch (e) {
            console.error(e);
        }
    },
}