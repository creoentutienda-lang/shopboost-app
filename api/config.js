const { Redis } = require('@upstash/redis');
const kv = Redis.fromEnv();

const ALLOWED_ORIGINS = [
  /^https:\/\/[\w-]+\.tiendanube\.com$/,
  /^https:\/\/[\w-]+\.mitiendanube\.com$/,
  /^https:\/\/[\w-]+\.nuvemshop\.com\.br$/
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(re => re.test(origin));
}

function validateConfig(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if ('active' in body && typeof body.active !== 'boolean') return false;
  if ('textos' in body && typeof body.textos !== 'object') return false;
  if ('categorias' in body && !Array.isArray(body.categorias)) return false;
  return true;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const appUrl = process.env.APP_URL || '';

  // CORS: GET permitido desde tiendas Tiendanube; POST solo desde el mismo dominio (admin)
  if (req.method === 'OPTIONS') {
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    return res.status(200).end();
  }

  if (req.method === 'GET' && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  const storeId = req.query.store;
  if (!storeId) return res.status(400).json({ error: 'Falta el parámetro store' });

  if (req.method === 'GET') {
    try {
      const config = await kv.get(`config:${storeId}`);
      return res.status(200).json(config || getDefaultConfig());
    } catch (err) {
      console.error('KV GET error:', err);
      return res.status(500).json({ error: 'Error al leer configuración' });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido' }); }
    }
    if (!validateConfig(body)) {
      return res.status(400).json({ error: 'Configuración inválida' });
    }
    try {
      await kv.set(`config:${storeId}`, body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('KV SET error:', err);
      return res.status(500).json({ error: 'Error al guardar configuración' });
    }
  }

  res.status(405).end();
};

function getDefaultConfig() {
  return {
    active: true,
    textos: {
      btnPrincipal: 'Encontrá tu talle',
      btnSecundario: 'Tabla de talles',
      titulo: 'Encontra tu talle',
      subtitulo: 'Ingresa tus medidas y te decimos que talle elegir',
      btnCalcular: 'Calcular mi talle',
      btnCerrar: 'Entendido'
    },
    categorias: [
      {
        id: 'calzas',
        nombre: 'Calzas',
        talles: ['XS', 'S', 'M', 'L', 'XL'],
        medidas: [
          { nombre: 'Cintura (cm)', valores: ['60–64', '65–69', '70–75', '76–82', '83–90'] },
          { nombre: 'Cadera (cm)',  valores: ['86–90', '91–95', '96–101', '102–108', '109–116'] }
        ]
      },
      {
        id: 'remeras',
        nombre: 'Remeras / Tops',
        talles: ['S / 38', 'M / 40', 'L / 42', 'XL / 44'],
        medidas: [
          { nombre: 'Busto (cm)',   valores: ['83–87', '88–92', '93–97', '98–103'] },
          { nombre: 'Cintura (cm)', valores: ['67–71', '72–76', '77–81', '82–87'] }
        ]
      }
    ]
  };
}
