import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { disable } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import { ephemeral, getProduct } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";
import { prodNotFound } from "../lib/msgs.js";

@ApplyOptions<Command.Options>({
  description: "Disable a license",
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
            .setName("product")
            .setDescription("Product ID")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("key").setDescription("License key").setRequired(true),
        ),
    );
  }

  public override async chatInputRun(
    interaction: ChatInputCommandInteraction<"cached">,
  ) {
    const { guild, options } = interaction;
    const product = await getProduct(guild, options.getString("product", true));
    const key = options.getString("key", true);
    if (!product) return interaction.reply(prodNotFound);

    const data = await disable(product, key);
    if (!data.success) {
      return interaction.reply(ephemeral(`${emoji.cross} ${data.message}`));
    }

    log(guild, {
      embeds: [
        createEmbed({
          title: "License Disabled",
          key,
          uses: data.uses,
          staff: interaction.user,
        }).setColor("Red"),
      ],
    });

    return interaction.reply(
      ephemeral(`${emoji.check} This license is now disabled.`),
    );
  }
}
