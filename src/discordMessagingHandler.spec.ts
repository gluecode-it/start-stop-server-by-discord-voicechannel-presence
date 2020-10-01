import { DiscordMessagingHandler } from "./discordMessagingHandler";
import { Webhook } from "discord-webhook-node";
import "./jest";

describe(DiscordMessagingHandler.name, () => {
  let handler: DiscordMessagingHandler;

  let fakeHook: SpyObj<Webhook> = {
    info: jest.fn(),
  };

  beforeEach(() => {
    handler = new DiscordMessagingHandler(fakeHook as Webhook);
    fakeHook.info = jest.fn();
  });

  it("should be able to create", () => {
    expect(handler).toBeDefined();
  });

  describe("sendStartScheduledMessage()", () => {
    it("should generate a info message (in a few seconds)", async () => {
      await handler.sendStartScheduledMessage(20000);
      expect(fakeHook.info).toHaveBeenCalledWith(
        "Server start will be triggered in a few seconds"
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });

    it("should generate a info message (in 2 minutes)", async () => {
      await handler.sendStartScheduledMessage(120000);
      expect(fakeHook.info).toHaveBeenCalledWith(
        "Server start will be triggered in 2 minutes"
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });

  describe("sendStartingMessage()", () => {
    it("should generate a info message", async () => {
      await handler.sendStartingMessage();
      expect(fakeHook.info).toHaveBeenCalledWith("Server is starting now");
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });

  describe("sendStartAbort()", () => {
    it("should generate a info message", async () => {
      await handler.sendStartAbort();
      expect(fakeHook.info).toHaveBeenCalledWith(
        "Server start abort because to few people are in the channel"
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });

  describe("sendStopAbort()", () => {
    it("should generate a info message", async () => {
      await handler.sendStopAbort();
      expect(fakeHook.info).toHaveBeenCalledWith(
        "Server stop abort because enough people are in the channel again"
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });

  describe("sendStopScheduledMessage()", () => {
    it("should generate a info message (in a few seconds)", async () => {
      await handler.sendStopScheduledMessage(20000);
      expect(fakeHook.info).toHaveBeenCalledWith(
        "Stopping server in a few seconds"
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });

    it("should generate a info message (in 2 minutes)", async () => {
      await handler.sendStopScheduledMessage(120000);
      expect(fakeHook.info).toHaveBeenCalledWith(
        "Stopping server in 2 minutes"
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });

  describe("sendRunningMessage()", () => {
    it("should generate a info message with hostname", async () => {
      const expectedIp = "127.0.0.1";
      await handler.sendRunningMessage(expectedIp);
      expect(fakeHook.info).toHaveBeenCalledWith(
        `Server is to find as ${expectedIp}`
      );
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });

  describe("sendStopMessage()", () => {
    it("should generate a info message", async () => {
      await handler.sendStopMessage();
      expect(fakeHook.info).toHaveBeenCalledWith(`Stopping server now`);
      expect(fakeHook.info).toBeCalledTimes(1);
    });
  });
});
