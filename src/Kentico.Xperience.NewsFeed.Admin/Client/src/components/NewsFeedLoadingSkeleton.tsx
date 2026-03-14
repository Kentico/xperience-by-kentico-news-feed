import * as React from 'react';

import {
  BorderRadius,
  Paper,
  PaperElevation,
} from './design-system/Paper/Paper';

const NewsFeedSidebarSkeletonPanel = () => {
  return (
    <Paper
      bordered
      borderRadius={BorderRadius.Large}
      elevation={PaperElevation.None}
      className="flex min-h-0 flex-col gap-4 p-4"
    >
      <div className="space-y-3 pb-3">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--pnf-border)]" />
        <div className="h-8 w-4/5 animate-pulse rounded bg-[var(--pnf-border)]" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--pnf-border)]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--pnf-border)]" />
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-hidden pr-1">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={`toc-skeleton-${index}`}
            className="space-y-2 rounded-md border border-[var(--pnf-border)] px-3 py-3"
          >
            <div className="h-4 w-[85%] animate-pulse rounded bg-[var(--pnf-border)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--pnf-border)]" />
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3 border-t border-[var(--pnf-border)] pt-3">
        <div className="h-8 w-full animate-pulse rounded bg-[var(--pnf-border)]" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-[var(--pnf-border)]" />
      </div>
    </Paper>
  );
};

const NewsFeedItemsSkeletonPanel = () => {
  return (
    <Paper
      bordered
      borderRadius={BorderRadius.Large}
      elevation={PaperElevation.None}
      className="flex min-h-0 flex-col p-3 md:p-4"
    >
      <div className="h-full space-y-5 overflow-hidden pr-1 md:pr-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={`feed-skeleton-${index}`}
            className="space-y-3 rounded-lg border border-[var(--pnf-border)] p-4"
          >
            <div className="h-3 w-32 animate-pulse rounded bg-[var(--pnf-border)]" />
            <div className="h-6 w-11/12 animate-pulse rounded bg-[var(--pnf-border)]" />
            <div className="h-4 w-full animate-pulse rounded bg-[var(--pnf-border)]" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-[var(--pnf-border)]" />
          </div>
        ))}
      </div>
    </Paper>
  );
};

export const NewsFeedLoadingSkeleton = () => {
  return (
    <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[390px_minmax(0,1fr)]">
      <NewsFeedSidebarSkeletonPanel />
      <NewsFeedItemsSkeletonPanel />
    </section>
  );
};
