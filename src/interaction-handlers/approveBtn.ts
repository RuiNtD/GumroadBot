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
import { giveVerifiedRole, hasVerifiedRole } from "../lib/utils.js";
import { verify } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import * as emoji from "../lib/emoji.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ApproveBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "approve") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction<"cached">) {
    if (!interaction.member) return;

    const perms = <PermissionsBitField>interaction.member.permissions;
    if (!perms.has(PermissionFlagsBits.Administrator))
      return interaction.reply({
        content: `${emoji.cross} You don't have permission to approve verifications.`,
        ephemeral: true,
      });

    const fields = interaction.message.embeds.at(0)?.fields;
    if (!fields) return;
    const userID = fields.find((v) => v.name == "User ID")?.value;
    const licenseKey = fields.find((v) => v.name == "License Key")?.value;
    if (!userID || !licenseKey) return;

    const member = await interaction.guild?.members.fetch(userID);
    if (!member) {
      interaction.message.delete();
      return interaction.reply({
        content: `${emoji.question} User is no longer in the server.`,
        ephemeral: true,
      });
    }

    if (hasVerifiedRole(member)) {
      interaction.message.delete();
      return interaction.reply({
        content: `${emoji.question} User is already verified.`,
        ephemeral: true,
      });
    }

    const data = await verify(licenseKey);
    if (!data.success) {
      interaction.message.delete();
      return interaction.reply({
        content:
          `${emoji.question} User's license key no longer works.\n` +
          data.message,
        ephemeral: true,
      });
    }

    interaction.message.delete();
    // deleteComps(interaction.message);

    try {
      await giveVerifiedRole(member, "Approved by Admin");
    } catch (e) {
      console.log(e);
      return interaction.reply(
        `${interaction.user}:\n` +
          `${emoji.warning} ${member.user.tag}'s license key was approved, but something went wrong giving them the verified role!`,
      );
    }

    log(interaction.guild, {
      embeds: [
        createEmbed({
          title: "Approved by Admin",
          user: member.user,
          key: licenseKey,
          uses: data.uses,
          staff: interaction.user,
        }),
      ],
    });

    try {
      const dm = await member.createDM();
      const guildName = interaction.guild.name;
      await dm.send(
        `${emoji.check} Your license key has been approved in "${guildName}".\n` +
          "You should now be verified.",
      );
      return interaction.reply({
        content: `${emoji.check} ${member} has been approved.`,
        ephemeral: true,
      });
    } catch (e) {
      return interaction.reply({
        content: `${emoji.check} ${member} has been approved, but I couldn't DM them the results.`,
        ephemeral: true,
      });
    }
  }
}
