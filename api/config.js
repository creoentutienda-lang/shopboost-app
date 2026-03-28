const fs = require('fs');
const path = require('path');

const DB_PATH = path.join('/tmp', 'shopboost-configs.json');

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch(e) {}
  return {};
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const storeId = req.query.store || 'default';

  if (req.method === 'GET') {
    const db = readDB();
    const config = db[storeId] || getDefaultConfig();
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const db = readDB();
    db[storeId] = req.body;
    writeDB(db);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
};

function getDefaultConfig() {
  return {
    active: true,
    textos: {
      btnPrincipal: "Encontrá tu talle",
      btnSecundario: "Tabla de talles",
      titulo: "Encontra tu talle",
      subtitulo: "Ingresa tus medidas y te decimos que talle elegir",
      btnCalcular: "Calcular mi talle",
      btnCerrar: "Entendido"
    },
    categorias: [
      {
        id: "calza",
        nombre: "Calzas",
        talles: ["XS", "S", "M", "L", "XL"],
        medidas: [
          { nombre: "Cintura (cm)", valores: ["60–64", "65–69", "70–75", "76–82", "83–90"] },
          { nombre: "Cadera (cm)", valores: ["86–90", "91–95", "96–101", "102–108", "109–116"] }
        ]
      },
      {
        id: "remeras",
        nombre: "Remeras / Tops",
        talles: ["S / 38", "M / 40", "L / 42", "XL / 44"],
        medidas: [
          { nombre: "Busto (cm)", valores: ["83–87", "88–92", "93–97", "98–103"] },
          { nombre: "Cintura (cm)", valores: ["67–71", "72–76", "77–81", "82–87"] }
        ]
      }
    ]
  };
}
