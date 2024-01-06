import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { disable } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import { ephemeral } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";
import * as db from "../lib/db.js";
import { resolveKey } from "@sapphire/plugin-i18next";

@ApplyOptions<Command.Options>({
  description: "Disable a license",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class DisableKeyCmd extends Command {
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
    if (!product)
      return interaction.reply({
        content: await resolveKey(interaction, "cmd:productNotFound"),
        ephemeral: true,
      });

    const accessToken = await db.getAccessToken(guild);
    if (!accessToken)
      return interaction.reply(
        ephemeral(`${emoji.cross} You need to set an API access token.`),
      );

    const key = options.getString("key", true);
    const data = await disable(product, key, accessToken);
    if (!data.success)
      return interaction.reply(ephemeral(`${emoji.cross} ${data.message}`));

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
