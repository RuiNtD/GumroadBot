import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

const reply = {
  ephemeral: true,

  content:
    "You can find your license key on your Gumroad receipt or downloads page.\n" +
    "You can also use the buttons below to find your license key or purchase Hybrid V2 if you don't already have it.\n" +
    "Once you have your license key, click `Verify` below to continue.",

  embeds: [
    new MessageEmbed({
      description:
        "Your product key will be listed on your downloads page here:",
      image: {
        url: "https://media.discordapp.net/attachments/905632200345665566/1020735601600888942/unknown.png",
      },
    }),
  ],

  components: [
    new MessageActionRow({
      components: [
        new MessageButton({
          style: "PRIMARY",
          label: "Verify",
          customId: "verify",
        }),
        new MessageButton({
          style: "LINK",
          label: "Purchase Hybrid V2",
          url: "https://gumroad.com/l/HybridV2",
        }),
      ],
    }),

    new MessageActionRow({
      components: [
        new MessageButton({
          style: "LINK",
          label: "Gumroad Library",
          url: "https://app.gumroad.com/library?query=Hybrid+V2",
        }),
        new MessageButton({
          style: "LINK",
          label: "Find my License Key",
          url: "https://app.gumroad.com/license-key-lookup",
        }),
      ],
    }),
  ],
};

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ButtonHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "help") return this.none();

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.reply(reply);
  }
}
