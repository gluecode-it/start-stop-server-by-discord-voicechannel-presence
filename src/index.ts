// @ts-ignore
import * as DiscordWebhook from "discord-webhook-node";
import { Webhook } from "discord-webhook-node";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import {
  VoiceChannelObserver,
  Event,
} from "@gluecode-it/discord-voice-channel-observer";
import { DelayedTransitionHandler } from "@gluecode-it/delayed-transition-handler";
import { VmHandler, GoogleVM } from "@gluecode-it/google-cloud-vm-handler";
import { Client } from "discord.js";
import { State } from "@gluecode-it/delayed-transition-handler/dist/src/state";

const Compute = require("@google-cloud/compute");

export class StartStopServerByDiscordVoiceChannel {
  private startToStopTransitionHandler: DelayedTransitionHandler;
  private stopToStartTransitionHandler: DelayedTransitionHandler;

  constructor(
    private observer: VoiceChannelObserver,
    private vmHandler: VmHandler,
    private messageHandler: DiscordMessagingHandler,
    private delayStartupMs: number,
    private delayShutdownMs: number,
    private startUpThreshold: number,
    private shutdownUpThreshold: number
  ) {
    this.startToStopTransitionHandler = new DelayedTransitionHandler(
      this.delayStartupMs
    );
    this.stopToStartTransitionHandler = new DelayedTransitionHandler(
      this.delayShutdownMs
    );
  }

  private async thresholdReachedHandler() {
    this.startToStopTransitionHandler.onTransitionScheduled(async () => {
      await this.messageHandler.sendStartScheduledMessage(this.delayStartupMs);
    });

    this.startToStopTransitionHandler.onTransitionStarted(async () => {
      await this.messageHandler.sendStartingMessage();
      //await vmHandler.start();
    });

    if (this.startToStopTransitionHandler.is(State.STATUS_A)) {
      this.startToStopTransitionHandler.scheduleTransition();
    }
  }

  private async thresholdLeftHandler() {
    this.stopToStartTransitionHandler.onTransitionScheduled(async () => {
      await this.messageHandler.sendStopScheduledMessage(this.delayShutdownMs);
    });

    this.stopToStartTransitionHandler.onTransitionStarted(async () => {
      await this.messageHandler.sendStopMessage();
      //await vmHandler.stop();
    });

    if (this.stopToStartTransitionHandler.is(State.STATUS_A)) {
      this.stopToStartTransitionHandler.scheduleTransition();
    }
  }

  async start() {
    this.vmHandler.onStarted((ip) => {
      this.messageHandler.sendRunningMessage(ip);
    });

    this.observer.onThresholdReached(
      this.startUpThreshold,
      this.thresholdReachedHandler
    );

    this.observer.onThresholdLeft(
      this.shutdownUpThreshold,
      this.thresholdLeftHandler
    );
  }
}
