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
import { hasVerifiedRole } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class DenyBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "deny") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction<"cached">) {
    if (!interaction.member) return;
    if (!interaction.inCachedGuild()) return;

    const perms = <PermissionsBitField>interaction.member.permissions;
    if (!perms.has(PermissionFlagsBits.Administrator))
      return interaction.reply({
        content: `${emoji.cross} You don't have permission to deny verifications.`,
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

    interaction.message.delete();

    try {
      const dm = await member.createDM();
      const guildName = interaction.guild.name;
      await dm.send(
        `${emoji.cross} Your license key has been denied in "${guildName}".\n` +
          "Please contact an admin for more info.",
      );
      return interaction.reply({
        content: `${emoji.check} ${member} has been denied.`,
        ephemeral: true,
      });
    } catch (e) {
      return interaction.reply({
        content: `${emoji.check} ${member} has been denied, but I couldn't DM them the results.`,
        ephemeral: true,
      });
    }
  }
}
