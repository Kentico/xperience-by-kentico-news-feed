import * as React from 'react';

import { Headline, HeadlineSize } from '@kentico/xperience-admin-components';

interface ProductNewsFeedHeaderProps {
  feedTitle: string;
  feedShortDescription: string;
}

export const ProductNewsFeedHeader = ({
  feedTitle,
  feedShortDescription,
}: ProductNewsFeedHeaderProps) => {
  return (
    <header className="rounded-xl border border-[hsl(var(--pnf-border))] bg-[hsl(var(--card))] p-4">
      <div className="space-y-2">
        <Headline size={HeadlineSize.M}>{feedTitle}</Headline>
        {feedShortDescription ? (
          <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            {feedShortDescription}
          </p>
        ) : null}
      </div>
    </header>
  );
};
