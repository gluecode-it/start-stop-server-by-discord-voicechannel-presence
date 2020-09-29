// @ts-ignore
import * as DiscordWebhook from "discord-webhook-node";
import { Webhook } from "discord-webhook-node";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import { VoiceChannelObserver, Event } from "@gluecode-it/discord-voice-channel-observer";
import { DelayedTransitionHandler } from "@gluecode-it/delayed-transition-handler";
import { VmHandler, GoogleVM } from "@gluecode-it/google-cloud-vm-handler"
import { Client } from 'discord.js'

const Compute = require('@google-cloud/compute');

export class StartStopServerByDiscordVoiceChannel {
  private messageHandler: DiscordMessagingHandler;
  constructor(
    private token: string, 
    private channelId: string, 
    private webhookUrl: string, 
    private threshold: number, 
    private delayStartupMs: number,
    private delayShutdownMs: number,
    private gcZone: string,
    private gcInstanceName: string
  ) {
    this.messageHandler = new DiscordMessagingHandler(
      new Webhook({
        url: webhookUrl,
      })
    );
  }

  async start() {
    const compute = new Compute();
    const zone = compute.zone(this.gcZone);
    const vm = zone.vm(this.gcInstanceName) as GoogleVM;

    const discordClient = new Client();
    await discordClient.login(this.token)
    const observer = new VoiceChannelObserver(
      discordClient,
      this.channelId,
      []
    );

    observer.onThresholdReached(this.threshold, async () => {
      const vmHandler = new VmHandler(vm);
      const startToStopTransitionHandler = new DelayedTransitionHandler(
        this.delayStartupMs
      );
      await this.messageHandler.sendStartScheduledMessage(this.delayStartupMs)

      startToStopTransitionHandler.onTransitionStarted(async () => {
        await vmHandler.start();
        await this.messageHandler.sendStartingMessage();
        vmHandler.onStarted((ip) => {
          this.messageHandler.sendRunningMessage(ip)
        })
      })
    
      startToStopTransitionHandler.scheduleTransition();
    })

    observer.onThresholdLeft(this.threshold, () => {
      const vmHandler = new VmHandler(vm);
      const stopToStartTransitionHandler = new DelayedTransitionHandler(
        10000,
      );
      this.messageHandler.sendStopScheduledMessage(this.delayShutdownMs)

      stopToStartTransitionHandler.onTransitionStarted(async () => {
        await vmHandler.stop();
        this.messageHandler.sendStopMessage();
      })

      stopToStartTransitionHandler.scheduleTransition();
    })
  }
}