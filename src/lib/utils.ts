// Utility functions for component styling
// Inspired by shadcn/ui's approach to variant-based components

export type VariantProps<T> = {
  variant?: keyof T;
  size?: 'sm' | 'default' | 'lg';
};

/**
 * Merges style objects, with later styles overriding earlier ones
 * Similar to cn() from shadcn/ui but for React Native StyleSheet
 */
export function mergeStyles(...styles: any[]) {
  return styles.filter(Boolean).reduce((acc, style) => {
    if (Array.isArray(style)) {
      return [...acc, ...style];
    }
    return [...acc, style];
  }, []);
}

/**
 * Creates a variant-based style selector
 * Usage: const buttonStyle = createVariantSelector(buttonVariants, { variant: 'primary', size: 'lg' })
 */
export function createVariantSelector<T extends Record<string, any>>(
  variants: T,
  props: VariantProps<T>
): any[] {
  const { variant = 'default', size = 'default' } = props;
  const variantStyles = variants[variant as string] || variants.default || {};
  const sizeStyles = variants.sizes?.[size] || {};
  
  return [variantStyles, sizeStyles].filter(Boolean);
}
