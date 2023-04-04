import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import config from "config";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";

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
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    );
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          customId: "verify",
          label: "Verify",
          style: ButtonStyle.Primary,
        }),
        new ButtonBuilder({
          customId: "help",
          label: "Help",
          style: ButtonStyle.Primary,
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
