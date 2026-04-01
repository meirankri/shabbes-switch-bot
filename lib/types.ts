export interface SwitchBotCredentials {
  token: string;
  secret: string;
}

export interface BotIds {
  bot1: string;
  bot2: string;
}

export interface SignatureData {
  sign: string;
  t: string;
  nonce: string;
}

export interface PressResponse {
  statusCode: number;
  body: {
    message: string;
  };
}
