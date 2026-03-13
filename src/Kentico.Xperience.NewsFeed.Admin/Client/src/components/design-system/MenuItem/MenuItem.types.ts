import type { MouseEventHandler } from 'react';

export interface MenuItemProps {
  readonly primaryLabel: string;
  readonly secondaryLabel?: string;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
}
