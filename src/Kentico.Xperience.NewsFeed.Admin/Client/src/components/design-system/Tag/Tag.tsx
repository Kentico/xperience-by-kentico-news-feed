import * as React from 'react';

import { cn } from '../../../lib/cn';
import { TagMode, type TagProps } from './Tag.types';
import './Tag.css';

export const Tag = ({ label, mode = TagMode.Light, className }: TagProps) => {
  return (
    <span
      className={cn(
        'Tag',
        mode === TagMode.Dark ? 'Tag-dark' : 'Tag-light',
        className,
      )}
    >
      {label}
    </span>
  );
};
