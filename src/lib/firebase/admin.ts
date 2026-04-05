import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const hasAdminConfig = Boolean(projectId && clientEmail && privateKey);

const app = hasAdminConfig
    ? getApps().length
        ? getApp()
        : initializeApp({
              credential: cert({
                  projectId,
                  clientEmail,
                  privateKey,
              }),
          })
    : null;

export const adminApp = app;
export const adminFirestore = app ? getFirestore(app) : null;
export const adminMessaging = app ? getMessaging(app) : null;
export const isFirebaseAdminConfigured = hasAdminConfig;
