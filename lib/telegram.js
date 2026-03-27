const fetch = require('node-fetch');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

async function sendMessage(text, parseMode = 'HTML') {
  if (!BOT_TOKEN || !OWNER_CHAT_ID) {
    console.error('Missing Telegram credentials');
    return false;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: OWNER_CHAT_ID,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: false,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.ok;
  } catch (err) {
    console.error('Telegram send error:', err.message);
    return false;
  }
}

module.exports = { sendMessage };
