const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Tägliche Reminder-Prüfung per Cloud Cronjob (alle 15 Minuten)
 * Prüft Firestore unter fitness/{uid}/settings/push
 */
exports.scheduledPushReminders = functions.pubsub
  .schedule("every 15 minutes")
  .timeZone("Europe/Berlin")
  .onRun(async (context) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${hours}:${minutes}`;

    console.log(`⏰ Push-Check gestartet für Uhrzeit: ${currentTimeStr}`);

    try {
      // 1. Suche in Firestore alle User-Settings mit passender reminderTime
      const snap = await admin
        .firestore()
        .collectionGroup("settings")
        .where("enabled", "==", true)
        .where("reminderTime", "==", currentTimeStr)
        .get();

      if (snap.empty) {
        console.log("Keine aktiven Reminders für diese Uhrzeit gefunden.");
        return null;
      }

      const tokensToSend = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          tokensToSend.push(data.token);
        }
      });

      if (tokensToSend.length === 0) {
        console.log("Keine aktiven FCM-Tokens vorhanden.");
        return null;
      }

      // 2. Multicast-Nachricht an alle registrierten Geräte senden
      const response = await admin.messaging().sendMulticast({
        tokens: tokensToSend,
        notification: {
          title: "VitalOS",
          body: "Zeit für dein tägliches Loggen & Fitness-Check!",
        },
        data: { tab: "habits" },
        android: {
          priority: "high",
          notification: {
            color: "#7e57c2",
          },
        },
      });

      console.log(`✅ Push-Benachrichtigung an ${response.successCount} Geräte erfolgreich versendet.`);
    } catch (err) {
      console.error("❌ Fehler in scheduledPushReminders Function:", err);
    }
    return null;
  });
