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

interface SwitchBotApiResponse {
  statusCode: number;
  body: Record<string, unknown>;
  message: string;
}

// Fonction pour envoyer une commande à un SwitchBot
const sendCommand = async (
  token: string,
  secret: string,
  deviceId: string,
  command: string,
  parameter: string = 'default'
): Promise<SwitchBotApiResponse> => {
  const { sign, t, nonce } = generateSign(token, secret);

  const url = `https://api.switch-bot.com/v1.1/devices/${deviceId}/commands`;
  console.log(`[SwitchBot] POST ${url}`);
  console.log(`[SwitchBot] Command: ${command}, Parameter: ${parameter}`);

  const response = await axios.post(
    url,
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

export interface PressResult {
  botId: string;
  statusCode: number;
  message: string;
  success: boolean;
  timestamp: string;
}

// Fonction pour presser un bot
export const press = async (token: string, secret: string, botId: string): Promise<PressResult> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Pression sur le bot: ${botId}`);
  try {
    const res = await sendCommand(token, secret, botId, 'press');
    const isSuccess = res.statusCode === 100;
    const logPrefix = isSuccess ? '✅' : '⚠️';
    console.log(`[${timestamp}] ${logPrefix} Bot ${botId} - statusCode: ${res.statusCode}, message: ${res.message}`);
    console.log(`[${timestamp}] Réponse complète:`, JSON.stringify(res));
    return {
      botId,
      statusCode: res.statusCode,
      message: res.message,
      success: isSuccess,
      timestamp,
    };
  } catch (error) {
    const errorTimestamp = new Date().toISOString();
    if (axios.isAxiosError(error)) {
      console.error(`[${errorTimestamp}] ❌ Bot ${botId} - Erreur HTTP ${error.response?.status}:`, JSON.stringify(error.response?.data));
      return {
        botId,
        statusCode: error.response?.status ?? 0,
        message: error.response?.data?.message ?? error.message,
        success: false,
        timestamp: errorTimestamp,
      };
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${errorTimestamp}] ❌ Bot ${botId} - Erreur:`, errorMessage);
    return {
      botId,
      statusCode: 0,
      message: errorMessage,
      success: false,
      timestamp: errorTimestamp,
    };
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
