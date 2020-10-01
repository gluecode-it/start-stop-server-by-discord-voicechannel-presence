require("dotenv").config();
import { StartStopServerByDiscordVoiceChannel } from "./index";
import { Client } from "discord.js";
import { GoogleVM, VmHandler } from "@gluecode-it/google-cloud-vm-handler";
import { Webhook } from "discord-webhook-node";
import { VoiceChannelObserver } from "@gluecode-it/discord-voice-channel-observer";
import { DiscordMessagingHandler } from "./discordMessagingHandler";
const Compute = require('@google-cloud/compute');

(async() => {
  const discordClient = new Client();
  await discordClient.login(process.env.DISCORD_TOKEN)

  const compute = new Compute();
  const zone = compute.zone(process.env.GC_ZONE);
  const vm = zone.vm(process.env.GC_INSTANCE_NAME) as GoogleVM;
  const vmHandler = new VmHandler(vm);

  const observer = new VoiceChannelObserver(
    discordClient,
    process.env.DISCORD_CHANNEL_ID,
    []
  );

  const messageHandler = new DiscordMessagingHandler(
    new Webhook({
      url: process.env.DISCORD_WEBHOOK_URL,
    })
  );
  
  new StartStopServerByDiscordVoiceChannel(
    parseInt(process.env.USER_THRESHOLD, 10),
    parseInt(process.env.DELAY_SECONDS_STARTUP, 10)*1000,
    parseInt(process.env.DELAY_SECONDS_SHUTDOWN, 10)*1000, 
    observer, 
    vmHandler, 
    messageHandler
  ).start();
})()

