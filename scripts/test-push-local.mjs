import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Pfad zum Service Account Key aus der Firebase Console
// (Firebase Console -> Project Settings -> Service Accounts -> Generate new private key)
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';

try {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase Admin SDK erfolgreich initialisiert.');

  async function sendTestPush(targetToken) {
    if (!targetToken) {
      console.error('❌ Bitte gib einen FCM Token an!');
      console.log('Usage: node scripts/test-push-local.mjs "DEIN_FCM_TOKEN"');
      process.exit(1);
    }

    const message = {
      token: targetToken,
      notification: {
        title: 'VitalOS (Local Dev Test)',
        body: 'Test-Push-Benachrichtigung von deinem lokalen Server!',
      },
      data: {
        tab: 'habits'
      },
      android: {
        priority: 'high',
        notification: {
          color: '#7e57c2',
        }
      }
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('🚀 Push-Benachrichtigung erfolgreich gesendet! ID:', response);
    } catch (error) {
      console.error('❌ Fehler beim Senden:', error);
    }
  }

  const tokenFromArgs = process.argv[2];
  sendTestPush(tokenFromArgs);

} catch (e) {
  console.error(`❌ Konnte ${SERVICE_ACCOUNT_PATH} nicht finden oder lesen.`);
  console.log('Bitte lade deinen Service Account Key aus der Firebase Console herunter und speichere ihn als serviceAccountKey.json im Repo-Root.');
}
