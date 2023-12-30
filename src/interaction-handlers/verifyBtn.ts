import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import * as config from "../lib/config.js";
import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { hasVerifiedRole } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";

const { debug } = config;

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class VerifyBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "verify") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction<"cached">) {
    if (hasVerifiedRole(interaction.member))
      return interaction.reply({
        content: `${emoji.question} You are already verified.`,
        ephemeral: true,
      });

    const modal = new ModalBuilder({
      customId: "verify",
      title: "License Verification",
      components: [
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder({
            customId: "licenseKey",
            label: "What's your license key?",
            style: TextInputStyle.Short,
            required: true,
            placeholder: debug
              ? "test0"
              : "00000000-00000000-00000000-00000000",
            minLength: debug ? 4 : 32,
            maxLength: 35,
          }),
        ),
      ],
    });
    await interaction.showModal(modal);
  }
}
