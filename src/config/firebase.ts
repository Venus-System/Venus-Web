import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

const configuracao = {
  apiKey: texto(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: texto(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: texto(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: texto(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: texto(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: texto(import.meta.env.VITE_FIREBASE_APP_ID),
};

const ESSENCIAIS = [
  configuracao.apiKey,
  configuracao.authDomain,
  configuracao.projectId,
];

export const FIREBASE_ATIVO = ESSENCIAIS.every((valor) => valor !== "");

export const autenticacaoFirebase: Auth | null = FIREBASE_ATIVO
  ? getAuth(initializeApp(configuracao))
  : null;
