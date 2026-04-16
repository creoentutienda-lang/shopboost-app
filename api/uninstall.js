const { Redis } = require('@upstash/redis');
const { parseWebhookBody } = require('./_verifyWebhook');
const kv = Redis.fromEnv();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const body = await parseWebhookBody(req, res);
  if (!body) return;

  const storeId = body?.store_id || body?.user_id;
  if (!storeId) {
    console.error('Uninstall webhook sin store_id:', body);
    return res.status(400).json({ error: 'Falta store_id' });
  }

  try {
    await kv.del(`config:${storeId}`);
    console.log(`App desinstalada para tienda: ${storeId}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error en desinstalación para tienda:', storeId, err);
    return res.status(500).json({ error: 'Error al procesar desinstalación' });
  }
};

module.exports.config = { api: { bodyParser: false } };
