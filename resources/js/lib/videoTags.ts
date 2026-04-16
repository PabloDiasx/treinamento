export const VIDEO_TAG_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "forca", label: "Força" },
  { value: "hit", label: "Hit" },
  { value: "cardio", label: "Cardio" },
  { value: "alongamento", label: "Alongamento" },
  { value: "sport", label: "Sport" },
] as const

export type VideoTag = (typeof VIDEO_TAG_OPTIONS)[number]["value"]
