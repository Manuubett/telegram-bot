module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Telegram Notifier API is running!',
    endpoints: {
      send: '/api/send (POST)'
    }
  });
};
