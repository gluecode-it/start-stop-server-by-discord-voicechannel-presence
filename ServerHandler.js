"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const DiscordWebhook = require("discord-webhook-node");
class ServerHandler {
    static mustServerStartBeAborted(startupDelayTimeout) {
        const result = !!startupDelayTimeout;
        console.log('must the server start be aborted?', result);
        return result;
    }
    static abortServerStart(hook, startupDelayTimeout) {
        hook.send(new DiscordWebhook.MessageBuilder()
            .setDescription('Server start abort because nobody is here anymore'));
        if (startupDelayTimeout)
            clearTimeout(startupDelayTimeout);
        console.log('abort server start!');
    }
    static markServerForStartUp(hook, startupCallback, startupDelayMs) {
        hook.send(new DiscordWebhook.MessageBuilder()
            .setDescription(`Server start will triggered in ${startupDelayMs / 1000} seconds`));
        console.log('mark server for startup');
        return setTimeout(startupCallback, startupDelayMs);
    }
    static startServer(hook, vm) {
        hook.send(new DiscordWebhook.MessageBuilder()
            .setDescription('Server is starting now'));
        console.log('start server now!');
        vm.start();
    }
    static mustServerShutdownBeAborted(hook, shutdownDelayTimeout) {
        const result = !!shutdownDelayTimeout;
        console.log('must the server shutdown be aborted?', result);
        return result;
    }
    static abortServerShutdown(hook, shutdownDelayTimeout) {
        hook.send(new DiscordWebhook.MessageBuilder()
            .setDescription('Server start abort because nobody is here anymore'));
        if (shutdownDelayTimeout)
            clearTimeout(shutdownDelayTimeout);
        console.log('abort server shutdown!');
    }
    static markServerForShutdown(hook, shutdownCallback, shutdownDelayMs) {
        hook.send(new DiscordWebhook.MessageBuilder()
            .setDescription(`Marked for stopping server. Stops in ${shutdownDelayMs / 1000} seconds`));
        console.log('mark server for shutdown');
        return setTimeout(shutdownCallback, shutdownDelayMs);
    }
    static shutdownServer(hook, vm) {
        hook.send(new DiscordWebhook.MessageBuilder()
            .setDescription('Server is stopping now'));
        console.log('shutdown server now!');
        vm.stop();
    }
}
exports.ServerHandler = ServerHandler;
