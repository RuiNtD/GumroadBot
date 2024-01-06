import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

const reply = {
  ephemeral: true,

  content:
    "You can find your license key on your Gumroad receipt or downloads page.\n" +
    "You can also use the buttons below to find your license key.",

  embeds: [
    new EmbedBuilder({
      description:
        "Your product key will be listed on your downloads page here:",
      image: {
        // TODO: Replace with more generic image
        url: "https://media.discordapp.net/attachments/905632200345665566/1020735601600888942/unknown.png",
      },
    }),
  ],

  components: [
    new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          style: ButtonStyle.Link,
          label: "Gumroad Library",
          url: "https://app.gumroad.com/library",
        }),
        new ButtonBuilder({
          style: ButtonStyle.Link,
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
export class HelpBtnHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "help") return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.reply(reply);
  }
}
