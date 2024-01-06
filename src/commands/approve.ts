import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { LicenseResponse, verify } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import { ephemeral, giveVerifiedRole, hasVerifiedRole } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";
import { prodNotFound } from "../lib/msgs.js";
import * as db from "../lib/db.js";

@ApplyOptions<Command.Options>({
  description: "Manually approve a user",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class ApproveCmd extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to approve")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("product")
            .setDescription("Product ID")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addStringOption((option) =>
          option.setName("key").setDescription("License key"),
        ),
    );
  }

  public override async chatInputRun(
    interaction: ChatInputCommandInteraction<"cached">,
  ) {
    const { guild, options } = interaction;

    const user = options.getUser("user", true);
    const key = options.getString("key", false);
    const product = await db.getProduct(
      guild,
      options.getString("product", true),
    );
    const member = options.getMember("user");
    if (!member) return;
    if (!product) return interaction.reply(prodNotFound);

    if (hasVerifiedRole(member, product)) {
      return interaction.reply(
        ephemeral(`${emoji.question} This user is already verified.`),
      );
    }

    let data: LicenseResponse | undefined;
    if (key) data = await verify(product, key);
    if (data && !data.success) {
      console.log(data);
      return interaction.reply(ephemeral(`${emoji.cross} ${data.message}`));
    }

    try {
      await giveVerifiedRole(
        member,
        product,
        key ? "Verified License" : "Approved by Admin",
      );
    } catch (e) {
      console.log(e);
      return interaction.reply(
        ephemeral(
          `${emoji.warning} ${user}'s license key was verified, but something went wrong giving them the verified role.`,
        ),
      );
    }

    log(guild, {
      embeds: [
        createEmbed({
          title: key ? "Verified by Admin" : "Manually Approved by Admin",
          user,
          uses: data?.uses,
          product: product || undefined,
          key: key || undefined,
          staff: interaction.user,
        }),
      ],
    });

    return interaction.reply(
      ephemeral(`${emoji.check} ${user} should now be verified.`),
    );
  }
}
