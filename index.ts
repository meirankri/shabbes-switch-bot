import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

console.log('🤖 SwitchBot Automation System');
console.log('================================');
console.log('');
console.log('Ce système utilise Vercel Cron pour l\'automatisation.');
console.log('');
console.log('📅 Horaires configurés (heure de Paris):');
console.log('  - Soir/Nuit: 22h30, 23h00, 00h30, 01h00, 01h30, 02h00');
console.log('  - Journée: 12h00, 12h30, 13h00, 16h30, 17h00, 17h30');
console.log('');
console.log('🔄 Séquence: Bot2x2+Bot1');
console.log('  1. Bot2 appuie (1ère fois)');
console.log('  2. Délai 6 secondes');
console.log('  3. Bot2 appuie (2ème fois)');
console.log('  4. Délai 4 secondes');
console.log('  5. Bot1 appuie');
console.log('');
console.log('ℹ️  Pas de boucle locale - tout est géré par Vercel Cron');
console.log('ℹ️  Endpoint: /api/cron');
console.log('');
