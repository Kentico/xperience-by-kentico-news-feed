namespace Kentico.Xperience.NewsFeed.Services;

public sealed record NewsFeedItemData(
    string Heading,
    string DescriptionHtml,
    string? CtaLabel,
    string? CtaUrl,
    IReadOnlyList<string> Tags,
    DateTimeOffset? PublishedAtUtc);

public sealed record NewsFeedData(
    string FeedTitle,
    string FeedShortDescription,
    IReadOnlyList<NewsFeedItemData> Items,
    DateTimeOffset RetrievedAtUtc);

public sealed record NewsFeedFetchResult(
    NewsFeedData Data,
    bool IsSuccess,
    bool IsFromCache,
    string? ErrorMessage);
