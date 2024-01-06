import { ApplyOptions } from "@sapphire/decorators";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ChannelType, PermissionsBitField } from "discord.js";
import { ephemeral } from "../lib/utils.js";

@ApplyOptions<Subcommand.Options>({
  runIn: CommandOptionsRunTypeEnum.GuildAny,
  description: "Edit configuration",
  subcommands: [
    {
      name: "add-product",
      chatInputRun: "addProduct",
    },
    {
      name: "remove-product",
      chatInputRun: "removeProduct",
    },
    {
      name: "set-logging",
      chatInputRun: "setLogging",
    },
  ],
})
export class ConfigCmd extends Subcommand {
  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand((command) =>
          command
            .setName("add-product")
            .setDescription("Add or replace a product")
            .addStringOption((option) =>
              option
                .setName("product")
                .setDescription("Product ID")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName("label").setDescription("Label").setRequired(true),
            )
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Verified Role")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName("description").setDescription("Description"),
            )
            .addStringOption((option) =>
              option.setName("access-token").setDescription("API Access Token"),
            ),
        )
        .addSubcommand((command) =>
          command
            .setName("remove-product")
            .setDescription("Remove a product")
            .addStringOption((option) =>
              option
                .setName("product")
                .setDescription("Product ID")
                .setRequired(true)
                .setAutocomplete(true),
            ),
        )
        .addSubcommand((command) =>
          command
            .setName("set-logging")
            .setDescription("Set the logging channel")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Logging Channel")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText),
            ),
        ),
    );
  }

  public async addProduct(interaction: Subcommand.ChatInputCommandInteraction) {
    // FIXME: implement
    return interaction.reply(ephemeral("Not implemented."));
  }

  public async removeProduct(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    // FIXME: implement
    return interaction.reply(ephemeral("Not implemented."));
  }

  public async setLogging(interaction: Subcommand.ChatInputCommandInteraction) {
    // FIXME: implement
    return interaction.reply(ephemeral("Not implemented."));
  }
}
