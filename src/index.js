"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const Discord = require("discord.js");
const discord_voice_channel_observer_1 = require("discord-voice-channel-observer");
const ServerHandler_1 = require("../ServerHandler");
// @ts-ignore
const DiscordWebhook = require("discord-webhook-node");
const Compute = require('@google-cloud/compute');
const compute = new Compute();
const zone = compute.zone(process.env.GC_ZONE);
const vm = zone.vm(process.env.GC_INSTANCE_NAME);
const hook = new DiscordWebhook.Webhook(process.env.DISCORD_WEBHOOK_URL);
(() => __awaiter(void 0, void 0, void 0, function* () {
    const client = new Discord.Client();
    yield client.login(process.env.DISCORD_TOKEN);
    let startupDelayTimeout = null;
    let shutdownDelayTimeout = null;
    const observer = new discord_voice_channel_observer_1.VoiceChannelObserver(client, process.env.DISCORD_CHANNEL_ID);
    observer.onEmpty((channelId) => {
        if (ServerHandler_1.ServerHandler.mustServerStartBeAborted(startupDelayTimeout)) {
            ServerHandler_1.ServerHandler.abortServerStart(hook, startupDelayTimeout);
            startupDelayTimeout = null;
            return;
        }
        shutdownDelayTimeout = ServerHandler_1.ServerHandler.markServerForShutdown(hook, () => {
            ServerHandler_1.ServerHandler.shutdownServer(hook, vm);
            shutdownDelayTimeout = null;
            // @ts-ignore
        }, process.env.DELAY_SECONDS_SHUTDOWN * 1000);
    });
    observer.onNotEmpty((channelId) => {
        if (ServerHandler_1.ServerHandler.mustServerShutdownBeAborted(hook, shutdownDelayTimeout)) {
            ServerHandler_1.ServerHandler.abortServerShutdown(hook, shutdownDelayTimeout);
            shutdownDelayTimeout = null;
            return;
        }
        startupDelayTimeout = ServerHandler_1.ServerHandler.markServerForStartUp(hook, () => {
            ServerHandler_1.ServerHandler.startServer(hook, vm);
            startupDelayTimeout = null;
            // @ts-ignore
        }, process.env.DELAY_SECONDS_STARTUP * 1000);
    });
}))();
