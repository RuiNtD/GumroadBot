import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { decUses } from "../lib/api.js";
import * as emoji from "../lib/emoji.js";

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
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption((option) =>
          option
            .setName("key")
            .setDescription("Hybrid V2 license key")
            .setRequired(true),
        ),
    );
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const key = interaction.options.getString("key", true);
    const data = await decUses(key);

    if (!data.success) {
      return interaction.reply({
        content: `${emoji.cross} ${data.message}`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `${emoji.check} This license now has a use count of ${data.uses}.`,
      ephemeral: true,
    });
  }
}
