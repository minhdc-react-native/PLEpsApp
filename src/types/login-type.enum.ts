export const LOGIN_TYPES = {
  EPS: 0,
  NON_EPS: 1,
  EXTERNAL: 2,
} as const;

export type LoginType = (typeof LOGIN_TYPES)[keyof typeof LOGIN_TYPES];

// Texts displayed UI
export const LOGIN_TYPE_LABELS: Record<LoginType, string> = {
  [LOGIN_TYPES.EPS]: "EPS",
  [LOGIN_TYPES.NON_EPS]: "NON EPS",
  [LOGIN_TYPES.EXTERNAL]: "Bên Ngoài",
};
