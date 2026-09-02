import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin initialized with service account.");
    } else {
      admin.initializeApp({
        projectId: projectId || "svt-cashew-dev",
      });
      console.log("Firebase Admin initialized with default project config.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
export default admin;
