const Info = require("../functions/info");


module.exports = {
    data: {
        name: "ping",
        description: "Get the latency of this bot",
    },
    
    
    /**
     * @param {Info}
     */
    async execute(info) {
        const cmdsG = client.application.commands.cache;
        //console.log(cmdsG)
        await client.application?.commands.set([]);
        console.log("Deleted all commands");
        interaction.reply({
            content: "Deleted every commands & C.M globally. Wait one hour",
            ephemeral: true,
        });
    }
}