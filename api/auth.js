module.exports = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/');

  try {
    const tokenRes = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code
      })
    });

    if (!tokenRes.ok) {
      console.error('Token error:', tokenRes.status, await tokenRes.text());
      return res.status(500).send('Error al obtener el token de Tiendanube. Por favor intenta de nuevo.');
    }

    const tokenData = await tokenRes.json();
    const { access_token, user_id } = tokenData;

    if (!access_token || !user_id) {
      console.error('Token data inválido:', tokenData);
      return res.status(500).send('Error al conectar con Tiendanube. Respuesta inesperada.');
    }

    // El script se instala automáticamente via Tiendanube (instalación automática activada en Partners)
    const appUrl = process.env.APP_URL || 'https://shopboost-app-clvz.vercel.app';
    return res.redirect(`${appUrl}/admin?store_id=${user_id}`);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).send('Error al instalar ShopBoost. Por favor intenta de nuevo.');
  }
};
