import * as React from 'react';

import { usePageCommand } from '@kentico/xperience-admin-base';

import { NewsFeedCard, NewsFeedItem } from '../components/NewsFeedCard';

interface NewsFeedLayoutProps {
  feedTitle: string;
  feedShortDescription: string;
  feedItems: NewsFeedItem[];
  lastRetrievedUtc: string;
  isEmpty: boolean;
  isFromCache: boolean;
  hasError: boolean;
  statusMessage: string;
}

type RefreshFeedResult = NewsFeedLayoutProps;

export const NewsFeedTemplate = (props: NewsFeedLayoutProps) => {
  const [layoutProps, setLayoutProps] =
    React.useState<NewsFeedLayoutProps>(props);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const scrollPaneRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  const getPublishedTimestamp = React.useCallback(
    (item: NewsFeedItem): number | null => {
      if (!item.publishedAtUtc) {
        return null;
      }

      const timestamp = Date.parse(item.publishedAtUtc);
      return Number.isNaN(timestamp) ? null : timestamp;
    },
    [],
  );

  const loadFeed = usePageCommand<RefreshFeedResult>('LoadFeed', {
    after: (result) => {
      if (result) {
        setLayoutProps(result);
      }

      setIsLoading(false);
    },
  });

  const refreshFeed = usePageCommand<RefreshFeedResult>('RefreshFeed', {
    after: (result) => {
      if (result) {
        setLayoutProps(result);
      }

      setIsRefreshing(false);
    },
  });

  const handleRefreshClick = React.useCallback(async () => {
    setIsRefreshing(true);

    await refreshFeed.execute();
  }, [refreshFeed]);

  const handleTocItemClick = React.useCallback((index: number) => {
    const target = itemRefs.current[index];
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  React.useEffect(() => {
    void loadFeed.execute();
  }, []);

  const items = layoutProps.feedItems ?? [];

  const sortedItems = React.useMemo(
    () =>
      [...items].sort((a, b) => {
        const aTime = getPublishedTimestamp(a);
        const bTime = getPublishedTimestamp(b);

        if (aTime === null && bTime === null) {
          return 0;
        }

        if (aTime === null) {
          return 1;
        }

        if (bTime === null) {
          return -1;
        }

        return bTime - aTime;
      }),
    [items, getPublishedTimestamp],
  );

  const tocGroups = React.useMemo(() => {
    const groups: Array<{
      label: string;
      entries: Array<{ item: NewsFeedItem; index: number }>;
    }> = [];

    sortedItems.forEach((item, index) => {
      const publishedTimestamp = getPublishedTimestamp(item);
      const label = publishedTimestamp
        ? new Date(publishedTimestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
          })
        : 'Older';

      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.entries.push({ item, index });
      } else {
        groups.push({
          label,
          entries: [{ item, index }],
        });
      }
    });

    return groups;
  }, [sortedItems, getPublishedTimestamp]);

  return (
    <main className="pnf-stage flex h-full flex-col overflow-hidden p-4 md:p-8">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
        {isLoading ? (
          <section className="rounded-xl border border-dashed border-[hsl(var(--pnf-border))] bg-[hsl(var(--card))] px-5 py-12 text-center shadow-[inset_0_0_0_1px_hsl(var(--pnf-shadow-soft))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Loading feed...
            </p>
          </section>
        ) : (
          <>
            {layoutProps.hasError ? (
              <section className="rounded-xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
                {layoutProps.statusMessage || 'Feed loading failed.'}
              </section>
            ) : null}

            <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="flex min-h-0 flex-col gap-4 rounded-xl border border-[hsl(var(--pnf-border))] bg-[hsl(var(--card))] p-4">
                <div className="space-y-2 pb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--pnf-accent))]">
                    News Feed
                  </p>
                  <h2 className="font-[var(--pnf-heading-font)] text-2xl leading-tight text-[hsl(var(--foreground))]">
                    {layoutProps.feedTitle}
                  </h2>
                  {layoutProps.feedShortDescription ? (
                    <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                      {layoutProps.feedShortDescription}
                    </p>
                  ) : null}
                </div>

                <h2 className="font-[var(--pnf-heading-font)] text-lg text-[hsl(var(--foreground))]">
                  Contents
                </h2>
                <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {tocGroups.length > 0 ? (
                    tocGroups.map((group) => (
                      <div key={group.label} className="space-y-2">
                        <h3 className="border-b border-[hsl(var(--pnf-border))] pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">
                          {group.label}
                        </h3>

                        {group.entries.map(({ item, index }) => (
                          <button
                            key={`toc-${item.heading}-${index}`}
                            type="button"
                            className="w-full rounded-md border border-[hsl(var(--pnf-border))] bg-[hsl(var(--card))] px-3 py-2 text-left transition-colors duration-200 hover:border-[hsl(var(--pnf-accent))] hover:bg-[hsl(var(--pnf-accent)/0.08)]"
                            onClick={() => handleTocItemClick(index)}
                          >
                            <span className="block text-sm font-semibold text-[hsl(var(--foreground))]">
                              {item.heading || 'Untitled update'}
                            </span>
                            {item.publishedAtUtc ? (
                              <span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">
                                {new Date(
                                  item.publishedAtUtc,
                                ).toLocaleDateString(undefined, {
                                  dateStyle: 'medium',
                                })}
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-md border border-dashed border-[hsl(var(--pnf-border))] px-3 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      No items available.
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-3 border-t border-[hsl(var(--pnf-border))] pt-3">
                  <button
                    type="button"
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--pnf-accent))] bg-transparent px-4 py-2 text-sm font-semibold text-[hsl(var(--pnf-accent-strong))] transition-colors duration-200 hover:bg-[hsl(var(--pnf-accent))] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleRefreshClick}
                    disabled={isLoading || isRefreshing}
                  >
                    {isLoading || isRefreshing
                      ? 'Refreshing...'
                      : 'Refresh feed'}
                  </button>

                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    Last updated:{' '}
                    {layoutProps.lastRetrievedUtc
                      ? new Date(layoutProps.lastRetrievedUtc).toLocaleString(
                          undefined,
                          {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          },
                        )
                      : 'Not available'}
                  </p>
                </div>
              </aside>

              <section className="flex min-h-0 flex-col rounded-xl border border-[hsl(var(--pnf-border))] bg-[hsl(var(--pnf-surface))] p-3 md:p-4">
                <div
                  ref={scrollPaneRef}
                  className="h-full space-y-5 overflow-y-auto pr-1 md:pr-2"
                >
                  {tocGroups.length > 0 ? (
                    tocGroups.map((group) => (
                      <div key={`pane-${group.label}`} className="space-y-3">
                        <h3 className="sticky top-0 z-10 border-b border-[hsl(var(--pnf-border))] bg-[hsl(var(--pnf-surface))]/95 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] backdrop-blur-sm">
                          {group.label}
                        </h3>

                        <div className="space-y-4">
                          {group.entries.map(({ item, index }) => (
                            <div
                              key={`${item.heading}-${index}`}
                              ref={(element) => {
                                itemRefs.current[index] = element;
                              }}
                              className="pnf-stagger-item scroll-mt-6"
                            >
                              <NewsFeedCard item={item} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <section className="rounded-xl border border-dashed border-[hsl(var(--pnf-border))] bg-[hsl(var(--card))] px-5 py-12 text-center shadow-[inset_0_0_0_1px_hsl(var(--pnf-shadow-soft))]">
                      <h2 className="font-[var(--pnf-heading-font)] text-2xl text-[hsl(var(--foreground))]">
                        No feed items yet
                      </h2>
                      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                        Trigger a refresh to try loading new content from the
                        community feed.
                      </p>
                    </section>
                  )}
                </div>
              </section>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default NewsFeedTemplate;
