require("dotenv").config();
import { StartStopServerByDiscordVoiceChannel } from "./index";

new StartStopServerByDiscordVoiceChannel(
  process.env.DISCORD_WEBHOOK_URL
).start();
