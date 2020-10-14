import { DiscordVoiceChannelServerHandler } from ".";
import { VoiceChannelObserver } from "@gluecode-it/discord-voice-channel-observer";
import { VmHandler } from "@gluecode-it/google-cloud-vm-handler";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
import { EventEmitter } from "events";

describe("StartStopServerByDiscordVoiceChannel", () => {
  let handler: DiscordVoiceChannelServerHandler;

  let observer: SpyObj<VoiceChannelObserver>;
  let vmHandler: SpyObj<VmHandler>;
  let messagingHandler: SpyObj<DiscordMessagingHandler>;

  const startUpDelayMs = 10;
  const shutdownDelayMs = 20;

  beforeEach(() => {
    observer = {
      onThresholdReached: jest.fn(),
      onThresholdLeft: jest.fn(),
      start: jest.fn(),
    };
    vmHandler = {
      onStarted: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
    messagingHandler = {
      sendStartAbort: jest.fn(),
      sendStartingMessage: jest.fn(),
      sendStartScheduledMessage: jest.fn(),
      sendStopAbort: jest.fn(),
      sendStopMessage: jest.fn(),
      sendStopScheduledMessage: jest.fn(),
      sendRunningMessage: jest.fn(),
    };

    handler = new DiscordVoiceChannelServerHandler(
      (observer as unknown) as VoiceChannelObserver,
      (vmHandler as unknown) as VmHandler,
      (messagingHandler as unknown) as DiscordMessagingHandler,
      startUpDelayMs,
      shutdownDelayMs,
      2
    );
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("start()", () => {
    it("should attach to onThresholdReached", async () => {
      await handler.start();
      expect(observer.onThresholdReached).toBeCalledTimes(1);
    });

    describe("if threshold reached,", () => {
      it("it should trigger onStartScheduled", (done) => {
        observer.onThresholdReached?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            callback();
          }
        );
        const callback = jest.fn();
        handler.onceStartScheduled(callback);
        handler.start();
        setTimeout(() => {
          expect(callback).toBeCalledTimes(1);
          expect(
            messagingHandler.sendStartScheduledMessage
          ).toHaveBeenCalledTimes(1);
          done();
        }, startUpDelayMs);
      });
      it("it should trigger onStartFinished", (done) => {
        observer.onThresholdReached?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            callback();
          }
        );
        const callback = jest.fn();
        handler.onStartFinished(callback);
        handler.onceStartFinished(() => {
          expect(callback).toBeCalledTimes(1);
          expect(vmHandler.start).toBeCalledTimes(1)
          expect(messagingHandler.sendStartingMessage).toHaveBeenCalledTimes(1);
          done();
        });
        handler.start();
      });
      describe("and will be aborted", () => {
        it("it should trigger onStartFinished", (done) => {
          const emitter = new EventEmitter();
          observer.onThresholdReached?.mockImplementationOnce(
            (threshold: number, callback: () => void) => {
              callback();
            }
          );
          observer.onThresholdLeft?.mockImplementationOnce(
            (threshold: number, callback: () => void) => {
              emitter.on("trigger", callback);
            }
          );
          const callback = jest.fn();
          handler.onStartAborted(callback);
          handler.onceStartAborted(() => {
            expect(callback).toBeCalledTimes(1);
            expect(messagingHandler.sendStartAbort).toHaveBeenCalledTimes(1);
            done();
          });
          handler.onStartScheduled(() => {
            emitter.emit("trigger");
          });

          handler.start();
        });
      });
    });

    describe("if threshold left,", () => {
      it("it should trigger onStopScheduled", (done) => {
        const emitter = new EventEmitter();
        observer.onThresholdReached?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            callback();
          }
        );
        observer.onThresholdLeft?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            emitter.on("trigger", callback);
          }
        );
        handler.onceStartFinished(() => {
          emitter.emit("trigger");
        });
        const callback = jest.fn();
        handler.onStopScheduled(callback);
        handler.onceStopScheduled(() => {
          expect(callback).toBeCalledTimes(1);
          expect(messagingHandler.sendStopScheduledMessage).toBeCalledTimes(1);
          done();
        });
        handler.start();
      });
      it("it should trigger onStopFinished", (done) => {
        const emitter = new EventEmitter();
        observer.onThresholdReached?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            callback();
          }
        );
        observer.onThresholdLeft?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            emitter.on("trigger", callback);
          }
        );
        handler.onStartFinished(() => {
          emitter.emit("trigger");
        });
        const callback = jest.fn();
        handler.onStopFinished(callback);
        handler.onceStopFinished(() => {
          expect(callback).toBeCalledTimes(1);
          expect(vmHandler.stop).toBeCalledTimes(1)
          expect(messagingHandler.sendStopMessage).toBeCalledTimes(1);
          done(); 
        });
        handler.start();
      });
      it("it should trigger onStopAbort", (done) => {
        const emitter = new EventEmitter();
        observer.onThresholdReached?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            callback();
            emitter.on("triggerReachedAgain", callback);
          }
        );
        observer.onThresholdLeft?.mockImplementationOnce(
          (threshold: number, callback: () => void) => {
            emitter.on("trigger", callback);
          }
        );
        handler.onceStartFinished(() => {
          emitter.emit("trigger");
        });
        const callback = jest.fn();
        handler.onStopScheduled(() => {
          emitter.emit("triggerReachedAgain");
        });
        handler.onStopAborted(callback);
        handler.onceStopAborted(() => {
          expect(callback).toBeCalledTimes(1);
          expect(messagingHandler.sendStopAbort).toBeCalledTimes(1);
          done();
        });
        handler.start();
      });
    });

    it("check reset", (done) => {
      const emitter = new EventEmitter();
      observer.onThresholdReached?.mockImplementationOnce(
        (threshold: number, callback: () => void) => {
          callback();
          emitter.on("triggerReached", callback);
        }
      );
      observer.onThresholdLeft?.mockImplementationOnce(
        (threshold: number, callback: () => void) => {
          emitter.on("triggerLeft", callback);
        }
      );
      handler.onceStartFinished(() => {
        handler.onceStopFinished(() => {
          handler.onceStartFinished(() => {
            done();
          });
          emitter.emit("triggerReached");
        });
        emitter.emit("triggerLeft");
      });
      handler.start();
    });

    it("check startToStopTransitionHandler does not throw error", async (done) => {
      const emitter = new EventEmitter();
      observer.onThresholdReached?.mockImplementationOnce(() => {});
      observer.onThresholdLeft?.mockImplementationOnce(
        (threshold: number, callback: () => void) => {
          emitter.on("triggerLeft", callback);
        }
      );
      handler.onceStopFinished(() => {
        done();
      });
      await handler.start();
      emitter.emit("triggerLeft");
    });

    it("should send if running", () => {
      vmHandler.onStarted?.mockImplementationOnce(
        (callback: (ip: string) => void) => {
          callback("1.1.1.1");
        }
      );
      const callback = jest.fn();
      const callbackOnce = jest.fn();
      handler.onceStartFinished(() => {
        expect(messagingHandler.sendRunningMessage).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(1);
        expect(callbackOnce).toBeCalledTimes(1);
      });
      handler.onGotIp(callback);
      handler.onceGotIp(callbackOnce);
      handler.start();
    });
  });
});
