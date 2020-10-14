// @ts-ignore
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import { VoiceChannelObserver } from "@gluecode-it/discord-voice-channel-observer";
import { DelayedTransitionHandler } from "@gluecode-it/delayed-transition-handler";
import { VmHandler } from "@gluecode-it/google-cloud-vm-handler";
import { State } from "@gluecode-it/delayed-transition-handler/dist/src/state";
import { EventEmitter } from "events";

enum Event {
  START_SCHEDULED = "START_SCHEDULED",
  START_ABORT = "START_ABORT",
  START_FINISHED = "START_FINISHED",
  GOT_IP = "GOT_IP",
  STOP_SCHEDULED = "STOP_SCHEDULED",
  STOP_ABORT = "STOP_ABORT",
  STOP_FINISHED = "STOP_FINISHED",
}

export * from "./discordMessagingHandler";

export class DiscordVoiceChannelServerHandler {
  private startToStopTransitionHandler: DelayedTransitionHandler;
  private stopToStartTransitionHandler: DelayedTransitionHandler;
  private emitter: EventEmitter;

  constructor(
    private observer: VoiceChannelObserver,
    private vmHandler: VmHandler,
    private messageHandler: DiscordMessagingHandler,
    private delayStartupMs: number,
    private delayShutdownMs: number,
    private startThreshold: number
  ) {
    this.startToStopTransitionHandler = new DelayedTransitionHandler(
      this.delayStartupMs
    );
    this.stopToStartTransitionHandler = new DelayedTransitionHandler(
      this.delayShutdownMs
    );
    this.emitter = new EventEmitter();
  }

  private async thresholdReachedHandler() {
    if (this.stopToStartTransitionHandler.is(State.TRANSITIONING)) {
      this.stopToStartTransitionHandler.abortTransition();
      return;
    }
    this.startToStopTransitionHandler.scheduleTransition();
  }

  private async thresholdLeftHandler() {
    if (this.startToStopTransitionHandler.is(State.TRANSITIONING)) {
      this.startToStopTransitionHandler.abortTransition();
      return;
    }
    this.stopToStartTransitionHandler.scheduleTransition();
  }

  public onStartScheduled(callback: () => void) {
    this.emitter.on(Event.START_SCHEDULED, callback);
  }

  public onStartAborted(callback: () => void) {
    this.emitter.on(Event.START_ABORT, callback);
  }

  public onStartFinished(callback: () => void) {
    this.emitter.on(Event.START_FINISHED, callback);
  }

  public onGotIp(callback: (Ip: string) => void) {
    this.emitter.on(Event.GOT_IP, callback);
  }

  public onStopScheduled(callback: () => void) {
    this.emitter.on(Event.STOP_SCHEDULED, callback);
  }

  public onStopAborted(callback: () => void) {
    this.emitter.on(Event.STOP_ABORT, callback);
  }

  public onStopFinished(callback: () => void) {
    this.emitter.on(Event.STOP_FINISHED, callback);
  }

  public onceStartScheduled(callback: () => void) {
    this.emitter.once(Event.START_SCHEDULED, callback);
  }

  public onceStartAborted(callback: () => void) {
    this.emitter.once(Event.START_ABORT, callback);
  }

  public onceStartFinished(callback: () => void) {
    this.emitter.once(Event.START_FINISHED, callback);
  }

  public onceGotIp(callback: (Ip: string) => void) {
    this.emitter.once(Event.GOT_IP, callback);
  }

  public onceStopScheduled(callback: () => void) {
    this.emitter.once(Event.STOP_SCHEDULED, callback);
  }

  public onceStopAborted(callback: () => void) {
    this.emitter.once(Event.STOP_ABORT, callback);
  }

  public onceStopFinished(callback: () => void) {
    this.emitter.once(Event.STOP_FINISHED, callback);
  }

  async start() {
    this.vmHandler.onStarted((ip) => {
      this.messageHandler.sendRunningMessage(ip);
    });

    this.startToStopTransitionHandler.onTransitionScheduled(async () => {
      await this.messageHandler.sendStartScheduledMessage(this.delayStartupMs);
      this.emitter.emit(Event.START_SCHEDULED);
    });

    this.startToStopTransitionHandler.onTransitionAborted(async () => {
      await this.messageHandler.sendStartAbort();
      this.emitter.emit(Event.START_ABORT);
    });

    this.startToStopTransitionHandler.onTransitionFinished(async () => {
      await this.messageHandler.sendStartingMessage();
      await this.vmHandler.start();
      if (this.stopToStartTransitionHandler.is(State.STATUS_B)) {
        this.stopToStartTransitionHandler.reset();
      }
      this.emitter.emit(Event.START_FINISHED);
    });

    this.stopToStartTransitionHandler.onTransitionScheduled(async () => {
      await this.messageHandler.sendStopScheduledMessage(this.delayShutdownMs);
      this.emitter.emit(Event.STOP_SCHEDULED);
    });

    this.stopToStartTransitionHandler.onTransitionAborted(async () => {
      await this.messageHandler.sendStopAbort();
      this.emitter.emit(Event.STOP_ABORT);
    });

    this.stopToStartTransitionHandler.onTransitionFinished(async () => {
      await this.messageHandler.sendStopMessage();
      await this.vmHandler.stop();
      if (this.startToStopTransitionHandler.is(State.STATUS_B)) {
        this.startToStopTransitionHandler.reset();
      }
      this.emitter.emit(Event.STOP_FINISHED);
    });

    this.observer.onThresholdReached(
      this.startThreshold,
      this.thresholdReachedHandler.bind(this)
    );

    this.observer.onThresholdLeft(
      this.startThreshold,
      this.thresholdLeftHandler.bind(this)
    );
    await this.observer.start();
  }
}
