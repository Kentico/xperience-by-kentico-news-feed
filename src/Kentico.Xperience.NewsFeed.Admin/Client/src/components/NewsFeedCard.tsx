import * as React from 'react';
import { useGlobalization } from '@kentico/xperience-admin-base';

import { LinkButton } from './design-system/Button/LinkButton';
import { Card } from './design-system/Card/Card';
import { Tag } from './design-system/Tag/Tag';
import { TagMode } from './design-system/Tag/Tag.types';

export interface NewsFeedItem {
  heading: string;
  descriptionHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  tags: string[];
  publishedAtUtc?: string;
}

interface NewsFeedCardProps {
  item: NewsFeedItem;
}

export const NewsFeedCard = ({ item }: NewsFeedCardProps) => {
  const { uiLocale } = useGlobalization();

  const publishedDate = React.useMemo(() => {
    if (!item.publishedAtUtc) {
      return null;
    }

    const timestamp = Date.parse(item.publishedAtUtc);
    if (Number.isNaN(timestamp)) {
      return null;
    }

    return new Date(timestamp).toLocaleDateString(uiLocale, {
      dateStyle: 'medium',
    });
  }, [item.publishedAtUtc, uiLocale]);

  return (
    <Card headline={item.heading || 'Untitled update'}>
      {publishedDate ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-low-emphasis)]">
          {publishedDate}
        </p>
      ) : null}

      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map((tag) => (
            <Tag key={tag} label={tag} mode={TagMode.Blue} readOnly />
          ))}
        </div>
      ) : null}

      <div
        className="pnf-richtext"
        // eslint-disable-next-line @typescript-eslint/naming-convention
        dangerouslySetInnerHTML={{ __html: item.descriptionHtml || '' }}
      />

      {item.ctaLabel && item.ctaUrl ? (
        <div className="mt-5">
          <LinkButton
            label={item.ctaLabel}
            href={item.ctaUrl}
            target="_blank"
          />
        </div>
      ) : null}
    </Card>
  );
};
