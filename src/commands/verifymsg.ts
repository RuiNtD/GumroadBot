import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import * as db from "../lib/db.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import * as emoji from "../lib/emoji.js";
import { ephemeral } from "../lib/utils.js";

@ApplyOptions<Command.Options>({
  description: "Sends the bot's verification prompt in this channel",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class VerifyCmd extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addStringOption((option) =>
          option
            .setName("product")
            .setDescription("Product ID")
            .setAutocomplete(true),
        ),
    );
  }

  public override async chatInputRun(
    interaction: ChatInputCommandInteraction<"cached">,
  ) {
    const { guild, options } = interaction;
    const product = await db.getProduct(
      guild,
      options.getString("product", false) || "",
    );
    let customId = "verify";
    if (product) customId += `:${product.value}`;

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          customId,
          label: "Verify",
          style: ButtonStyle.Primary,
        }),
        new ButtonBuilder({
          customId: "help",
          label: "Help",
          style: ButtonStyle.Secondary,
        }),
      ],
    });

    const devPing = await db.getDevPing(interaction.guild),
      adminPing = db.getAdminPing(interaction.guild),
      content =
        "To receive support for your purchase, you will need to verify your license key. " +
        "Click the button below to verify your license key.\n" +
        "\n" +
        `For bot support, contact ${devPing}\n` +
        `For purchase support, contact ${adminPing}`;
    interaction.channel?.send({
      content,
      components: [row],
    });

    return interaction.reply(ephemeral(emoji.check));
  }
}
