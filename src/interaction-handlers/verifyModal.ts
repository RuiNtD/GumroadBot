import { ApplyOptions, RequiresClientPermissions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageCreateOptions,
  ModalSubmitInteraction,
  PermissionsBitField,
} from "discord.js";
import { verify } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import { giveVerifiedRole, hasVerifiedRole } from "../lib/utils.js";
import { getAdminPing } from "../lib/config.js";
import * as emoji from "../lib/emoji.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class VerifyModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "verify") return this.none();

    return this.some(interaction.fields.getTextInputValue("licenseKey"));
  }

  @RequiresClientPermissions(PermissionsBitField.Flags.ManageRoles)
  public async run(
    interaction: ModalSubmitInteraction<"cached">,
    key: InteractionHandler.ParseResult<this>,
  ) {
    if (hasVerifiedRole(interaction.member))
      return interaction.reply({
        content: "You are already verified.",
        ephemeral: true,
      });

    const data = await verify(key, false);
    if (!data.success) {
      console.log(data);
      return interaction.reply({
        content: `${emoji.cross} ${data.message}`,
        ephemeral: true,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
              customId: "verify",
              label: "Try Again",
              style: ButtonStyle.Primary,
            }),
            new ButtonBuilder({
              customId: "help",
              label: "Help",
              style: ButtonStyle.Secondary,
            }),
          ),
        ],
      });
    }

    if (data.uses < 1) {
      await verify(key);
      try {
        await giveVerifiedRole(interaction.member, "Verified License");
      } catch (e) {
        console.log(e);
        return interaction.reply(
          `${interaction.user}:\n` +
            `${emoji.warning} Your license key was verified, but something went wrong giving you the verified role.`,
        );
      }

      const logMsg: MessageCreateOptions = {
        embeds: [
          createEmbed({
            title: "Verified",
            user: interaction.user,
            uses: data.uses,
            key,
          }),
        ],
      };
      log(interaction.guild, logMsg);

      const usesPlural = data.uses == 1 ? "time" : "times";
      return interaction.reply({
        content:
          `${emoji.check} You should now be verified.\n` +
          `This license has now been used ${data.uses} ${usesPlural}.`,
        ephemeral: true,
      });
    } else {
      const row = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder({
            customId: "approve",
            label: "Approve",
            style: ButtonStyle.Primary,
          }),
          new ButtonBuilder({
            customId: "deny",
            label: "Deny",
            style: ButtonStyle.Danger,
          }),
        ],
      });
      const admin = getAdminPing(interaction.guild);

      const logMsg: MessageCreateOptions = {
        content: `${admin}: User requires manual approval.`,
        embeds: [
          createEmbed({
            user: interaction.user,
            uses: data.uses,
            key,
          }).setDescription(
            "Clicking a button below will DM the user with the results.\n" +
              "You can also delete this message to silently deny it.",
          ),
        ],
        components: [row],
      };
      log(interaction.guild, logMsg);

      return interaction.reply({
        content:
          `${emoji.check} Your license key has been verified.\n` +
          `Please wait for an admin to manually approve you.`,
        ephemeral: true,
      });
    }
  }
}
