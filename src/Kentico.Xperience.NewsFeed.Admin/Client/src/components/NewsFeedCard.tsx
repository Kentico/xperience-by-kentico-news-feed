import * as React from 'react';

import { LinkButton } from './design-system/Button/LinkButton';
import { Card } from './design-system/Card/Card';
import { Tag } from './design-system/Tag/Tag';

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
  return (
    <Card headline={item.heading || 'Untitled update'}>
      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map((tag) => (
            <Tag key={tag} label={tag} readOnly />
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
