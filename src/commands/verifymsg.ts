import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import config from "config";
import { MessageActionRow, MessageButton, Permissions } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Sends the bot's verification prompt in this channel",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_MESSAGES)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputInteraction
  ) {
    const row = new MessageActionRow({
      components: [
        new MessageButton({
          customId: "verify",
          label: "Verify",
          style: "PRIMARY",
        }),
        new MessageButton({
          customId: "help",
          label: "Help",
          style: "SECONDARY",
        }),
      ],
    });

    const content =
      "To receive support for your Hybrid V2 purchase, you will need to verify your license key.\n" +
      "Click the button below to verify your license key.\n" +
      "\n" +
      `For bot support, contact <@${config.get("devID")}>.\n` +
      `For purchase support, contact <@${config.get("pupwolfID")}>.`;
    interaction.channel?.send({
      content,
      components: [row],
    });

    return interaction.reply({ content: "Done", ephemeral: true });
  }
}
