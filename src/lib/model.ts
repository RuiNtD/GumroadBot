import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Product, debug } from "./db.js";

export default function buildModel(product: Product) {
  const keyInput = new TextInputBuilder({
    customId: "licenseKey",
    label: "What's your license key?",
    style: TextInputStyle.Short,
    required: true,
    placeholder: debug ? "test0" : "00000000-00000000-00000000-00000000",
    minLength: debug ? 4 : 32,
    maxLength: 35,
  });

  const keyRow = new ActionRowBuilder<TextInputBuilder>({
    components: [keyInput],
  });

  return new ModalBuilder({
    customId: `verify:${product.value}`,
    title: "License Verification",
    components: [keyRow],
  });
}
