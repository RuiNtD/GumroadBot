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
import * as db from "../lib/db.js";
import * as emoji from "../lib/emoji.js";
import { resolveKey } from "@sapphire/plugin-i18next";

const prefix = "verify:";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class VerifyModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    const { customId } = interaction;
    if (!customId.startsWith(prefix)) return this.none();
    return this.some(customId.substring(prefix.length));
  }

  @RequiresClientPermissions(PermissionsBitField.Flags.ManageRoles)
  public async run(
    interaction: ModalSubmitInteraction<"cached">,
    prodId: InteractionHandler.ParseResult<this>,
  ) {
    const { fields, guild, member, user } = interaction;
    const product = await db.getProduct(guild, prodId);
    if (!product) return;

    if (hasVerifiedRole(member, product))
      return interaction.reply({
        content: await resolveKey(interaction, "cmd:alreadyVerified.self"),
        ephemeral: true,
      });

    const key = fields.getTextInputValue("licenseKey");
    const data = await verify(product, key, false);
    if (!data.success) {
      return interaction.reply({
        content: `${emoji.cross} ${data.message}`,
        ephemeral: true,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
              customId: `verify:${product.value}`,
              label: await resolveKey(interaction, "cmd:btn.tryAgain"),
              style: ButtonStyle.Primary,
            }),
            new ButtonBuilder({
              customId: "help",
              label: await resolveKey(interaction, "cmd:btn.help"),
              style: ButtonStyle.Secondary,
            }),
          ),
        ],
      });
    }

    if (data.uses < 1) {
      await verify(product, key);
      try {
        await giveVerifiedRole(
          member,
          product,
          await resolveKey(interaction, "cmd:audit.verified"),
        );
      } catch (e) {
        console.log(e);
        return interaction.reply(
          await resolveKey(interaction, "cmd:roleError", {
            userMention: user.toString(),
          }),
        );
      }

      const logMsg: MessageCreateOptions = {
        embeds: [
          createEmbed({
            title: "Verified",
            user,
            uses: data.uses,
            product,
            key,
          }),
        ],
      };
      log(guild, logMsg);

      return interaction.reply({
        content: await resolveKey(interaction, "cmd:verified", {
          count: data.uses,
        }),
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
      const admin = db.getAdminPing(guild);

      const logMsg: MessageCreateOptions = {
        content: `${admin}: User requires manual approval.`,
        embeds: [
          createEmbed({
            user: user,
            uses: data.uses,
            product,
            key,
          }).setDescription(
            "Clicking a button below will DM the user with the results.\n" +
              "You can also delete this message to silently deny it.",
          ),
        ],
        components: [row],
      };
      log(guild, logMsg);

      return interaction.reply({
        content: await resolveKey(interaction, "cmd:manual"),
        ephemeral: true,
      });
    }
  }
}
