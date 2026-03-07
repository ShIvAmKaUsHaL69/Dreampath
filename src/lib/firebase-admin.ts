let adminInstance: any = null;

export function getFirebaseAdmin() {
  if (adminInstance) return adminInstance;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin SDK not configured. Push notifications disabled.');
    return null;
  }

  try {
    // Dynamic import to avoid issues when Firebase is not configured
    const admin = require('firebase-admin');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }
    adminInstance = admin;
    return admin;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}
