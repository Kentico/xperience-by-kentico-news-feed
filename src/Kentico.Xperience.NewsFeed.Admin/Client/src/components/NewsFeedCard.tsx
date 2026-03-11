import * as React from 'react';

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
    <article className="group rounded-xl border border-[hsl(var(--pnf-border))] bg-[hsl(var(--card))] p-5 shadow-[0_14px_32px_hsl(var(--pnf-shadow-soft))] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_40px_hsl(var(--pnf-shadow))]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[var(--pnf-heading-font)] text-xl leading-tight text-[hsl(var(--foreground))]">
          {item.heading || 'Untitled update'}
        </h2>
      </div>

      {item.tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-[hsl(var(--pnf-border))] bg-[hsl(var(--pnf-surface-subtle))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <div
        className="pnf-richtext mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]"
        // eslint-disable-next-line @typescript-eslint/naming-convention
        dangerouslySetInnerHTML={{ __html: item.descriptionHtml || '' }}
      />

      {item.ctaLabel && item.ctaUrl ? (
        <div className="mt-5">
          <a
            href={item.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-[hsl(var(--pnf-accent))] bg-transparent px-3 py-2 text-sm font-semibold text-[hsl(var(--pnf-accent-strong))] transition-colors duration-200 hover:bg-[hsl(var(--pnf-accent))] hover:text-white"
          >
            {item.ctaLabel}
          </a>
        </div>
      ) : null}
    </article>
  );
};
