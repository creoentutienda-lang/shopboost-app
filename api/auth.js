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

    const scriptRes = await fetch(`https://api.tiendanube.com/v1/${user_id}/scripts`, {
      method: 'POST',
      headers: {
        'Authentication': `bearer ${access_token}`,
        'User-Agent': 'ShopBoost/1.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script_id: parseInt(process.env.SCRIPT_ID)
      })
    });

    if (!scriptRes.ok) {
      const errBody = await scriptRes.text();
      console.error('Script injection error:', scriptRes.status, errBody);
      return res.status(500).send('Error al instalar el widget en la tienda. Por favor intenta de nuevo.');
    }

    return res.redirect(`${process.env.APP_URL}/admin?store_id=${user_id}`);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).send('Error al instalar ShopBoost. Por favor intenta de nuevo.');
  }
};
