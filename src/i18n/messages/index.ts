import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ptBR } from "./pt-BR";

export const messages = {
  en,
  "pt-BR": ptBR,
  es,
  fr,
} as const;

export type MessageKey = keyof typeof en;
export type Messages = typeof en;
