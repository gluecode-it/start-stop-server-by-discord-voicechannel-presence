// @ts-ignore
import * as DiscordWebhook from "discord-webhook-node";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import { VoiceChannelObserver } from "@gluecode-it/discord-voice-channel-observer";
import { DelayedTransitionHandler } from "@gluecode-it/delayed-transition-handler";
import { VmHandler } from "@gluecode-it/google-cloud-vm-handler"
import { State } from "@gluecode-it/delayed-transition-handler/dist/src/state";

export class StartStopServerByDiscordVoiceChannel {
  constructor(
    private threshold: number, 
    private delayStartupMs: number,
    private delayShutdownMs: number,
    private observer: VoiceChannelObserver,
    private vmHandler: VmHandler,
    private messageHandler: DiscordMessagingHandler,
  ) {}
  async start() {
    this.vmHandler.onStarted((ip) => {
      this.messageHandler.sendRunningMessage(ip)
    })

    this.observer.onThresholdReached(this.threshold, async () => {
      const startToStopTransitionHandler = new DelayedTransitionHandler(
        this.delayStartupMs
      )
      startToStopTransitionHandler.onTransitionScheduled(async () => {
        await this.messageHandler.sendStartScheduledMessage(this.delayStartupMs)
      })

      startToStopTransitionHandler.onTransitionFinished(async() => {
        await this.messageHandler.sendStartingMessage()
        //await vmHandler.start();
      })

      if(startToStopTransitionHandler.is(State.STATUS_A)) {
        startToStopTransitionHandler.scheduleTransition();
      }
    })

    this.observer.onThresholdLeft(this.threshold, async () => {
      const stopToStartTransitionHandler = new DelayedTransitionHandler(
        this.delayShutdownMs,
      );

      stopToStartTransitionHandler.onTransitionScheduled(async () => {
        await this.messageHandler.sendStopScheduledMessage(this.delayShutdownMs)
      })

      stopToStartTransitionHandler.onTransitionFinished(async() => {
        await this.messageHandler.sendStopMessage()
        //await vmHandler.stop();
      })
      
      if(stopToStartTransitionHandler.is(State.STATUS_A)) {
        stopToStartTransitionHandler.scheduleTransition();
      }
    })
  }
}