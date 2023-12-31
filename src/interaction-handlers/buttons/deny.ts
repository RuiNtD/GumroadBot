import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import { ephemeral, hasVerifiedRole } from "../../lib/utils.js";
import * as emoji from "../../lib/emoji.js";
import * as db from "../../lib/db.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class DenyBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "deny") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction<"cached">) {
    const { guild, message } = interaction;

    const perms = <PermissionsBitField>interaction.member.permissions;
    if (!perms.has(PermissionFlagsBits.Administrator))
      return interaction.reply(
        ephemeral(
          `${emoji.cross} You don't have permission to deny verifications.`,
        ),
      );

    const fields = message.embeds.at(0)?.fields;
    if (!fields) return;
    const userID = fields.find((v) => v.name == "User ID")?.value;
    const licenseKey = fields.find((v) => v.name == "License Key")?.value;
    const prodMatch = fields
      .find((v) => v.name == "Product")
      ?.value.match(/^\[(.*)\]/);
    if (!userID || !licenseKey || !prodMatch) return;
    const product = await db.getProduct(guild, prodMatch[1]);
    if (!product) return;

    const member = await guild.members.fetch(userID);
    if (!member) {
      message.delete();
      return interaction.reply(
        ephemeral(`${emoji.question} User is no longer in the server.`),
      );
    }

    if (hasVerifiedRole(member, product)) {
      message.delete();
      return interaction.reply(
        ephemeral(`${emoji.question} User is already verified.`),
      );
    }

    message.delete();

    try {
      const dm = await member.createDM();
      const guildName = guild.name;
      await dm.send(
        `${emoji.cross} Your license key has been denied in "${guildName}".\n` +
          "Please contact an admin for more info.",
      );
      return interaction.reply(
        ephemeral(`${emoji.check} ${member} has been denied.`),
      );
    } catch (e) {
      return interaction.reply(
        ephemeral(
          `${emoji.check} ${member} has been denied, but I couldn't DM them the results.`,
        ),
      );
    }
  }
}
