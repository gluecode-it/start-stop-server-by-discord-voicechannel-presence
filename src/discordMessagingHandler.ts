import { Webhook } from "discord-webhook-node";
import moment from "moment";

export class DiscordMessagingHandler {
  constructor(private hook: Webhook) {}

  async sendStartScheduledMessage(startupDelayMs: number) {
    const formattedTime = moment()
      .add(startupDelayMs, "milliseconds")
      .fromNow();
    this.hook.info(`Server start will triggered ${formattedTime}`);
  }

  async sendStartingMessage() {
    this.hook.info("Server is starting now");
  }

  async sendStartAbort() {
    this.hook.info(
      "Server start abort because to few people are in the channel"
    );
  }

  async sendStopScheduledMessage(shutdownDelay: number) {
    const formattedTime = moment().add(shutdownDelay, "milliseconds").fromNow();
    this.hook.info(`Stopping server ${formattedTime}`);
  }

  async sendRunningMessage(host: string) {
    await this.hook.info(`Server is to find as ${host}`);
  }

  async sendStopMessage() {
    this.hook.info(`Stopping server now`);
  }
}
