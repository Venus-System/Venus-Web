import { guardar, ler } from "./armazenamento";

export const AVATARES = [
  "vinho",
  "noite",
  "violeta",
  "framboesa",
  "lavanda",
  "prata",
  "aurora",
  "ametista",
  "marca",
] as const;

export type Avatar = (typeof AVATARES)[number];

export const AVATAR_PADRAO: Avatar = "vinho";

const CHAVE_AVATAR = "venus.avatar";

function ehAvatar(valor: unknown): valor is Avatar {
  return (
    typeof valor === "string" && AVATARES.some((avatar) => avatar === valor)
  );
}

export function lerAvatar(): Avatar {
  return ler(CHAVE_AVATAR, ehAvatar) ?? AVATAR_PADRAO;
}

export function guardarAvatar(avatar: Avatar): void {
  guardar(CHAVE_AVATAR, avatar);
}
