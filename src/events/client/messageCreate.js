const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const client = require('../../index');
const config = require('../../config/config.json');

module.exports = {
    name: "messageCreate"
};

client.on('messageCreate', async (message) => {

    let PREFIX = config.PREFIX;
    if (message.channel.type !== 0) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    if (!message.guild) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;

    let command = client.commands.get(cmd);

    if (!command) command = client.commands.get(client.aliases.get(cmd))

    if (command) {
        if (command.userPermissions) {
            const embed = new EmbedBuilder()
                .setDescription(`💢 **[${message.member.displayName}]** you don't have permissions to use this command\n\`\`\`\n${command.userPermissions || []}\n\`\`\``)
                .setColor('Red')

            if (!message.member.permissions.has(PermissionsBitField.resolve(command.userPermissions || []))) return message.reply({
                embeds: [embed],
            })
        }

        if (command.botPermissions) {
            const embed = new EmbedBuilder()
                .setDescription(`💢 **[${message.member.displayName}]** i don't have permissions to use this command\n\`\`\`\n${command.botPermissions || []}\n\`\`\``)
            if (!message.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPermissions || []))) return message.reply({
                embeds: [embed]
            })
        }

        if (command.OWNER, command.OWNER == true) {
            if (!config.OWNER) return;
            const allowedUsers = [];

            config.OWNER.forEach(user => {
                const fetchOWNER = message.guild.members.cache.get(user);
                if (!fetchOWNER) return allowedUsers.push(`**[Unknown#0000]**`)
                allowedUsers.push(`${fetchOWNER.user.tag}`);
            });

            const embed = new EmbedBuilder()
                .setDescription(`💢 **[${message.member.displayName}]** only OWNERs can use this command!\n\`\`\`\n${allowedUsers.join(", ")}\n\`\`\``)
                .setColor('Red')
            if (!config.OWNER.some(ID => message.member.id.includes(ID))) return message.reply({
                embeds: [embed]
            })
        }

        try {
            command.run(client, message, args);
        } catch (err) {
            console.log(err);
        }
    }
})