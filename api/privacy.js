module.exports = async (req, res) => {
  console.log('Webhook de privacidad recibido:', req.url);
  return res.status(200).json({ ok: true });
};
