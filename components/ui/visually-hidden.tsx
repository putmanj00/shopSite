import React, { ElementType, ComponentPropsWithoutRef } from 'react';

type VisuallyHiddenProps<T extends ElementType = 'span'> = {
    children: React.ReactNode;
    as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

/**
 * Visually Hidden component
 * Hides content visually but keeps it accessible to screen readers
 * Use for providing additional context to assistive technologies
 *
 * @example
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Close menu</VisuallyHidden>
 * </button>
 */
export function VisuallyHidden<T extends ElementType = 'span'>({
    children,
    as,
    ...props
}: VisuallyHiddenProps<T>) {
    const Component = as || 'span';
    return (
        <Component className="sr-only" {...props}>
            {children}
        </Component>
    );
}

export default VisuallyHidden;
