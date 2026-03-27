const { sendMessage } = require('../lib/telegram');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.TELEGRAM_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { text, parseMode = 'HTML' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text field' });
  }

  const success = await sendMessage(text, parseMode);
  if (success) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to send message' });
  }
};
