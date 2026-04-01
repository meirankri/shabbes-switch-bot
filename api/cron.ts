import type { VercelRequest, VercelResponse } from '@vercel/node';
import { press, PressResult } from '../lib/switchbot';

// Fonction de délai
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface StepLog {
  step: number;
  action: string;
  result?: PressResult;
  duration?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const startTime = Date.now();
  const logs: StepLog[] = [];

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
      res.status(500).json({ error: 'Missing environment variables', provided: { token: !!token, secret: !!secret, bot1: !!bot1, bot2: !!bot2 } });
      return;
    }

    console.log('🤖 Début de la séquence Bot2x2+Bot1');
    console.log(`[Config] BOT_1=${bot1}, BOT_2=${bot2}`);

    // Step 1: Bot2 - 1ère fois
    let stepStart = Date.now();
    const result1 = await press(token, secret, bot2);
    logs.push({ step: 1, action: `press bot2 (${bot2})`, result: result1, duration: Date.now() - stepStart });

    // Step 2: Attendre 6 secondes
    stepStart = Date.now();
    console.log('[Séquence] Attente 6 secondes...');
    await delay(6000);
    logs.push({ step: 2, action: 'delay 6s', duration: Date.now() - stepStart });

    // Step 3: Bot2 - 2ème fois
    stepStart = Date.now();
    const result2 = await press(token, secret, bot2);
    logs.push({ step: 3, action: `press bot2 (${bot2})`, result: result2, duration: Date.now() - stepStart });

    // Step 4: Attendre 4 secondes
    stepStart = Date.now();
    console.log('[Séquence] Attente 4 secondes...');
    await delay(4000);
    logs.push({ step: 4, action: 'delay 4s', duration: Date.now() - stepStart });

    // Step 5: Bot1 - finale
    stepStart = Date.now();
    const result3 = await press(token, secret, bot1);
    logs.push({ step: 5, action: `press bot1 (${bot1})`, result: result3, duration: Date.now() - stepStart });

    const totalDuration = Date.now() - startTime;
    const allSuccess = result1.success && result2.success && result3.success;

    console.log(`✅ Séquence terminée en ${totalDuration}ms - Succès: ${allSuccess}`);

    res.status(200).json({
      success: allSuccess,
      sequence: 'Bot2x2+Bot1',
      totalDuration: `${totalDuration}ms`,
      timestamp: new Date().toISOString(),
      steps: logs,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ Erreur lors de l\'exécution du cron:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Execution failed',
      details: errorMessage,
      totalDuration: `${totalDuration}ms`,
      steps: logs,
    });
  }
}
