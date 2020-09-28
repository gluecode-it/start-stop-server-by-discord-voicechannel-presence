// @ts-ignore
import * as DiscordWebhook from "discord-webhook-node";
import { Webhook } from "discord-webhook-node";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import {} from "@gluecode-it/discord-voice-channel-observer";

const Compute = require("@google-cloud/compute");

export class StartStopServerByDiscordVoiceChannel {
  private messageHandler: DiscordMessagingHandler;
  constructor(private webhookUrl: string) {
    this.messageHandler = new DiscordMessagingHandler(
      new Webhook({
        url: webhookUrl,
      })
    );
  }

  start() {}
}
