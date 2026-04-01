import axios from 'axios';
import crypto from 'crypto';
import { SignatureData } from './types';

// Fonction pour générer la signature HMAC requise par l'API v1.1
export const generateSign = (token: string, secret: string): SignatureData => {
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
const sendCommand = async (
  token: string,
  secret: string,
  deviceId: string,
  command: string,
  parameter: string = 'default'
): Promise<{ statusCode: number; body: { message: string } }> => {
  const { sign, t, nonce } = generateSign(token, secret);

  const response = await axios.post(
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

  return response.data;
};

// Fonction pour presser un bot
export const press = async (token: string, secret: string, botId: string): Promise<{ statusCode: number; body: { message: string } }> => {
  console.log('Pression sur le bot:', botId);
  try {
    const res = await sendCommand(token, secret, botId, 'press');
    console.log('✅ Réponse:', res);
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erreur:', error.response?.data || error.message);
    } else {
      console.error('❌ Erreur:', error);
    }
    throw error;
  }
};

// Fonction pour obtenir la liste des appareils
export const getDevices = async (token: string, secret: string): Promise<unknown> => {
  const { sign, t, nonce } = generateSign(token, secret);

  const response = await axios.get('https://api.switch-bot.com/v1.1/devices', {
    headers: {
      'Authorization': token,
      'sign': sign,
      't': t,
      'nonce': nonce,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};
