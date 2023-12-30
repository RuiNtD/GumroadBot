import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { LicenseResponse, verify } from "../lib/api.js";
import log, { createEmbed } from "../lib/log.js";
import { giveVerifiedRole, hasVerifiedRole } from "../lib/utils.js";
import * as emoji from "../lib/emoji.js";

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
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to approve")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("key")
            .setDescription("Hybrid V2 license key")
            .setRequired(false),
        ),
    );
  }

  public override async chatInputRun(
    interaction: ChatInputCommandInteraction<"cached">,
  ) {
    const user = interaction.options.getUser("user", true);
    const key = interaction.options.getString("key", false);
    const member = interaction.options.getMember("user");
    if (!member) return;

    if (hasVerifiedRole(member)) {
      return interaction.reply({
        content: `${emoji.question} This user is already verified.`,
        ephemeral: true,
      });
    }

    let data: LicenseResponse | undefined;
    if (key) data = await verify(key);
    if (data && !data.success) {
      console.log(data);
      return interaction.reply({
        content: `${emoji.cross} ${data.message}`,
        ephemeral: true,
      });
    }

    try {
      await giveVerifiedRole(member, "Verified License");
    } catch (e) {
      console.log(e);
      return interaction.reply(
        `${interaction.user}:\n` +
          `${emoji.warning} ${user.tag}'s license key was verified, but something went wrong giving them the verified role.`,
      );
    }

    log(interaction.guild, {
      embeds: [
        createEmbed({
          title: key ? "Verified by Admin" : "Manually Approved by Admin",
          user,
          uses: data?.uses,
          key: key || undefined,
          staff: interaction.user,
        }),
      ],
    });

    return interaction.reply({
      content: `${emoji.check} ${user.tag} should now be verified.`,
      ephemeral: true,
    });
  }
}
