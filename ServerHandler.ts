// @ts-ignore
import * as DiscordWebhook from 'discord-webhook-node';

export class ServerHandler {

    static mustServerStartBeAborted(startupDelayTimeout: NodeJS.Timeout | null): Boolean {
        const result = !!startupDelayTimeout;
        console.log('must the server start be aborted?', result);
        return result;
    }
    
    static abortServerStart(hook: DiscordWebhook, startupDelayTimeout: NodeJS.Timeout | null) {
        hook.send(
            new DiscordWebhook.MessageBuilder()
                .setDescription('Server start abort because nobody is here anymore')
        );
        if (startupDelayTimeout) clearTimeout(startupDelayTimeout);
        console.log('abort server start!'); 
    }
    
    static markServerForStartUp(hook: DiscordWebhook, startupCallback: (...args: any[]) => void, startupDelayMs: number) {
        hook.send(
            new DiscordWebhook.MessageBuilder()
                .setDescription(`Server start will triggered in ${startupDelayMs / 1000} seconds`)
        );
        console.log('mark server for startup'); 
        return setTimeout(startupCallback, startupDelayMs)
    }
    
    static startServer(hook: DiscordWebhook, vm: any) {
        hook.send(
            new DiscordWebhook.MessageBuilder()
                .setDescription('Server is starting now')
        );
        console.log('start server now!'); 
        vm.start();
    }
    
    static mustServerShutdownBeAborted(hook: DiscordWebhook, shutdownDelayTimeout: NodeJS.Timeout | null): Boolean {
        const result = !!shutdownDelayTimeout;
        console.log('must the server shutdown be aborted?', result);
        return result;
    }
    
    static abortServerShutdown(hook: DiscordWebhook, shutdownDelayTimeout: NodeJS.Timeout | null) {
        hook.send(
            new DiscordWebhook.MessageBuilder()
                .setDescription('Server start abort because nobody is here anymore')
        );
        if (shutdownDelayTimeout) clearTimeout(shutdownDelayTimeout);
        console.log('abort server shutdown!'); 
    }
    
    static markServerForShutdown(hook: DiscordWebhook, shutdownCallback: (...args: any[]) => void, shutdownDelayMs: number) {
        hook.send(
            new DiscordWebhook.MessageBuilder()
                .setDescription(`Marked for stopping server. Stops in ${shutdownDelayMs / 1000} seconds`)
        );
        console.log('mark server for shutdown'); 
        return setTimeout(shutdownCallback, shutdownDelayMs)
    }
    
    static shutdownServer(hook: DiscordWebhook, vm: any) {
        hook.send(
            new DiscordWebhook.MessageBuilder()
                .setDescription('Server is stopping now')
        );
        console.log('shutdown server now!');
        vm.stop();
    }
}