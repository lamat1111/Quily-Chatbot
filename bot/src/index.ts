import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { registerMentionHandler } from './handlers/mention';
import { startDailyStats } from './handlers/stats';
import { startDailyRecap } from './handlers/dailyRecap';

const llmProvider = process.env.BOT_LLM_PROVIDER || 'openrouter';
const providerKeyVar = llmProvider === 'chutes' ? 'CHUTES_API_KEY' : 'OPENROUTER_API_KEY';
const requiredEnvVars = ['DISCORD_BOT_TOKEN', providerKeyVar, 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
console.log(`LLM provider: ${llmProvider}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', (c) => {
  console.log(`Bot ready! Logged in as ${c.user.tag} — ${c.guilds.cache.size} guild(s)`);
  startDailyStats(client);
  startDailyRecap(client);
});

registerMentionHandler(client);

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down...`);
  client.destroy();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

client.login(process.env.DISCORD_BOT_TOKEN);
