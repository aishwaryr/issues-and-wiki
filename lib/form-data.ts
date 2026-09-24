// formData.get gives string | File | null — coerce, so a missing field fails the schema's
// own rules instead of zod's "expected string, received null".
export function readForm<K extends string>(
  formData: FormData,
  keys: readonly K[],
): Record<K, string> {
  return Object.fromEntries(
    keys.map((key) => [key, String(formData.get(key) ?? "")]),
  ) as Record<K, string>;
}
