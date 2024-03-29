import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { decUses } from "../lib/api.js";
import * as emoji from "../lib/emoji.js";
import { ephemeral } from "../lib/utils.js";
import * as db from "../lib/db.js";
import { resolveKey } from "@sapphire/plugin-i18next";

@ApplyOptions<Command.Options>({
  description: "Decrement the use count on a license",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class DecKeyCmd extends Command {
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

    const accessToken = await db.getAccessToken(guild, product);
    if (!accessToken)
      return interaction.reply(
        ephemeral(`${emoji.cross} You need to set an API access token.`),
      );

    const key = options.getString("key", true);
    const data = await decUses(product, key, accessToken);
    if (!data.success)
      return interaction.reply(ephemeral(`${emoji.cross} ${data.message}`));

    return interaction.reply(
      ephemeral(
        `${emoji.check} This license now has a use count of ${data.uses}.`,
      ),
    );
  }
}
