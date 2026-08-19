export const Variant = {
  Filled: 'Filled',
  Outlined: 'Outlined',
  Text: 'Text',
} as const;

export type VariantType = typeof Variant[keyof typeof Variant];
