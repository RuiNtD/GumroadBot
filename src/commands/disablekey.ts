import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { MessageEmbed, Permissions } from "discord.js";
import { disable } from "../lib/api.js";
import { error, success } from "../lib/embeds.js";
import log from "../lib/log.js";

@ApplyOptions<Command.Options>({
  description: "Disable a Hybrid V2 license",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_ROLES)
        .addStringOption((option) =>
          option
            .setName("key")
            .setDescription("Hybrid V2 license key")
            .setRequired(true)
        )
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction
  ) {
    const key = interaction.options.getString("key", true);
    const data = await disable(key);

    if (!data.success) {
      return interaction.reply({
        embeds: [error(data.message)],
        ephemeral: true,
      });
    }

    log({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setTitle("License Disabled")
          .addFields([
            { name: "License Key", value: key, inline: true },
            { name: "Uses", value: `${data.uses}`, inline: true },
          ])
          .setFooter({
            text: `${interaction.user.tag} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });

    return interaction.reply({
      embeds: [success(`This license is now disabled.`)],
      ephemeral: true,
    });
  }
}
