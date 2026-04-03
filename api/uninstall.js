const { Redis } = require('@upstash/redis');
const kv = Redis.fromEnv();

// Webhook de desinstalación requerido por Tiendanube.
// Se llama cuando una tienda desinstala la app.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido' }); }
  }

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
