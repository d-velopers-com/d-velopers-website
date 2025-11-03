export type Locale = "en" | "es";

export interface Translations {
  [key: string]: string | Translations;
}
