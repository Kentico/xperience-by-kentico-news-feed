namespace Kentico.Xperience.ProductNewsFeed.Services;

public sealed record ProductNewsFeedItemData(
    string Heading,
    string DescriptionHtml,
    string? CtaLabel,
    string? CtaUrl,
    IReadOnlyList<string> Tags,
    DateTimeOffset? PublishedAtUtc);

public sealed record ProductNewsFeedData(
    string FeedTitle,
    string FeedShortDescription,
    IReadOnlyList<ProductNewsFeedItemData> Items,
    DateTimeOffset RetrievedAtUtc);

public sealed record ProductNewsFeedFetchResult(
    ProductNewsFeedData Data,
    bool IsSuccess,
    bool IsFromCache,
    string? ErrorMessage);
