import { StartStopServerByDiscordVoiceChannel } from "."; 
import { VoiceChannelObserver } from "@gluecode-it/discord-voice-channel-observer";
import { VmHandler } from "@gluecode-it/google-cloud-vm-handler";
import { DiscordMessagingHandler } from "./discordMessagingHandler";

describe("StartStopServerByDiscordVoiceChannel", () => {
    let handler: StartStopServerByDiscordVoiceChannel;
    let observer: VoiceChannelObserver = {
        onThresholdReached: jest.fn(),
    }
    let vmHandler: VmHandler = {

    }
    let messagingHandler: DiscordMessagingHandler = {

    }
    
    beforeEach(() => {
        handler = new StartStopServerByDiscordVoiceChannel(
            2,
            10000,
            10000,
            observer as VoiceChannelObserver,
            vmHandler,
            messagingHandler
        );
     });
    
     describe('start()', () => {
         it('asdasd', async () => {
            await handler.start()
            expect(observer.onThresholdReached).toBeCalled();
         })
     })

    it("should be able to create", () => {
      expect(handler).toBeDefined();
    });

    
})