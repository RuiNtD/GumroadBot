import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { ephemeral, hasVerifiedRole } from "../../lib/utils.js";
import * as emoji from "../../lib/emoji.js";
import buildModel from "../../lib/model.js";
import { prodNotFound } from "../../lib/msgs.js";
import * as db from "../../lib/db.js";

const prefix = "verify:";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class TryAgainBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    const { customId } = interaction;
    if (!customId.startsWith(prefix)) return this.none();
    return this.some(customId.substring(prefix.length));
  }

  public async run(
    interaction: ButtonInteraction<"cached">,
    prodId: InteractionHandler.ParseResult<this>,
  ) {
    const { guild, member } = interaction;
    const product = await db.getProduct(guild, prodId);
    if (!product) return interaction.reply(prodNotFound);

    if (hasVerifiedRole(member, product))
      return interaction.reply(
        ephemeral(`${emoji.question} You are already verified.`),
      );

    await interaction.showModal(buildModel(product));
  }
}
