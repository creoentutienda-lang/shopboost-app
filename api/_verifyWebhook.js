const crypto = require('crypto');

const HMAC_HEADER = 'x-linkedstore-hmac-sha256';

async function parseWebhookBody(req, res) {
  const signature = req.headers[HMAC_HEADER];
  if (!signature) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const secret = process.env.CLIENT_SECRET;
  if (!secret) {
    console.error('CLIENT_SECRET no configurado');
    res.status(500).json({ error: 'Misconfigured' });
    return null;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const sigBuf = Buffer.from(signature, 'ascii');
  const expBuf = Buffer.from(expected, 'ascii');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: 'JSON inválido' });
    return null;
  }
}

module.exports = { parseWebhookBody };
