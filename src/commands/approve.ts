import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import config from "config";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMemberRoleManager,
  MessageCreateOptions,
  PermissionsBitField,
} from "discord.js";
import { LicenseResponse, verify } from "../lib/api.js";
import { error, success } from "../lib/embeds.js";
import log from "../lib/log.js";
import { formatUser } from "../lib/utils.js";

@ApplyOptions<Command.Options>({
  description: "Manually approve a user",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to approve")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("key")
            .setDescription("Hybrid V2 license key")
            .setRequired(false)
        )
    );
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const key = interaction.options.getString("key", false);
    const member = interaction.options.getMember("user");
    if (!member) return;

    console.log("Manual Verifying", {
      user: `${user.tag} (${user.id})`,
      licenseKey: key,
      mod: `${interaction.user.tag} (${user})`,
    });

    const roleManager = <GuildMemberRoleManager>member.roles;
    if (roleManager?.cache.has(config.get("verifiedRole"))) {
      return interaction.reply({
        content: "This user is already verified",
        ephemeral: true,
      });
    }

    let data: LicenseResponse | undefined;
    if (key) data = await verify(key);
    if (data && !data.success) {
      console.log(data);
      return interaction.reply({
        ephemeral: true,
        embeds: [error(data.message)],
      });
    }

    try {
      roleManager.add(config.get("verifiedRole"), "Verified License");
    } catch (e) {
      console.log(e);
      return interaction.reply(
        `${interaction.user} ${user.tag}'s license key was verified, but something went wrong giving them the verified role.`
      );
    }

    let fields = [
      { name: "User", value: user.toString(), inline: true },
      { name: "User ID", value: user.id, inline: true },
    ];
    if (data) {
      fields = fields.concat([
        { name: "Uses", value: `${data.uses}`, inline: true },
        {
          name: "License Key",
          value: key || "",
          inline: false,
        },
      ]);
    }

    const logMsg: MessageCreateOptions = {
      embeds: [
        new EmbedBuilder()
          .setTitle(key ? "Verified by Mod" : "Manually Approved by Mod")
          .setThumbnail(user.displayAvatarURL())
          .addFields(fields)
          .setFooter({
            text: formatUser(interaction.user),
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    };
    if (data && data.uses > 1) logMsg.content = `<@${config.get("pupwolfID")}>`;
    log(interaction.client, logMsg);
    console.log("Success", user.tag);

    return interaction.reply({
      ephemeral: true,
      embeds: [
        success(
          `${user.tag} should now have access to <#${config.get(
            "grantedChannel"
          )}>.`
        ),
      ],
    });
  }
}
