import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from './button-variants';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

/** Renders a real <button> (default; supports type="submit", onClick, disabled). */
type ButtonAsButton = BaseProps & { href?: undefined; external?: never } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof BaseProps
  >;

/** Renders a Next <Link> (internal) or plain <a> when external. */
type ButtonAsLink = BaseProps & { href: string; external?: boolean } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof BaseProps | 'href'
  >;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Shared call-to-action button. One AA-compliant surface for every CTA so a
 * single token change (button-variants.ts) re-skins the whole site.
 *
 * Polymorphic: pass `href` to render a link, omit it for a <button>.
 */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, fullWidth, className, children, href, external, ...rest } =
      props;
    const cls = buttonClasses({ variant, size, fullWidth, className });
    if (external) {
      return (
        <a href={href} className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant, size, fullWidth, className, children, ...rest } = props;
  const cls = buttonClasses({ variant, size, fullWidth, className });
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export default Button;
