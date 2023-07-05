import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Shows bot uptime",
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description),
    );
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const { uptime } = interaction.client,
      totalSeconds = Math.floor(uptime / 1000),
      totalMinutes = Math.floor(uptime / (1000 * 60)),
      totalHours = Math.floor(uptime / (1000 * 60 * 60)),
      seconds = Math.floor(totalSeconds % 60),
      minutes = Math.floor(totalMinutes % 60),
      hours = Math.floor(totalHours % 24),
      days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    let content = `I have been running for `;
    if (days) content += `${days}d `;
    if (totalHours) content += `${hours}h `;
    if (totalMinutes) content += `${minutes}m `;
    content += `${seconds}s.`;

    return interaction.reply({
      content,
      ephemeral: interaction.inGuild(),
    });
  }
}
