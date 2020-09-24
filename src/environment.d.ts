declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DELAY_SECONDS_STARTUP: string;
      DELAY_SECONDS_SHUTDOWN: string;
      USER_THRESHOLD: string;
      DISCORD_CHANNEL_ID: string;
      DISCORD_TOKEN: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};