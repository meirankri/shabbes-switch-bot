const axios = require('axios');
const crypto = require('crypto');

// Fonction pour générer la signature HMAC requise par l'API v1.1
const generateSign = (token, secret) => {
  const t = Date.now();
  const nonce = crypto.randomUUID();
  const data = token + t + nonce;
  const signToByte = crypto.createHmac('sha256', secret).update(data).digest();
  const sign = signToByte.toString('base64');

  return {
    sign,
    t: t.toString(),
    nonce,
  };
};

// Fonction pour envoyer une commande à un SwitchBot
const sendCommand = async (token, secret, deviceId, command, parameter = 'default') => {
  const {sign, t, nonce} = generateSign(token, secret);

  return axios.post(
    `https://api.switch-bot.com/v1.1/devices/${deviceId}/commands`,
    {
      command,
      parameter,
      commandType: 'command',
    },
    {
      headers: {
        'Authorization': token,
        'sign': sign,
        't': t,
        'nonce': nonce,
        'Content-Type': 'application/json',
      },
    },
  );
};

// Fonction pour presser un bot
const press = async (token, secret, botId) => {
  console.log('Pression sur le bot:', botId);
  try {
    const res = await sendCommand(token, secret, botId, 'press');
    console.log('✅ Réponse:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour obtenir la liste des appareils
const getDevices = async (token, secret) => {
  const {sign, t, nonce} = generateSign(token, secret);

  return axios.get('https://api.switch-bot.com/v1.1/devices', {
    headers: {
      'Authorization': token,
      'sign': sign,
      't': t,
      'nonce': nonce,
      'Content-Type': 'application/json',
    },
  });
};

module.exports = {
  generateSign,
  sendCommand,
  press,
  getDevices,
};
