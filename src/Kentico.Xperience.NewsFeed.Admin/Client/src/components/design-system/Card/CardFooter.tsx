import * as React from 'react';
import { type ReactNode, forwardRef } from 'react';
import { getDataAndAccessibilityProps } from '../../../lib/getDataAndAccessibilityProps';
import './CardFooter.css';

export interface CardFooterProps {
  readonly children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className={'CardFooter'} {...getDataAndAccessibilityProps(props)}>
        {children}
      </div>
    );
  },
);

CardFooter.displayName = 'CardFooter';
