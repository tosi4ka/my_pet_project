import axios from 'axios';
import 'dotenv/config';
import express from 'express';
import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';
const PORT = Number(process.env.WEBHOOK_PORT ?? 4000);

const BOT_USERNAME = (
  process.env.TELEGRAM_BOT_USERNAME ?? 'My_learn_otp_bot'
).replace(/^@/, '');

if (!BOT_TOKEN) {
  console.error(
    'FATAL: TELEGRAM_BOT_TOKEN is not set. Put your token in env as TELEGRAM_BOT_TOKEN.',
  );
  process.exit(1);
}
if (!WEBHOOK_URL) {
  console.error(
    'FATAL: TELEGRAM_WEBHOOK_URL is not set. Put your public webhook url in env as TELEGRAM_WEBHOOK_URL.',
  );
  process.exit(1);
}
if (!SECRET) {
  console.warn(
    'WARNING: TELEGRAM_WEBHOOK_SECRET is empty. It is recommended to set this and use it both here and in backend.',
  );
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

async function forwardToBackend(payload: any) {
  try {
    const resp = await axios.post(`${BACKEND_URL}/telegram/webhook`, payload, {
      headers: {
        'x-telegram-bot-api-secret-token': SECRET,
        'Content-Type': 'application/json',
      },
      timeout: 7000,
    });
    return { ok: true, status: resp.status, data: resp.data };
  } catch (err: any) {
    // normalize error for logs
    const payloadInfo = err?.response?.data ?? err?.message ?? String(err);
    return { ok: false, error: payloadInfo };
  }
}

bot.start(async (ctx) => {
  const payload = (ctx.startPayload ?? '').toString();
  const chatId = ctx.from?.id ?? ctx.chat?.id;

  if (payload && chatId) {
    try {
      const forwardRes = await forwardToBackend({
        token: payload,
        chatId: String(chatId),
      });
      if (forwardRes.ok) {
        try {
          await ctx.reply(
            'Processing your request — you will receive the verification code in this chat shortly.',
          );
        } catch (e) {
          console.warn(
            'Failed to send reply after forwarding start payload:',
            e?.message ?? e,
          );
        }
      } else {
        console.error(
          'Backend forward failed for start payload:',
          forwardRes.error,
        );
        try {
          await ctx.reply(
            'An error occurred while processing your request. Please try again shortly.',
          );
        } catch (e) {}
      }
    } catch (e) {
      console.error('Unexpected error while handling start payload:', e);
      try {
        await ctx.reply(
          'An unexpected error occurred. Please try again later.',
        );
      } catch (e) {}
    }
    return;
  }

  try {
    await ctx.reply(
      'Please press the "Share contact" button to link your phone with the service.',
    );
  } catch (e) {
    console.error('Reply error in /start (fallback):', e);
  }
});

app.post('/telegram/webhook', (req, res) => {
  bot
    .handleUpdate(req.body, res)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error('bot handleUpdate error', err);
      res.sendStatus(500);
    });
});

bot.on('contact', async (ctx) => {
  const contact = ctx.message?.contact;
  const chatId = ctx.from?.id ?? ctx.chat?.id;

  if (!contact || !chatId) {
    console.warn('Contact or chatId missing in update', { contact, chatId });
    return;
  }

  console.log('Received contact from user', {
    chatId,
    phone: contact.phone_number,
  });

  try {
    const forwardRes = await forwardToBackend({
      phone: contact.phone_number,
      chatId,
    });

    if (forwardRes.ok) {
      console.log('Forwarded contact to backend, status:', forwardRes.status);
      try {
        await ctx.reply('Thank you — your phone has been linked.');
      } catch (e) {
        console.warn(
          'Failed to send confirmation reply to user:',
          e?.message ?? e,
        );
      }
    } else {
      console.error('Error forwarding contact to backend:', forwardRes.error);
      try {
        await ctx.reply(
          'Server error while linking your contact. Please try again later.',
        );
      } catch (e) {
        console.error('Reply error after forward failure:', e);
      }
    }
  } catch (err: any) {
    console.error(
      'Unexpected error forwarding contact to backend:',
      err?.message ?? err,
    );
    try {
      await ctx.reply(
        'Server error while linking your contact. Please try again later.',
      );
    } catch (e) {
      console.error('Reply error after unexpected failure:', e);
    }
  }
});
async function trySetWebhook() {
  try {
    // @ts-ignore: telegraf typings may not include secret_token option
    await bot.telegram.setWebhook(WEBHOOK_URL, { secret_token: SECRET });
    console.log('Attempted to set webhook via Telegraf with secret_token.');
  } catch (e) {
    console.warn(
      'setWebhook via Telegraf failed or not supported by this telegraf version. Please run setWebhook manually using curl. Error:',
      e?.message ?? e,
    );
  }
}

(async () => {
  try {
    await trySetWebhook();

    const server = app.listen(PORT, () => {
      console.log(`Webhook server listening on port ${PORT}`);
      console.log(`Telegram webhook URL: ${WEBHOOK_URL}`);
      console.log(
        `Forwarding contacts and start tokens to backend: ${BACKEND_URL}`,
      );
      console.log(`Bot username: @${BOT_USERNAME}`);
      if (SECRET)
        console.log(
          'Using TELEGRAM_WEBHOOK_SECRET (will be forwarded to backend).',
        );
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down webhook server.');
      server.close();
      process.exit(0);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });
  } catch (err) {
    console.error('Startup error for webhook server:', err);
    process.exit(1);
  }
})();
