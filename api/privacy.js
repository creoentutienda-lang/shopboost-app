const { Redis } = require('@upstash/redis');
const crypto = require('crypto');
const kv = Redis.fromEnv();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const signature = req.headers['x-linkedstore-hmac-sha256'];
  if (signature) {
    const expected = crypto
      .createHmac('sha256', process.env.CLIENT_SECRET || '')
      .update(rawBody)
      .digest('base64');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.error('Privacy webhook: firma HMAC inválida');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  let body;
  try { body = JSON.parse(rawBody); } catch { return res.status(400).json({ error: 'JSON inválido' }); }

  const storeId = body?.store_id || body?.user_id;
  if (!storeId) {
    console.error('Privacy webhook sin store_id:', body);
    return res.status(400).json({ error: 'Falta store_id' });
  }

  try {
    await kv.del(`config:${storeId}`);
    console.log(`Datos eliminados para tienda: ${storeId}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error eliminando datos de tienda:', storeId, err);
    return res.status(500).json({ error: 'Error al eliminar datos' });
  }
};

module.exports.config = { api: { bodyParser: false } };
