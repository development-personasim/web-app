type Dictionary = Record<string, unknown>;

function getByPath(dictionary: Dictionary, key: string) {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Dictionary)[part];
    }
    return undefined;
  }, dictionary);
}

export function createT(dictionary: Dictionary) {
  return function t(
    key: string,
    vars?: Record<string, string | number>,
  ): string {
    const value = getByPath(dictionary, key);
    if (typeof value !== "string") {
      return key;
    }

    if (!vars) {
      return value;
    }

    return Object.entries(vars).reduce(
      (result, [name, replacement]) =>
        result.replaceAll(`{${name}}`, String(replacement)),
      value,
    );
  };
}

export type Translate = ReturnType<typeof createT>;
