import * as React from 'react';
import { type HTMLAttributes, forwardRef } from 'react';
import './Icon.css';

export type IconSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Icon name with xp- prefix (e.g., "xp-home") or without (e.g., "home") */
  name: string;
  /** Icon size - maps to CSS custom properties */
  size?: IconSize;
  /** Additional CSS class */
  className?: string;
}

/**
 * Icon component that renders SVG icons using CSS mask-image.
 * Icons use currentColor for fill, inheriting color from parent.
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 'm', className, style, ...props }, ref) => {
    const stripped = name.startsWith('xp-') ? name.slice(3) : name;
    const iconPath = stripped.startsWith('flag-')
      ? `flags/${stripped.slice(5)}`
      : stripped;

    const sizeClasses: Record<IconSize, string> = {
      xxs: 'Icon-sizeXxs',
      xs: 'Icon-sizeXs',
      s: 'Icon-sizeS',
      m: 'Icon-sizeM',
      l: 'Icon-sizeL',
      xl: 'Icon-sizeXl',
      xxl: 'Icon-sizeXxl',
    };

    const classes = ['Icon', sizeClasses[size], className]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        ref={ref}
        className={classes}
        style={{
          ...style,
          maskImage: `url(/icons/${iconPath}.svg)`,
          WebkitMaskImage: `url(/icons/${iconPath}.svg)`,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

Icon.displayName = 'Icon';
