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
import {
  ephemeral,
  getProduct,
  giveVerifiedRole,
  hasVerifiedRole,
} from "../lib/utils.js";
import { getAdminPing } from "../lib/config.js";
import * as emoji from "../lib/emoji.js";

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
    const product = await getProduct(guild, prodId);
    if (!product) return;

    if (hasVerifiedRole(member, product))
      return interaction.reply(
        ephemeral(`${emoji.question} You are already verified.`),
      );

    const key = fields.getTextInputValue("licenseKey");
    const data = await verify(product, key, false);
    if (!data.success) {
      return interaction.reply({
        content: `${emoji.cross} ${data.message}`,
        ephemeral: true,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
              customId: `verify:${product}`,
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
      await verify(product, key);
      try {
        await giveVerifiedRole(member, product, "Verified License");
      } catch (e) {
        console.log(e);
        return interaction.reply(
          `${user}:\n` +
            `${emoji.warning} Your license key was verified, but something went wrong giving you the verified role.`,
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

      const usesPlural = data.uses == 1 ? "time" : "times";
      return interaction.reply(
        ephemeral(
          `${emoji.check} You should now be verified.\n` +
            `This license has now been used ${data.uses} ${usesPlural}.`,
        ),
      );
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
      const admin = getAdminPing(guild);

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

      return interaction.reply(
        ephemeral(
          `${emoji.check} Your license key has been verified.\n` +
            `Please wait for an admin to manually approve you.`,
        ),
      );
    }
  }
}
