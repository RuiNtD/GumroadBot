import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { StringSelectMenuInteraction } from "discord.js";
import { ephemeral, hasVerifiedRole } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";
import buildModel from "../lib/model.js";
import { prodNotFound } from "../lib/msgs.js";
import * as db from "../lib/db.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class VerifySelectHandler extends InteractionHandler {
  public override parse(interaction: StringSelectMenuInteraction) {
    const { customId } = interaction;
    if (customId != "verify") return this.none();
    return this.some();
  }

  public async run(interaction: StringSelectMenuInteraction<"cached">) {
    const { guild, member } = interaction;
    const prodId = interaction.values.at(0);
    if (!prodId) return;

    const product = await db.getProduct(guild, prodId);
    if (!product) return interaction.reply(prodNotFound);

    if (hasVerifiedRole(member, product))
      return interaction.reply(
        ephemeral(`${emoji.question} You are already verified.`),
      );

    await interaction.showModal(buildModel(product));
  }
}
