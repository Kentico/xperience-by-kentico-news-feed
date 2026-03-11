using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

using Kentico.Xperience.ProductNewsFeed.Services;

using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace DancingGoat.Services;

public sealed class ProductNewsFeedGraphqlService : IProductNewsFeedService
{
    private const string RefreshFailedMessage = "We couldn't load the latest news right now. Please try refreshing again.";
    private const string FeedUnavailableMessage = "The news feed is currently unavailable.";
    private const string CacheKey = "product-news-feed::community-links::default";

    private readonly ProductNewsFeedOptions options;
    private readonly HttpClient httpClient;
    private readonly IMemoryCache cache;

    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public ProductNewsFeedGraphqlService(
        IOptions<ProductNewsFeedOptions> options,
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache)
    {
        this.options = options.Value;
        httpClient = httpClientFactory.CreateClient(ProductNewsFeedOptions.HttpClientName);
        this.cache = cache;
    }

    public async Task<ProductNewsFeedFetchResult> GetFeedAsync(bool forceRefresh, CancellationToken cancellationToken)
    {
        if (forceRefresh)
        {
            cache.Remove(CacheKey);
        }

        if (cache.TryGetValue(CacheKey, out ProductNewsFeedData? cachedFeed) && (cachedFeed is not null))
        {
            return new ProductNewsFeedFetchResult(cachedFeed, IsSuccess: true, IsFromCache: true, ErrorMessage: null);
        }

        try
        {
            var result = await FetchRemoteFeedAsync(cancellationToken);
            if (result.IsSuccess)
            {
                cache.Set(CacheKey, result.Data, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(options.CacheDurationMinutes),
                });
            }

            return result;
        }
        catch (Exception)
        {
            ProductNewsFeedData fallbackData = new(
                FeedTitle: "Product News Feed",
                FeedShortDescription: string.Empty,
                Items: [],
                RetrievedAtUtc: DateTimeOffset.UtcNow);

            return new ProductNewsFeedFetchResult(
                fallbackData,
                IsSuccess: false,
                IsFromCache: false,
                ErrorMessage: RefreshFailedMessage);
        }
    }

    private async Task<ProductNewsFeedFetchResult> FetchRemoteFeedAsync(CancellationToken cancellationToken)
    {
        using HttpRequestMessage request = new(HttpMethod.Post, options.EndpointUrl)
        {
            Content = new StringContent(CreateQueryPayload(), Encoding.UTF8, "application/json"),
        };

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.BearerToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            ProductNewsFeedData fallbackData = new(
                FeedTitle: "Product News Feed",
                FeedShortDescription: string.Empty,
                Items: [],
                RetrievedAtUtc: DateTimeOffset.UtcNow);

            return new ProductNewsFeedFetchResult(
                fallbackData,
                IsSuccess: false,
                IsFromCache: false,
                ErrorMessage: RefreshFailedMessage);
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var graphResponse = await JsonSerializer.DeserializeAsync<GraphqlResponse>(stream, jsonOptions, cancellationToken);

        if (graphResponse is null)
        {
            ProductNewsFeedData fallbackData = new(
                FeedTitle: "Product News Feed",
                FeedShortDescription: string.Empty,
                Items: [],
                RetrievedAtUtc: DateTimeOffset.UtcNow);

            return new ProductNewsFeedFetchResult(
                fallbackData,
                IsSuccess: false,
                IsFromCache: false,
                ErrorMessage: RefreshFailedMessage);
        }

        if ((graphResponse.Errors is not null) && (graphResponse.Errors.Count > 0))
        {
            ProductNewsFeedData fallbackData = new(
                FeedTitle: "Product News Feed",
                FeedShortDescription: string.Empty,
                Items: [],
                RetrievedAtUtc: DateTimeOffset.UtcNow);

            return new ProductNewsFeedFetchResult(
                fallbackData,
                IsSuccess: false,
                IsFromCache: false,
                ErrorMessage: RefreshFailedMessage);
        }

        var feed = graphResponse.Data?.DancingGoatProductNewsFeedHeadlessItem;
        if (feed is null)
        {
            ProductNewsFeedData fallbackData = new(
                FeedTitle: "Product News Feed",
                FeedShortDescription: string.Empty,
                Items: [],
                RetrievedAtUtc: DateTimeOffset.UtcNow);

            return new ProductNewsFeedFetchResult(
                fallbackData,
                IsSuccess: false,
                IsFromCache: false,
                ErrorMessage: FeedUnavailableMessage);
        }

        IReadOnlyList<ProductNewsFeedItemData> items = [.. (feed.ProductNewsFeedHeadlessItemNewsItemContents?.Items ?? Enumerable.Empty<DancingGoatNewsItemContentResponse>())
            .Select(item => new ProductNewsFeedItemData(
                Heading: item.NewsItemContentTitle ?? string.Empty,
                DescriptionHtml: item.NewsItemContentDescriptionHtml ?? string.Empty,
                CtaLabel: item.NewsItemContentCtaLabel,
                CtaUrl: item.NewsItemContentCtaLinkUrl,
                Tags: [.. (item.NewsItemContentTags ?? Enumerable.Empty<TagResponse>())
                    .Select(tag => tag.Title ?? tag.Name ?? string.Empty)
                    .Where(tag => !string.IsNullOrWhiteSpace(tag))],
                PublishedAtUtc: item.NewsItemContentPublishedDate))];

        var previewItems = options.IncludePreviewItems
            ? BuildPreviewItems()
            : [];

        ProductNewsFeedData data = new(
            FeedTitle: feed.ProductNewsFeedHeadlessItemTitle ?? "Product News Feed",
            FeedShortDescription: feed.ProductNewsFeedHeadlessItemDescription ?? string.Empty,
            Items: [.. items, .. previewItems],
            RetrievedAtUtc: DateTimeOffset.UtcNow);

        return new ProductNewsFeedFetchResult(data, IsSuccess: true, IsFromCache: false, ErrorMessage: null);
    }

    private IReadOnlyList<ProductNewsFeedItemData> BuildPreviewItems()
    {
        var now = DateTimeOffset.UtcNow;

        return [.. Enumerable.Range(1, options.PreviewItemCount)
            .Select(index =>
            {
                // Spread mock publish dates across the configured preview window.
                int monthOffset = (index - 1) % options.PreviewWindowMonths;
                var publishedAt = now.AddMonths(-monthOffset).AddDays(-(index % 7));

                return new ProductNewsFeedItemData(
                    Heading: $"Preview release update {index}",
                    DescriptionHtml: $"<p>This is synthetic preview content item {index} used to validate ToC grouping and scrolling behavior.</p>",
                    CtaLabel: null,
                    CtaUrl: null,
                    Tags: ["Preview", "UX Validation"],
                    PublishedAtUtc: publishedAt);
            })];
    }

    private string CreateQueryPayload()
    {
        const string query = @"
query ProductNewsFeed($feedId: UUID!) {
    dancingGoatProductNewsFeedHeadlessItem(id: $feedId) {
        productNewsFeedHeadlessItemTitle
        productNewsFeedHeadlessItemDescription
        productNewsFeedHeadlessItemNewsItemContents(sort: { newsItemContentPublishedDate: DESC }) {
            items {
                newsItemContentTitle
                newsItemContentDescriptionHTML
                newsItemContentPublishedDate
                newsItemContentCTALabel
                newsItemContentCTALinkURL
                newsItemContentTags {
                    name
                    title
                }
            }
        }
    }
}
";

        return JsonSerializer.Serialize(new
        {
            query,
            variables = new
            {
                feedId = options.FeedItemId,
            },
        });
    }

    private sealed class GraphqlResponse
    {
        [JsonPropertyName("data")]
        public GraphqlData? Data { get; set; }

        [JsonPropertyName("errors")]
        public List<GraphqlError>? Errors { get; set; }
    }

    private sealed class GraphqlData
    {
        [JsonPropertyName("dancingGoatProductNewsFeedHeadlessItem")]
        public DancingGoatProductNewsFeedHeadlessItemResponse? DancingGoatProductNewsFeedHeadlessItem { get; set; }
    }

    private sealed class GraphqlError
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
    }

    private sealed class DancingGoatProductNewsFeedHeadlessItemResponse
    {
        [JsonPropertyName("productNewsFeedHeadlessItemTitle")]
        public string? ProductNewsFeedHeadlessItemTitle { get; set; }

        [JsonPropertyName("productNewsFeedHeadlessItemDescription")]
        public string? ProductNewsFeedHeadlessItemDescription { get; set; }

        [JsonPropertyName("productNewsFeedHeadlessItemNewsItemContents")]
        public NewsItemContentCollectionResponse? ProductNewsFeedHeadlessItemNewsItemContents { get; set; }
    }

    private sealed class NewsItemContentCollectionResponse
    {
        [JsonPropertyName("items")]
        public List<DancingGoatNewsItemContentResponse>? Items { get; set; }
    }

    private sealed class DancingGoatNewsItemContentResponse
    {
        [JsonPropertyName("newsItemContentTitle")]
        public string? NewsItemContentTitle { get; set; }

        [JsonPropertyName("newsItemContentDescriptionHTML")]
        public string? NewsItemContentDescriptionHtml { get; set; }

        [JsonPropertyName("newsItemContentPublishedDate")]
        public DateTimeOffset? NewsItemContentPublishedDate { get; set; }

        [JsonPropertyName("newsItemContentCTALabel")]
        public string? NewsItemContentCtaLabel { get; set; }

        [JsonPropertyName("newsItemContentCTALinkURL")]
        public string? NewsItemContentCtaLinkUrl { get; set; }

        [JsonPropertyName("newsItemContentTags")]
        public List<TagResponse>? NewsItemContentTags { get; set; }
    }

    private sealed class TagResponse
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }
    }
}
