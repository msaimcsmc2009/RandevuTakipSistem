const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function slugify(input: string): string {
  const replaced = input
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("");

  return replaced
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function generateUniqueSlug(
  supabase: any,
  base: string
): Promise<string> {
  const root = slugify(base) || "isletme";

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  return `${root}-${Date.now()}`;
}
