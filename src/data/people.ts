/**
 * PEOPLE — every name on the site that should open an Instagram profile.
 * Key = name exactly as it appears (case-insensitive). Value = Instagram handle
 * without "@". Leave a value empty ("") until you know it: the name then opens an
 * Instagram search for it instead of a profile.
 */
export const INSTAGRAM: Record<string, string> = {
  GRUVINK: "gruvink",
  "SPICY BOYS": "spicyboys.gvk",
  IZIAL: "",
  "DBØ": "",
  AVRAXAS: "",
  "CHAMÓX": "",
  NANDES: "",
  "4R15": "",
  "POL VERDÉS": "",
  "ALBERT VERYN": "",
  ROUXXE: "",
  MEDINA: "",
  BRANDO: "",
};

/** Instagram URL for a name (profile if known, otherwise a search). */
export function igUrl(name: string) {
  const key = Object.keys(INSTAGRAM).find((k) => k.toUpperCase() === name.trim().toUpperCase());
  const handle = key ? INSTAGRAM[key] : "";
  return handle
    ? `https://www.instagram.com/${handle}/`
    : `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name.trim())}`;
}

/** "AVRAXAS B2B DBØ" → ["AVRAXAS", "DBØ"] */
export function splitNames(s: string) {
  return s
    .replace(/\(.*?\)/g, "")
    .split(/\s+B2B\s+|\s*[×x&,]\s+/i)
    .map((n) => n.trim())
    .filter(Boolean);
}
