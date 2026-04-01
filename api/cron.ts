import type { VercelRequest, VercelResponse } from '@vercel/node';
import { press } from '../lib/switchbot';

// Fonction de délai
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    // Vérification authentification
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      res.status(500).json({ error: 'CRON_SECRET not configured' });
      return;
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Vérification variables environnement
    const token = process.env.SWITCHBOT_TOKEN;
    const secret = process.env.SWITCHBOT_SECRET;
    const bot1 = process.env.BOT_1;
    const bot2 = process.env.BOT_2;

    if (!token || !secret || !bot1 || !bot2) {
      res.status(500).json({ error: 'Missing environment variables' });
      return;
    }

    // Exécuter la séquence Bot2x2+Bot1
    console.log('🤖 Début de la séquence Bot2x2+Bot1');

    // Bot2 - 1ère fois
    await press(token, secret, bot2);

    // Attendre 6 secondes
    await delay(6000);

    // Bot2 - 2ème fois
    await press(token, secret, bot2);

    // Attendre 4 secondes
    await delay(4000);

    // Bot1 - finale
    await press(token, secret, bot1);

    console.log('✅ Séquence Bot2x2+Bot1 terminée');

    res.status(200).json({
      success: true,
      sequence: 'Bot2x2+Bot1',
      message: 'Sequence completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du cron:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Execution failed',
      details: errorMessage,
    });
  }
}
