import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import config from "config";
import {
  ButtonInteraction,
  GuildMemberRoleManager,
  MessageActionRow,
  Modal,
  ModalActionRowComponent,
  TextInputComponent,
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ModalHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "verify") return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const roleManager = <GuildMemberRoleManager>interaction.member?.roles;
    if (roleManager?.cache.has(config.get("verifiedRole")))
      return interaction.reply({
        embeds: [
          {
            title: "You are already verified",
            description: `Get your support in <#${config.get(
              "grantedChannel"
            )}>`,
          },
        ],
        ephemeral: true,
      });

    const modal = new Modal({
      customId: "verify",
      title: "License Verification",
      components: [
        new MessageActionRow<ModalActionRowComponent>().addComponents(
          new TextInputComponent({
            customId: "licenseKey",
            label: "What's your license key?",
            style: "SHORT",
            required: true,
            placeholder: "00000000-00000000-00000000-00000000",
            minLength: 32,
            maxLength: 35,
          })
        ),
      ],
    });
    await interaction.showModal(modal);
  }
}
