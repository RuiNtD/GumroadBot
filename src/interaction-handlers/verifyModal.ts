import { ApplyOptions, RequiresClientPermissions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import config from "config";
import {
  GuildMemberRoleManager,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageOptions,
  ModalSubmitInteraction,
} from "discord.js";
import { verify } from "../lib/api.js";
import { error, success } from "../lib/embeds.js";
import log from "../lib/log.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "verify") return this.none();

    return this.some(interaction.fields.getTextInputValue("licenseKey"));
  }

  @RequiresClientPermissions("MANAGE_ROLES")
  public async run(
    interaction: ModalSubmitInteraction,
    key: InteractionHandler.ParseResult<this>
  ) {
    console.log("Verifying", {
      discordTag: interaction.user.tag,
      userID: interaction.user.id,
      licenseKey: key,
    });

    const roleManager = <GuildMemberRoleManager>interaction.member?.roles;
    if (roleManager?.cache.has(config.get("verifiedRole"))) {
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
    }

    const data = await verify(key);
    if (!data.success) {
      console.log(data);
      return interaction.reply({
        ephemeral: true,
        embeds: [error(data.message)],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton({
              customId: "verify",
              label: "Try Again",
              style: "PRIMARY",
            }),
            new MessageButton({
              customId: "help",
              label: "Help",
              style: "SECONDARY",
            })
          ),
        ],
      });
    }

    try {
      roleManager.add(config.get("verifiedRole"), "Verified License");
    } catch (e) {
      console.log(e);
      return interaction.reply(
        `${interaction.user} Your license key was verified, but something went wrong giving you the verified role.`
      );
    }

    let logMsg: MessageOptions = {
      embeds: [
        new MessageEmbed()
          .setTitle("Verified")
          .setThumbnail(interaction.user.displayAvatarURL())
          .addFields([
            { name: "User", value: interaction.user.toString(), inline: true },
            { name: "User ID", value: interaction.user.id, inline: true },
            { name: "Uses", value: `${data.uses}`, inline: true },
            { name: "License Key", value: key, inline: false },
          ])
          .setTimestamp(),
      ],
    };
    if (data.uses > 1) logMsg.content = `<@${config.get("pupwolfID")}>`;
    log(logMsg);
    console.log("Success", interaction.user.tag);

    const usesPlural = data.uses == 1 ? "time" : "times";
    return interaction.reply({
      ephemeral: true,
      embeds: [
        success(
          `You should now have access to <#${config.get(
            "grantedChannel"
          )}>.\nThis license has now been used ${data.uses} ${usesPlural}.`
        ),
      ],
    });
  }
}
