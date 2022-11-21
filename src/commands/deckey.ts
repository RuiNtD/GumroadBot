import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Permissions } from "discord.js";
import { decUses } from "../lib/api.js";
import { error, success } from "../lib/embeds.js";

@ApplyOptions<Command.Options>({
  description: "Decrement the use count on a Hybrid V2 license",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(Permissions.FLAGS.ADMINISTRATOR)
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
    const key = <string>interaction.options.getString("key");
    const data = await decUses(key);

    if (!data.success) {
      return interaction.reply({
        embeds: [error(data.message)],
        ephemeral: true,
      });
    }

    return interaction.reply({
      embeds: [success(`This license now has a use count of ${data.uses}.`)],
      ephemeral: true,
    });
  }
}
