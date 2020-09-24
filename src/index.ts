require('dotenv').config();
import * as Discord from 'discord.js';
import { VoiceChannelObserver } from 'discord-voice-channel-observer';
import { ServerHandler } from '../ServerHandler';
// @ts-ignore
import * as DiscordWebhook from 'discord-webhook-node';

const Compute = require('@google-cloud/compute');
const compute = new Compute();
const zone = compute.zone(process.env.GC_ZONE);
const vm = zone.vm(process.env.GC_INSTANCE_NAME);
const hook = new DiscordWebhook.Webhook(process.env.DISCORD_WEBHOOK_URL);

(async() => {
    const client = new Discord.Client();
    await client.login(process.env.DISCORD_TOKEN);

    let startupDelayTimeout: NodeJS.Timeout | null = null;
    let shutdownDelayTimeout: NodeJS.Timeout | null = null;
    
    const observer = new VoiceChannelObserver(client, process.env.DISCORD_CHANNEL_ID as string);

    observer.onEmpty((channelId: string) => {
        if (ServerHandler.mustServerStartBeAborted(startupDelayTimeout)) {
            ServerHandler.abortServerStart(hook, startupDelayTimeout);
            startupDelayTimeout = null;
            return;
        }
        shutdownDelayTimeout = ServerHandler.markServerForShutdown(hook, () => {
            ServerHandler.shutdownServer(hook, vm)
            shutdownDelayTimeout = null;
        // @ts-ignore
        }, process.env.DELAY_SECONDS_SHUTDOWN * 1000);
    });

    observer.onNotEmpty((channelId: string) => {
        if (ServerHandler.mustServerShutdownBeAborted(hook, shutdownDelayTimeout)) {
            ServerHandler.abortServerShutdown(hook, shutdownDelayTimeout);
            shutdownDelayTimeout = null;
            return;
        }
        startupDelayTimeout = ServerHandler.markServerForStartUp(hook, () => {
            ServerHandler.startServer(hook, vm);
            startupDelayTimeout = null;
            // @ts-ignore
        }, process.env.DELAY_SECONDS_STARTUP * 1000)
    })
})()

