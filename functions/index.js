/**
 
Import function triggers from their respective submodules:*
const {onCall} = require("firebase-functions/v2/https");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");*
See a full list of supported triggers at https://firebase.google.com/docs/functions*/

const functions = require("firebase-functions");
const {setGlobalOptions} = functions;
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const DISCORD_API_BASE = "https://discord.com/api/v10";
const { defineSecret } = require("firebase-functions/params");
const DISCORD_BOT_TOKEN = defineSecret("DISCORD_BOT_TOKEN");

setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

async function sendDiscordDM(discordUserId, message) {
  const dmRes = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: discordUserId }),
  });

  if (!dmRes.ok) {
    const txt = await dmRes.text();
    logger.error("Failed to create DM channel", dmRes.status, txt);
    throw new Error("Failed to create DM channel");
  }

  const dmChannel = await dmRes.json();

  const msgRes = await fetch(
    `${DISCORD_API_BASE}/channels/${dmChannel.id}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    }
  );

  if (!msgRes.ok) {
    const txt = await msgRes.text();
    logger.error("Failed to send DM", msgRes.status, txt);
    throw new Error("Failed to send DM");
  }

  logger.info(`DM sent to Discord user ${discordUserId}`);
}

exports.sendTestDiscordDM = onRequest(
  { secrets: [DISCORD_BOT_TOKEN] },
  async (req, res) => {
    try {
      const usersSnap = await db.collection("users").get();

      if (usersSnap.empty) {
        res.status(200).send("No users found.");
        return;
      }

      const tasks = [];

      usersSnap.forEach((userDoc) => {
        const userData = userDoc.data();

        if (userData.discordNotificationsEnabled === false) return;
        if (!userData.discordUserId) return;

        const message =
          "Test message from ACMappings: your Discord notification is working.";

        tasks.push(
          (async () => {
            try {
              await sendDiscordDM(userData.discordUserId, message);
            } catch (err) {
              logger.error(err);
            }
          })()
        );
      });

      await Promise.all(tasks);
      res.status(200).send("Test DMs sent.");

    } catch (err) {
      logger.error(err);
      res.status(500).send("Error sending test DMs.");
    }
  }
);