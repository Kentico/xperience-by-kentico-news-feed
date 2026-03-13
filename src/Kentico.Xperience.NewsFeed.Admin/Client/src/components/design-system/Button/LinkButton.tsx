import * as React from 'react';
import { type ReactNode } from 'react';

import { cn } from '../../../lib/cn';
import { Icon, type IconSize } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';
import { ButtonColor, ButtonSize } from './Button.types';
import type { LinkButtonProps } from './LinkButton.types';

const renderIcon = (icon: ReactNode, size?: IconSize): ReactNode => {
  if (typeof icon === 'string') {
    return size ? <Icon name={icon} size={size} /> : <Icon name={icon} />;
  }
  return icon;
};

const getRel = (target: string | undefined, rel: string | undefined) => {
  if (target !== '_blank') {
    return rel;
  }

  const relParts = new Set((rel ?? '').split(' ').filter(Boolean));
  relParts.add('noopener');
  relParts.add('noreferrer');
  return Array.from(relParts).join(' ');
};

export const LinkButton = ({
  label,
  children,
  color = ButtonColor.Secondary,
  size = ButtonSize.M,
  destructive,
  inProgress,
  fillContainer,
  icon,
  trailingIcon,
  className,
  disabled,
  href,
  rel,
  target,
  ...props
}: LinkButtonProps) => {
  const isDisabled = disabled || inProgress || !href;
  const content = children ?? label;
  const iconSize: IconSize | undefined =
    color === ButtonColor.Quinary ? 's' : undefined;

  const classNames = cn(
    'Button',
    `Button-${color}`,
    `Button-${size}`,
    destructive && 'Button-destructive',
    !content && Boolean(icon || trailingIcon) && 'Button-iconOnly',
    fillContainer && 'Button-fillContainer',
    className,
  );

  const body = (
    <>
      {inProgress ? (
        <span className="Button-icon">
          <Spinner size="small" />
        </span>
      ) : icon ? (
        <span className="Button-icon">{renderIcon(icon, iconSize)}</span>
      ) : null}
      {content}
      {!inProgress && trailingIcon ? (
        <span className="Button-icon">
          {renderIcon(trailingIcon, iconSize)}
        </span>
      ) : null}
    </>
  );

  if (isDisabled) {
    return (
      <div className={classNames} role="link" aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={target}
      rel={getRel(target, rel)}
      className={classNames}
      {...props}
    >
      {body}
    </a>
  );
};
