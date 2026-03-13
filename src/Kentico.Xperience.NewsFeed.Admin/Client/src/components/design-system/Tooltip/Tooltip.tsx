import * as React from 'react';
import type { CSSProperties } from 'react';

import { cn } from '../../../lib/cn';
import type { TooltipProps } from './Tooltip.types';
import './Tooltip.css';

export const Tooltip = ({
  text,
  children,
  className,
  delayMs = 500,
}: TooltipProps) => {
  if (!text) {
    return <>{children}</>;
  }

  return (
    <span
      className={cn('Tooltip', className)}
      style={{ '--tooltip-show-delay': `${delayMs}ms` } as CSSProperties}
    >
      {children}
      <span className="Tooltip-content" role="tooltip" aria-hidden="true">
        {text}
      </span>
    </span>
  );
};
