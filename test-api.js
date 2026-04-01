const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const { token, secret, bot1, bot2 } = process.env;

// Fonction pour générer la signature HMAC pour l'API v1.1
const generateSign = (token, secret) => {
  const t = Date.now();
  const nonce = crypto.randomUUID();
  const data = token + t + nonce;
  const signToByte = crypto.createHmac("sha256", secret).update(data).digest();
  const sign = signToByte.toString("base64");

  return {
    sign,
    t: t.toString(),
    nonce,
  };
};

// Récupérer la liste de tous vos appareils SwitchBot
const getDevices = async () => {
  try {
    if (!token || !secret) {
      console.error("❌ Erreur: token ou secret manquant dans le fichier .env");
      console.log("\n📝 Instructions:");
      console.log("1. Copiez .env.example vers .env");
      console.log("2. Ouvrez l'app SwitchBot");
      console.log("3. Profile > Preferences > About");
      console.log('4. Tapez 10 fois sur "App Version"');
      console.log("5. Developer Options > Get Token");
      console.log("6. Copiez le token et secret dans .env\n");
      return;
    }

    const { sign, t, nonce } = generateSign(token, secret);

    const response = await axios.get(
      "https://api.switch-bot.com/v1.1/devices",
      {
        headers: {
          Authorization: token,
          sign: sign,
          t: t,
          nonce: nonce,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("\n✅ Connexion réussie à l'API SwitchBot!\n");
    console.log("📱 Vos appareils:");
    console.log(JSON.stringify(response.data, null, 2));

    // Afficher tous les appareils physiques
    if (response.data.body && response.data.body.deviceList) {
      console.log("\n📋 Tous les appareils:");
      response.data.body.deviceList.forEach((device, index) => {
        console.log(`\nAppareil ${index + 1}:`);
        console.log(`  Nom: ${device.deviceName}`);
        console.log(`  ID: ${device.deviceId}`);
        console.log(`  Type: ${device.deviceType}`);
        if (device.hubDeviceId) {
          console.log(`  Hub: ${device.hubDeviceId}`);
        }
      });

      // Filtrer spécifiquement les Bots
      const bots = response.data.body.deviceList.filter(
        (device) => device.deviceType === "Bot",
      );
      if (bots.length > 0) {
        console.log("\n🤖 SwitchBot Bots trouvés:");
        bots.forEach((bot, index) => {
          console.log(`\nBot ${index + 1}:`);
          console.log(`  Nom: ${bot.deviceName}`);
          console.log(`  ID: ${bot.deviceId}`);
          console.log(`  Copiez cet ID dans bot${index + 1}= dans votre .env`);
        });
      } else {
        console.log("\n⚠️  Aucun Bot trouvé dans deviceList");
        console.log(
          "💡 Vos bots sont peut-être connectés en Bluetooth au Hub Mini",
        );
        console.log("💡 Vérifiez dans l'app SwitchBot que:");
        console.log("   1. Les bots sont bien connectés au Hub Mini");
        console.log("   2. Le Cloud Service est activé pour chaque bot");
        console.log(
          "   3. Les bots ont été ajoutés via le Hub (et pas en direct Bluetooth)",
        );
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des appareils:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

// Fonction pour presser un bot
const pressBot = async (botId, botName) => {
  try {
    console.log(`\n🔘 Activation du ${botName} (${botId})...`);
    const { sign, t, nonce } = generateSign(token, secret);

    const response = await axios.post(
      `https://api.switch-bot.com/v1.1/devices/${botId}/commands`,
      {
        command: "press",
        parameter: "default",
        commandType: "command",
      },
      {
        headers: {
          Authorization: token,
          sign: sign,
          t: t,
          nonce: nonce,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`✅ ${botName} activé avec succès!`);
    console.log("   Réponse:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de l'activation du ${botName}:`);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    } else {
      console.error("   ", error.message);
    }
  }
};

// Fonction pour tester les deux bots
const testBots = async () => {
  if (!bot1 || !bot2) {
    console.log("\n⚠️  Les IDs des bots ne sont pas configurés dans .env");
    console.log("💡 Ajoutez bot1= et bot2= dans votre fichier .env");
    return;
  }

  console.log("\n🧪 === TEST D'ACTIVATION DES BOTS ===");

  // Activer bot1
  await pressBot(bot1, "Bot 1");

  // Attendre 5 secondes
  console.log("\n⏳ Attente de 5 secondes...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Activer bot2
  await pressBot(bot2, "Bot 2");

  console.log("\n✅ Test terminé!");
};

// Fonction pour lancer Bot2 deux fois puis Bot1
const testBot2TwiceThenBot1 = async () => {
  if (!bot1 || !bot2) {
    console.log("\n⚠️  Les IDs des bots ne sont pas configurés dans .env");
    console.log("💡 Ajoutez bot1= et bot2= dans votre fichier .env");
    return;
  }

  console.log("\n🧪 === TEST BOT2 x2 PUIS BOT1 ===");

  // Activer bot2 première fois
  await pressBot(bot2, "Bot 2 (1ère fois)");

  // Attendre 2 secondes
  console.log("\n⏳ Attente de 6 secondes...");
  await new Promise((resolve) => setTimeout(resolve, 6000));

  // Activer bot2 deuxième fois
  await pressBot(bot2, "Bot 2 (2ème fois)");

  // Attendre 2 secondes
  console.log("\n⏳ Attente de 4 secondes...");
  await new Promise((resolve) => setTimeout(resolve, 4000));

  // Activer bot1
  await pressBot(bot1, "Bot 1");

  console.log("\n✅ Test terminé!");
};

// Exécuter le script
(async () => {
  await getDevices();
  await testBot2TwiceThenBot1();
})();
