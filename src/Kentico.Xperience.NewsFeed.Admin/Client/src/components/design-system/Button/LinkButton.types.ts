import type { AnchorHTMLAttributes, ReactNode } from 'react';

import type { ButtonColor, ButtonSize } from './Button.types';

export interface LinkButtonProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'color' | 'children'
> {
  readonly label?: string;
  readonly children?: ReactNode;
  readonly color?: ButtonColor;
  readonly size?: ButtonSize;
  readonly destructive?: boolean;
  readonly inProgress?: boolean;
  readonly fillContainer?: boolean;
  readonly icon?: ReactNode;
  readonly trailingIcon?: ReactNode;
  readonly disabled?: boolean;
}
