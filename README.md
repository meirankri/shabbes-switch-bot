# 🏠 Shabbes Switch Bot

Système automatique TypeScript pour contrôler vos SwitchBot d'interphone avec séquence Bot2x2+Bot1.

## 🚀 Déploiement sur Vercel (Recommandé)

### 1️⃣ Prérequis

- Compte [Vercel](https://vercel.com)
- Identifiants SwitchBot (voir section ci-dessous)

### 2️⃣ Déployer sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel
```

### 3️⃣ Configurer les variables d'environnement

Dans le dashboard Vercel, allez dans **Settings > Environment Variables** et ajoutez :

- `SWITCHBOT_TOKEN` : Votre token SwitchBot
- `SWITCHBOT_SECRET` : Votre secret SwitchBot
- `BOT_1` : ID du premier bot
- `BOT_2` : ID du second bot
- `CRON_SECRET` : Une chaîne aléatoire sécurisée (générez-la avec `openssl rand -base64 32`)

### 4️⃣ Le Cron Job s'exécute automatiquement

Le cron est configuré pour s'exécuter **toutes les 30 minutes** et vérifie automatiquement l'heure de Paris en temps réel. Si l'heure correspond à un des horaires cibles, la séquence Bot2x2+Bot1 est exécutée.

## 📖 Obtenir vos identifiants SwitchBot

### 1️⃣ Token et Secret

1. Ouvrez l'application **SwitchBot** sur votre téléphone
2. Allez dans **Profile > Preferences > About**
3. Tapez **10 fois** sur "App Version"
4. "Developer Options" apparaîtra
5. Tapez sur **Developer Options** puis **Get Token**
6. Notez votre **Token** et **Secret**

### 2️⃣ Récupérer les IDs de vos SwitchBot

```bash
# Installer les dépendances localement
npm install

# Configurer les identifiants
cp .env.example .env
# Éditez .env et ajoutez votre token et secret

# Lancer le script de test
node test-api.js
```

Vous verrez quelque chose comme :
```
✅ Connexion réussie à l'API SwitchBot!

🤖 SwitchBot Bots trouvés:

Bot 1:
  Nom: Interphone Entrée
  ID: ABC123DEF456
  Type: Bot

Bot 2:
  Nom: Interphone Porte
  ID: GHI789JKL012
  Type: Bot
```

Copiez ces IDs dans vos variables d'environnement Vercel.

## ⏰ Horaires configurés (12 par jour)

### Soir/Nuit
- 22h30, 23h00
- 00h30, 01h00, 01h30, 02h00

### Journée
- 12h00, 12h30, 13h00
- 16h30, 17h00, 17h30

Les horaires sont en **heure de Paris** (Europe/Paris timezone).

⚙️ **Gestion automatique heure été/hiver** : Le système vérifie l'heure de Paris en temps réel avec `date-fns-tz`, aucune modification manuelle nécessaire lors des changements d'heure.

## 🔄 Séquence Bot2x2+Bot1

À chaque horaire cible, la séquence suivante est exécutée :
1. Bot2 appuie (1ère fois)
2. Délai 6 secondes
3. Bot2 appuie (2ème fois)
4. Délai 4 secondes
5. Bot1 appuie

Durée totale : ~10 secondes

## 🔧 Développement local

```bash
# Installer les dépendances
yarn install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos identifiants
nano .env

# Vérifier les types TypeScript
yarn type-check

# Compiler le projet
yarn build

# Tester l'API (script manuel)
node test-api.js

# Afficher les informations du système
node dist/index.js
```

## 📁 Structure des fichiers

### TypeScript (nouveaux fichiers)
- `api/cron.ts` - Endpoint TypeScript pour le Cron Job Vercel
- `lib/switchbot.ts` - Module TypeScript pour l'API SwitchBot v1.1
- `lib/types.ts` - Définitions de types TypeScript
- `index.ts` - Point d'entrée TypeScript
- `tsconfig.json` - Configuration TypeScript

### Configuration & Legacy
- `vercel.json` - Configuration Vercel Cron (toutes les 30 minutes)
- `test-api.js` - Script de test manuel pour récupérer vos appareils
- `switchbot-api.js` - Module JavaScript original (référence)
- `.env` - Vos identifiants locaux (à ne JAMAIS commiter)
- `.env.example` - Template pour les identifiants

## 🔒 Sécurité

- Le fichier `.env` contient vos identifiants secrets et est ignoré par git
- Le `CRON_SECRET` protège l'endpoint contre les appels non autorisés
- Utilisez l'API v1.1 avec authentification HMAC-SHA256

## 🧪 Tester le Cron Job localement

```bash
# Générer un secret temporaire
echo "CRON_SECRET=test-secret-123" >> .env

# Installer vercel CLI
npm i -g vercel

# Lancer le serveur de développement Vercel
vercel dev
```

Puis testez l'endpoint :
```bash
curl -X GET "http://localhost:3000/api/cron" \
  -H "Authorization: Bearer test-secret-123"
```

## 📚 Ressources

- [Documentation API SwitchBot](https://github.com/OpenWonderLabs/SwitchBotAPI)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Comment obtenir un token](https://support.switch-bot.com/hc/en-us/articles/12822710195351-How-to-Obtain-a-Token)

## ⚙️ API v1.1

Ce projet utilise l'**API v1.1** de SwitchBot avec authentification HMAC-SHA256 pour plus de sécurité.

## 🆘 Dépannage

### Le cron ne s'exécute pas

- Vérifiez que toutes les variables d'environnement sont configurées sur Vercel
- Consultez les logs dans le dashboard Vercel : **Deployments > [votre déploiement] > Functions**

### Les bots ne s'activent pas

- Vérifiez que les IDs des bots sont corrects avec `node test-api.js`
- Vérifiez les horaires configurés dans `api/cron.js`
- Assurez-vous que votre timezone est bien Europe/Paris
