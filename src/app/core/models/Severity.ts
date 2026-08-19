export const Severity = {
  Fatal: 'Fatal',
  Error: 'Error',
  Warning: 'Warning',
  Info: 'Info',
  Success: 'Success',
} as const;

export type SeverityType = typeof Severity[keyof typeof Severity];
