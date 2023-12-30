import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { enable } from "../lib/api.js";
import log from "../lib/log.js";
import { formatUser } from "../lib/utils.js";
import { PermissionsBitField } from "discord.js";
import * as emoji from "../lib/emoji.js";

@ApplyOptions<Command.Options>({
  description: "Enable a Hybrid V2 license",
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption((option) =>
          option
            .setName("key")
            .setDescription("Hybrid V2 license key")
            .setRequired(true),
        ),
    );
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    if (!interaction.inCachedGuild()) return;

    const key = interaction.options.getString("key", true);
    const data = await enable(key);

    if (!data.success) {
      return interaction.reply({
        content: `${emoji.cross} ${data.message}`,
        ephemeral: true,
      });
    }

    log(interaction.guild, {
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("License Enabled")
          .addFields([
            { name: "License Key", value: key, inline: true },
            { name: "Uses", value: `${data.uses}`, inline: true },
          ])
          .setFooter({
            text: formatUser(interaction.user),
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });

    return interaction.reply({
      content: `${emoji.check} This license is now enabled.`,
      ephemeral: true,
    });
  }
}
