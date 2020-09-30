// @ts-ignore
import * as DiscordWebhook from "discord-webhook-node";
import { Webhook } from "discord-webhook-node";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import { VoiceChannelObserver, Event } from "@gluecode-it/discord-voice-channel-observer";
import { DelayedTransitionHandler } from "@gluecode-it/delayed-transition-handler";
import { VmHandler, GoogleVM } from "@gluecode-it/google-cloud-vm-handler"
import { Client } from 'discord.js'
import { State } from "@gluecode-it/delayed-transition-handler/dist/src/state";

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
        url: this.webhookUrl,
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

    const vmHandler = new VmHandler(vm);
    vmHandler.onStarted((ip) => {
      this.messageHandler.sendRunningMessage(ip)
    })

    observer.onThresholdReached(this.threshold, async () => {
      const startToStopTransitionHandler = new DelayedTransitionHandler(
        this.delayStartupMs
      )
      startToStopTransitionHandler.onTransitionScheduled(async () => {
        await this.messageHandler.sendStartScheduledMessage(this.delayStartupMs)
      })

      startToStopTransitionHandler.onTransitionStarted(async() => {
        await this.messageHandler.sendStartingMessage()
        //await vmHandler.start();
      })

      if(startToStopTransitionHandler.is(State.STATUS_A)) {
        startToStopTransitionHandler.scheduleTransition();
      }
    })

    observer.onThresholdLeft(this.threshold, async () => {
      const stopToStartTransitionHandler = new DelayedTransitionHandler(
        this.delayShutdownMs,
      );

      stopToStartTransitionHandler.onTransitionScheduled(async () => {
        await this.messageHandler.sendStopScheduledMessage(this.delayShutdownMs)
      })

      stopToStartTransitionHandler.onTransitionStarted(async() => {
        await this.messageHandler.sendStopMessage()
        //await vmHandler.stop();
      })
      
      if(stopToStartTransitionHandler.is(State.STATUS_A)) {
        stopToStartTransitionHandler.scheduleTransition();
      }
    })
  }
}