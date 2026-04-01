import type { VercelRequest, VercelResponse } from '@vercel/node';
import { utcToZonedTime } from 'date-fns-tz';
import { press } from '../lib/switchbot';

// Fonction de délai
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Tolérance en minutes (±5 minutes autour de chaque horaire cible)
const TOLERANCE_MINUTES = 5;

// Horaires cibles (heure de Paris)
const TARGET_SCHEDULES = [
  { hour: 22, minute: 30 },
  { hour: 23, minute: 0 },
  { hour: 0, minute: 30 },
  { hour: 1, minute: 0 },
  { hour: 1, minute: 30 },
  { hour: 2, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 12, minute: 30 },
  { hour: 13, minute: 0 },
  { hour: 16, minute: 30 },
  { hour: 17, minute: 0 },
  { hour: 17, minute: 30 },
];

// Fonction pour vérifier si l'heure actuelle est dans la fenêtre de tolérance
const isWithinTolerance = (currentHour: number, currentMinute: number, targetHour: number, targetMinute: number): boolean => {
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const targetTotalMinutes = targetHour * 60 + targetMinute;
  const diff = Math.abs(currentTotalMinutes - targetTotalMinutes);

  // Gérer le cas de minuit (0h)
  const diffAcrossMidnight = Math.abs(currentTotalMinutes - (targetTotalMinutes + 24 * 60));
  const diffAcrossMidnight2 = Math.abs((currentTotalMinutes + 24 * 60) - targetTotalMinutes);

  return diff <= TOLERANCE_MINUTES || diffAcrossMidnight <= TOLERANCE_MINUTES || diffAcrossMidnight2 <= TOLERANCE_MINUTES;
};

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

    // Obtenir l'heure actuelle à Paris
    const now = new Date();
    const parisTime = utcToZonedTime(now, 'Europe/Paris');
    const currentHour = parisTime.getHours();
    const currentMinute = parisTime.getMinutes();

    // Vérifier si l'heure actuelle est dans la fenêtre de tolérance d'un horaire cible
    const matchingSchedule = TARGET_SCHEDULES.find(
      schedule => isWithinTolerance(currentHour, currentMinute, schedule.hour, schedule.minute)
    );

    if (!matchingSchedule) {
      res.status(200).json({
        skipped: true,
        parisTime: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
        message: `Not within ±${TOLERANCE_MINUTES} minutes of any target schedule`,
      });
      return;
    }

    // Exécuter la séquence Bot2x2+Bot1 (réutilisation de testBot2TwiceThenBot1)
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
      parisTime: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
      targetSchedule: `${matchingSchedule.hour.toString().padStart(2, '0')}:${matchingSchedule.minute.toString().padStart(2, '0')}`,
      sequence: 'Bot2x2+Bot1',
      message: 'Sequence completed successfully',
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
