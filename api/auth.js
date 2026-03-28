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
    const tokenData = await tokenRes.json();
    const { access_token, user_id } = tokenData;
    if (!access_token || !user_id) return res.status(500).send('Error al conectar con Tiendanube');
    await fetch(`https://api.tiendanube.com/v1/${user_id}/scripts`, {
      method: 'POST',
      headers: {
        'Authentication': `bearer ${access_token}`,
        'User-Agent': 'ShopBoost (creoentutienda@gmail.com)',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        src: `${process.env.APP_URL}/shopboost.js`,
        event: 'onload',
        where: 'store'
      })
    });
    return res.redirect(`${process.env.APP_URL}?instalado=true&tienda=${user_id}`);
  } catch (error) {
    return res.status(500).send('Error al instalar ShopBoost. Por favor intenta de nuevo.');
  }
};
