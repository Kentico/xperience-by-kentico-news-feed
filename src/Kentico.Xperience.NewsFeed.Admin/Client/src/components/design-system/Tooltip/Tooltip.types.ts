import type { ReactNode } from 'react';

export interface TooltipProps {
  readonly text: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly delayMs?: number;
}
