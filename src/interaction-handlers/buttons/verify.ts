import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonInteraction,
  StringSelectMenuBuilder,
} from "discord.js";
import * as config from "../../lib/config.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class VerifyBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    const { customId } = interaction;
    if (customId != "verify") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction<"cached">) {
    const select = new StringSelectMenuBuilder({
      customId: "verify",
      placeholder: "Select a Product",
      options: await config.getProducts(interaction.guild),
    });
    const row = new ActionRowBuilder<StringSelectMenuBuilder>({
      components: [select],
    });

    return interaction.reply({
      content: "Please select your product below to verify.",
      ephemeral: true,
      components: [row],
    });
  }
}
