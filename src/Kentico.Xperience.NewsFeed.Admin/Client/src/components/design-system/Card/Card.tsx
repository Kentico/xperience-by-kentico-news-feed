import * as React from 'react';
import { Children, type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../../lib/cn';
import { BorderRadius, Paper, PaperElevation } from '../Paper/Paper';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardHeadline } from './CardHeadline';
import './Card.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly headline?: string;
  /** Indicates if the card should fill full height of the parent. */
  readonly fullHeight?: boolean;
}

const childrenNotEmpty = (children: ReactNode) => Children.toArray(children).length > 0;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, headline, footer, fullHeight, className, ...props }, ref) => {
    return (
      <Paper
        ref={ref}
        className={cn('Card', fullHeight && 'Card-fullHeight', className)}
        borderRadius={BorderRadius.Large}
        elevation={PaperElevation.Subtle}
        {...props}
      >
        {headline && <CardHeadline text={headline} />}
        {childrenNotEmpty(children) && <CardBody>{children}</CardBody>}
        {footer && <CardFooter>{footer}</CardFooter>}
      </Paper>
    );
  },
);

Card.displayName = 'Card';
