export const CHARACTERS = {
  fox: { emoji: "🦊", vi: "Cáo", zh: "狐狸", note: "Thông minh, tò mò" },
  rabbit: { emoji: "🐰", vi: "Thỏ", zh: "兔子", note: "Nhanh nhẹn, vui vẻ" },
  panda: { emoji: "🐼", vi: "Gấu trúc", zh: "熊猫", note: "Điềm tĩnh, chăm chỉ" },
} as const;

export type CharacterType = keyof typeof CHARACTERS;

export function isCharacterType(v: string): v is CharacterType {
  return v in CHARACTERS;
}
