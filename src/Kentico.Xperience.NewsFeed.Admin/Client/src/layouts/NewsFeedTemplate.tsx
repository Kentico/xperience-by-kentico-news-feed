import * as React from 'react';

import {
  useGlobalization,
  usePageCommand,
} from '@kentico/xperience-admin-base';

import {
  Button,
  ButtonColor,
  ButtonSize,
} from '../components/design-system/Button/Button';
import { MenuItem } from '../components/design-system/MenuItem';
import { NotificationBarAlert } from '../components/design-system/NotificationBar/NotificationBar';
import {
  BorderRadius,
  Paper,
  PaperElevation,
} from '../components/design-system/Paper/Paper';
import { Spinner } from '../components/design-system/Spinner/Spinner';
import { NewsFeedCard, type NewsFeedItem } from '../components/NewsFeedCard';

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
  const { uiLocale } = useGlobalization();
  const [layoutProps, setLayoutProps] =
    React.useState<NewsFeedLayoutProps>(props);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [activeTocIndex, setActiveTocIndex] = React.useState<number | null>(
    null,
  );
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
    setActiveTocIndex(index);

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
        ? new Date(publishedTimestamp).toLocaleDateString(uiLocale, {
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
  }, [sortedItems, getPublishedTimestamp, uiLocale]);

  return (
    <main className="pnf-stage flex h-full flex-col overflow-hidden p-4 md:p-8">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="large" />
          </div>
        ) : (
          <>
            {layoutProps.hasError ? (
              <NotificationBarAlert noBoldWeight>
                {layoutProps.statusMessage || 'Feed loading failed.'}
              </NotificationBarAlert>
            ) : null}

            <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[390px_minmax(0,1fr)]">
              {/* Sidebar — table of contents + refresh */}
              <Paper
                bordered
                borderRadius={BorderRadius.Large}
                elevation={PaperElevation.None}
                className="flex min-h-0 flex-col gap-4 p-4"
              >
                <div className="space-y-2 pb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pnf-accent)]">
                    News Feed
                  </p>
                  <h2 className="font-[var(--pnf-heading-font)] text-2xl font-bold leading-tight text-[var(--color-text-default-on-light)]">
                    {layoutProps.feedTitle}
                  </h2>
                  {layoutProps.feedShortDescription ? (
                    <p className="text-sm leading-7 text-[var(--color-text-low-emphasis)]">
                      {layoutProps.feedShortDescription}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {tocGroups.length > 0 ? (
                    tocGroups.map((group) => (
                      <div key={group.label} className="space-y-3">
                        <h3 className="border-b border-[var(--pnf-border)] pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-low-emphasis)]">
                          {group.label}
                        </h3>

                        <div className="pnf-toc-entries">
                          {group.entries.map(({ item, index }) => (
                            <MenuItem
                              key={`toc-${item.heading}-${index}`}
                              primaryLabel={item.heading || 'Untitled update'}
                              secondaryLabel={
                                item.publishedAtUtc
                                  ? new Date(
                                      item.publishedAtUtc,
                                    ).toLocaleDateString(uiLocale, {
                                      dateStyle: 'medium',
                                    })
                                  : undefined
                              }
                              selected={activeTocIndex === index}
                              onClick={() => handleTocItemClick(index)}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-md border border-dashed border-[var(--pnf-border)] px-3 py-4 text-sm text-[var(--color-text-low-emphasis)]">
                      No items available.
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-3 border-t border-[var(--pnf-border)] pt-3">
                  <Button
                    color={ButtonColor.Secondary}
                    size={ButtonSize.XS}
                    fillContainer
                    inProgress={isRefreshing}
                    disabled={isLoading || isRefreshing}
                    onClick={handleRefreshClick}
                  >
                    Refresh feed
                  </Button>

                  <p className="mt-2 text-xs text-[var(--color-text-low-emphasis)]">
                    Last updated:{' '}
                    {layoutProps.lastRetrievedUtc
                      ? new Date(layoutProps.lastRetrievedUtc).toLocaleString(
                          uiLocale,
                          {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          },
                        )
                      : 'Not available'}
                  </p>
                </div>
              </Paper>

              {/* Main scroll pane — grouped feed items */}
              <Paper
                bordered
                borderRadius={BorderRadius.Large}
                elevation={PaperElevation.None}
                className="flex min-h-0 flex-col p-3 md:p-4"
              >
                <div
                  ref={scrollPaneRef}
                  className="h-full space-y-5 overflow-y-auto pr-1 md:pr-2"
                >
                  {tocGroups.length > 0 ? (
                    tocGroups.map((group) => (
                      <div key={`pane-${group.label}`} className="space-y-3">
                        <h3 className="sticky top-0 z-10 border-b border-[var(--pnf-border)] bg-[var(--color-paper-background)] pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-low-emphasis)] backdrop-blur-sm">
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
                    <section className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--pnf-border)] bg-[var(--color-paper-background)] px-5 py-12 text-center">
                      <div>
                        <h2 className="font-[var(--pnf-heading-font)] text-2xl text-[var(--color-text-default-on-light)]">
                          No feed items yet
                        </h2>
                        <p className="mt-2 text-sm text-[var(--color-text-low-emphasis)]">
                          Trigger a refresh to try loading new content from the
                          community feed.
                        </p>
                      </div>
                    </section>
                  )}
                </div>
              </Paper>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default NewsFeedTemplate;
