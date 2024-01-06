import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { StringSelectMenuInteraction } from "discord.js";
import { cmdMention as cmd } from "../lib/utils.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class VerifySelectHandler extends InteractionHandler {
  public override parse(interaction: StringSelectMenuInteraction) {
    const { customId } = interaction;
    if (customId != "configShowTest") return this.none();
    return this.some();
  }

  public async run(interaction: StringSelectMenuInteraction<"cached">) {
    await interaction.reply({
      content:
        `This select box is only for demonstration purposes. ` +
        `If you'd like to edit a product, ` +
        `replace it with ${cmd("config product add")}.`,
      ephemeral: true,
    });
  }
}
