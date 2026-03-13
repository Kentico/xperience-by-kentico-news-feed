import * as React from 'react';

import { cn } from '../../../lib/cn';
import { TagMode, type TagProps } from './Tag.types';
import './Tag.css';

export const Tag = ({ label, mode = TagMode.Light, className }: TagProps) => {
  const modeClass =
    mode === TagMode.Dark
      ? 'Tag-dark'
      : mode === TagMode.Blue
        ? 'Tag-blue'
        : 'Tag-light';

  return <span className={cn('Tag', modeClass, className)}>{label}</span>;
};
