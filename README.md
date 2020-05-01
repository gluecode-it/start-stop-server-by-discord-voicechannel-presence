# Start/Stop Server by Discord VoiceChannel presence
Starts/Stops a Google Cloud hosted VM based on somebody is present in a discord voicechannel

## usage

**.env:**
```
DISCORD_TOKEN=**********
DISCORD_CHANNEL_ID=**********
DISCORD_WEBHOOK_URL=**********
DELAY_SECONDS_STARTUP=10
DELAY_SECONDS_SHUTDOWN=300

GC_ZONE=**********
GC_INSTANCE_NAME=**********

GOOGLE_APPLICATION_CREDENTIALS=**********
```

**start**
```
docker run -it \
    -v $(pwd)/credentials.json:/app/credentials.json
    -v $(pwd)/.env:/app/.env
    oliverlorenz/start-stop-server-by-discord-voicechannel-presence
```