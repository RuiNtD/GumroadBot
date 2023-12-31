import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";
import { getProducts } from "../lib/db.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class AutocompleteProductHandler extends InteractionHandler {
  public override async parse(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name != "product") return this.none();
    return this.some(focusedOption.value);
  }

  public override async run(interaction: AutocompleteInteraction<"cached">) {
    const { guild } = interaction;
    const products = (await getProducts(guild)).map((v) => ({
      name: v.label,
      value: v.value,
    }));
    return interaction.respond(products);
  }
}
