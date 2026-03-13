import * as React from 'react';

import { cn } from '../../../lib/cn';
import type { MenuItemProps } from './MenuItem.types';
import './MenuItem.css';

export const MenuItem = ({
  primaryLabel,
  secondaryLabel,
  selected,
  disabled,
  className,
  onClick,
}: MenuItemProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'MenuItem',
        selected && 'MenuItem-selected',
        disabled && 'MenuItem-disabled',
        className,
      )}
    >
      <span className="MenuItem-body">
        <span
          className={cn(
            'MenuItem-primaryLabel',
            secondaryLabel && 'MenuItem-bottomSpacing',
          )}
        >
          {primaryLabel}
        </span>
        {secondaryLabel ? (
          <span className="MenuItem-secondaryLabel">{secondaryLabel}</span>
        ) : null}
      </span>
    </button>
  );
};
