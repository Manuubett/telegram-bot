const { sendMessage } = require('../lib/telegram');

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://bett.website',
  'https://www.bett.website',
  'https://manuubett.github.io', // keep during transition
];

function getAllowedOrigin(req) {
  const origin = req.headers['origin'] || '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

module.exports = async (req, res) => {

  // ── CORS headers ──
  const allowedOrigin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('Vary', 'Origin');

  // ── Preflight ──
  if (req.method === 'OPTIONS') {
    console.log('[send] OPTIONS preflight from:', req.headers['origin']);
    return res.status(200).end();
  }

  // ── Method guard ──
  if (req.method !== 'POST') {
    console.warn('[send] Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── API key auth ──
  const apiKey = req.headers['x-api-key'];
  if (!process.env.TELEGRAM_API_KEY) {
    console.error('[send] TELEGRAM_API_KEY env var not set');
    return res.status(500).json({ error: 'Server misconfigured — API key not set' });
  }
  if (apiKey !== process.env.TELEGRAM_API_KEY) {
    console.warn('[send] Unauthorized request — bad API key from origin:', req.headers['origin']);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Validate body ──
  const { text, parseMode = 'HTML' } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    console.warn('[send] Missing or invalid text field');
    return res.status(400).json({ error: 'Missing or empty text field' });
  }

  if (text.length > 4096) {
    console.warn('[send] Message too long:', text.length, 'chars');
    return res.status(400).json({ error: 'Message too long — max 4096 characters' });
  }

  // ── Send to Telegram ──
  console.log('[send] Sending message, length:', text.length, '| parseMode:', parseMode);

  try {
    const success = await sendMessage(text, parseMode);

    if (success) {
      console.log('[send] ✅ Message sent successfully');
      return res.status(200).json({ success: true });
    } else {
      console.error('[send] ❌ sendMessage returned false');
      return res.status(500).json({ error: 'Telegram delivery failed — check bot token and chat ID' });
    }

  } catch (err) {
    console.error('[send] ❌ Unexpected error:', err.message, err.stack);
    return res.status(500).json({
      error: 'Internal server error',
      detail: err.message
    });
  }
};
    
