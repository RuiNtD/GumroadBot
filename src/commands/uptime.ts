import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { Duration } from "luxon";

@ApplyOptions<Command.Options>({
  description: "Shows bot uptime",
})
export class UptimeCmd extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description),
    );
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const { uptime } = interaction.client;
    const dur = Duration.fromMillis(uptime)
      .rescale()
      .set({ millisecond: 0 })
      .rescale();
    const res = dur.toHuman({
      unitDisplay: "narrow",
    });

    return interaction.reply({
      content: `I have been running for ${res}.`,
      ephemeral: interaction.inGuild(),
    });
  }
}
