export const SnackBarState = {
  Error: "ERROR",
  Success: "SUCCESS",
  Warning: "WARNING",
  Info: "INFO"
} as const;

export type SnackBarType = typeof SnackBarState[keyof typeof SnackBarState];

export interface SnackBarMessage {
  id: string;
  message: string;
  type: SnackBarType;
  duration?: number
}
