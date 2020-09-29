require("dotenv").config();
import { StartStopServerByDiscordVoiceChannel } from "./index";

new StartStopServerByDiscordVoiceChannel(
  process.env.DISCORD_TOKEN,
  process.env.DISCORD_CHANNEL_ID,
  process.env.DISCORD_WEBHOOK_URL,
  parseInt(process.env.USER_THRESHOLD, 10),
  parseInt(process.env.DELAY_SECONDS_STARTUP, 10)*1000,
  parseInt(process.env.DELAY_SECONDS_SHUTDOWN, 10)*1000,
  process.env.GC_ZONE,
  process.env.GC_INSTANCE_NAME
).start();
