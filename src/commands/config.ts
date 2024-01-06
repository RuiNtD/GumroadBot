import { ApplyOptions } from "@sapphire/decorators";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import {
  ActionRowBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
  StringSelectMenuBuilder,
  roleMention,
} from "discord.js";
import { ephemeral, cmdMention as cmd } from "../lib/utils.js";
import * as db from "../lib/db.js";
import * as emoji from "../lib/emoji.js";
import { z } from "zod";

@ApplyOptions<Subcommand.Options>({
  runIn: CommandOptionsRunTypeEnum.GuildAny,
  description: "Edit configuration",
  subcommands: [
    {
      name: "product",
      type: "group",
      entries: [
        { name: "add", chatInputRun: "addProduct" },
        { name: "remove", chatInputRun: "removeProduct" },
      ],
    },
    { name: "set-logging", chatInputRun: "setLogging" },
    { name: "show", chatInputRun: "show" },
  ],
})
export class ConfigCmd extends Subcommand {
  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommandGroup((group) =>
          group //
            .setName("product")
            .setDescription("Manage products")
            .addSubcommand((command) =>
              command // TODO: Add emoji option
                .setName("add")
                .setDescription("Add or replace a product")
                .addStringOption((option) =>
                  option
                    .setName("product")
                    .setDescription("Product ID")
                    .setRequired(true),
                )
                .addStringOption((option) =>
                  option
                    .setName("label")
                    .setDescription("Label")
                    .setRequired(true),
                )
                .addRoleOption((option) =>
                  option
                    .setName("role")
                    .setDescription("Verified Role")
                    .setRequired(true),
                )
                .addStringOption((option) =>
                  option //
                    .setName("description")
                    .setDescription("Description"),
                )
                .addStringOption((option) =>
                  option //
                    .setName("permalink")
                    .setDescription("Permalink"),
                )
                .addStringOption((option) =>
                  option
                    .setName("access-token")
                    .setDescription("API Access Token"),
                ),
            )
            .addSubcommand((command) =>
              command
                .setName("remove")
                .setDescription("Remove a product")
                .addStringOption((option) =>
                  option
                    .setName("product")
                    .setDescription("Product ID")
                    .setRequired(true)
                    .setAutocomplete(true),
                ),
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
        )
        .addSubcommand((command) =>
          command
            .setName("show")
            .setDescription("Shows the current configuration"),
        ),
    );
  }

  public async addProduct(interaction: Subcommand.ChatInputCommandInteraction) {
    // FIXME: implement
    return await interaction.reply(ephemeral("Not yet implemented."));
  }

  public async removeProduct(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    // FIXME: implement
    return await interaction.reply(ephemeral("Not yet implemented."));
  }

  public async setLogging(
    interaction: Subcommand.ChatInputCommandInteraction<"cached">,
  ) {
    const { guild, options } = interaction;
    const channel = options.getChannel("channel", true);

    await db.kv.set(["guilds", guild.id, "loggingChannel"], channel.id);
    return interaction.reply(
      ephemeral(`${emoji.check} Logging channel set to ${channel}`),
    );
  }

  public async show(
    interaction: Subcommand.ChatInputCommandInteraction<"cached">,
  ) {
    const { guild } = interaction;

    const products = await db.getProducts(guild);
    const loggingChannel = await db.getLoggingChannel(guild);
    const serverToken = await db.get(
      ["guilds", guild.id, "accessToken"],
      z.string(),
    );

    const embeds = [
      new EmbedBuilder().setTitle("Server Settings").addFields(
        {
          name: "Logging Channel",
          value: `${loggingChannel}` || "Not set",
          inline: true,
        },
        {
          name: "API Access Token",
          value: serverToken
            ? `${emoji.check} Token set`
            : `${emoji.cross} Not set`,
          inline: true,
        },
      ),
    ];

    for (const product of products) {
      const embed = new EmbedBuilder()
        .setTitle(product.label)
        .setDescription(product.description || "No description")
        .addFields(
          {
            name: "Product ID",
            value: product.value,
          },
          {
            name: "Verified Role",
            value: roleMention(product.role),
            inline: true,
          },
        );
      if (product.accessToken)
        embed.addFields({
          name: "API Access Token",
          value: `Overriden`,
          inline: true,
        });
      if (product.permalink)
        embed.setURL(`https://gum.co/${product.permalink}`);
      embeds.push(embed);
    }

    const select = new StringSelectMenuBuilder({
      customId: "configShowTest",
      placeholder: "Product List",
      options: products,
    });
    const row = new ActionRowBuilder<StringSelectMenuBuilder>({
      components: [select],
    });

    interaction.reply({
      content:
        "API Access Tokens are not required for verification. They are only used for " +
        `${cmd("enablekey")}, ${cmd("disablekey")}, and ${cmd("deckey")}.`,
      embeds,
      components: [row],
      ephemeral: true,
    });
  }
}
