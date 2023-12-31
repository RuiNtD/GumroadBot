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
import {
  ephemeral,
  giveVerifiedRole,
  hasVerifiedRole,
} from "../../lib/utils.js";
import { verify } from "../../lib/api.js";
import log, { createEmbed } from "../../lib/log.js";
import * as emoji from "../../lib/emoji.js";
import * as db from "../../lib/db.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ApproveBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "approve") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction<"cached">) {
    const { guild, message } = interaction;

    const perms = <PermissionsBitField>interaction.member.permissions;
    if (!perms.has(PermissionFlagsBits.Administrator))
      return interaction.reply(
        ephemeral(
          `${emoji.cross} You don't have permission to approve verifications.`,
        ),
      );

    const fields = message.embeds.at(0)?.fields;
    if (!fields) return;
    const userID = fields.find((v) => v.name == "User ID")?.value;
    const licenseKey = fields.find((v) => v.name == "License Key")?.value;
    const prodID = fields.find((v) => v.name == "Product ID")?.value;
    if (!userID || !licenseKey || !prodID) return;
    const product = await db.getProduct(guild, prodID);
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

    const data = await verify(product, licenseKey);
    if (!data.success) {
      message.delete();
      return interaction.reply(
        ephemeral(
          `${emoji.question} User's license key no longer works.\n` +
            data.message,
        ),
      );
    }

    message.delete();

    try {
      await giveVerifiedRole(member, product, "Approved by Admin");
    } catch (e) {
      console.log(e);
      return interaction.reply(
        `${interaction.user}:\n` +
          `${emoji.warning} ${member.user.tag}'s license key was approved, but something went wrong giving them the verified role!`,
      );
    }

    log(guild, {
      embeds: [
        createEmbed({
          title: "Approved by Admin",
          user: member.user,
          uses: data.uses,
          product,
          key: licenseKey,
          staff: interaction.user,
        }),
      ],
    });

    try {
      const dm = await member.createDM();
      const guildName = guild.name;
      await dm.send(
        `${emoji.check} Your license key has been approved in "${guildName}".\n` +
          "You should now be verified.",
      );
      return interaction.reply(
        ephemeral(`${emoji.check} ${member} has been approved.`),
      );
    } catch (e) {
      return interaction.reply(
        ephemeral(
          `${emoji.check} ${member} has been approved, but I couldn't DM them the results.`,
        ),
      );
    }
  }
}
