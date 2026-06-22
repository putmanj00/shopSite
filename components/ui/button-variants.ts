/**
 * Pure class-string builder for the shared <Button> component.
 *
 * Kept JSX/React-free so it can be unit-checked in isolation
 * (see scripts/button-variants.test.ts) and reused by any element.
 *
 * Surface colors are WCAG 2.1 AA compliant against white/cream labels:
 *   primary  = primary-600 (#b05523) on white  -> ~5.0:1  (PASS, normal text)
 *   outline  = primary-700 (#8f441c) text       -> link-grade contrast
 *   secondary= forest (#1E3B30) on cream        -> high contrast
 * Do NOT use bg-terracotta/primary-500 (#C8642A, ~3.9:1) for button surfaces.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ' +
  'active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-forest text-cream hover:bg-forest/90',
  outline: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2',
};

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ButtonClassOptions = {}): string {
  return [BASE, VARIANTS[variant], SIZES[size], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');
}
