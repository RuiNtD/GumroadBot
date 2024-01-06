import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { enable } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import { ephemeral } from "../lib/utils.js";
import { PermissionsBitField } from "discord.js";
import * as emoji from "../lib/emoji.js";
import { prodNotFound } from "../lib/msgs.js";
import * as db from "../lib/db.js";

@ApplyOptions<Command.Options>({
  description: "Enable a license",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class EnableKeyCmd extends Command {
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
            .setRequired(true)
            .setAutocomplete(true),
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
    const product = await db.getProduct(
      guild,
      options.getString("product", true),
    );
    if (!product) return interaction.reply(prodNotFound);

    const accessToken = await db.getAccessToken(guild);
    if (!accessToken)
      return interaction.reply(
        ephemeral(`${emoji.cross} You need to set an API access token.`),
      );

    const key = options.getString("key", true);
    const data = await enable(product, key, accessToken);
    if (!data.success)
      return interaction.reply(ephemeral(`${emoji.cross} ${data.message}`));

    log(guild, {
      embeds: [
        createEmbed({
          title: "License Enabled",
          key,
          uses: data.uses,
          staff: interaction.user,
        }).setColor("Green"),
      ],
    });

    return interaction.reply(
      ephemeral(`${emoji.check} This license is now enabled.`),
    );
  }
}
