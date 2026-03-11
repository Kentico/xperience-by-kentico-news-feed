using CMS.Membership;

using Kentico.Xperience.Admin.Base;
using Kentico.Xperience.ProductNewsFeed.Services;

namespace Kentico.Xperience.ProductNewsFeed.Admin;

[UIPermission(SystemPermissions.VIEW)]
[UIPermission(SystemPermissions.UPDATE)]
[UIEvaluatePermission(SystemPermissions.VIEW)]
public class ProductNewsFeedTemplatePage(IProductNewsFeedService productNewsFeedService) : Page<ProductNewsFeedTemplateProperties>
{
    public override Task<ProductNewsFeedTemplateProperties> ConfigureTemplateProperties(ProductNewsFeedTemplateProperties properties) =>
        Task.FromResult(properties);

    [PageCommand(Permission = SystemPermissions.VIEW)]
    public async Task<ICommandResponse<ProductNewsFeedTemplateProperties>> LoadFeed(CancellationToken cancellationToken)
    {
        var result = await productNewsFeedService.GetFeedAsync(forceRefresh: false, cancellationToken);
        var props = BuildTemplateProperties(result);
        var commandResponse = ResponseFrom(props);

        return result.IsSuccess
            ? commandResponse
            : commandResponse.AddErrorMessage(props.StatusMessage);
    }

    [PageCommand(Permission = SystemPermissions.UPDATE)]
    public async Task<ICommandResponse<ProductNewsFeedTemplateProperties>> RefreshFeed(CancellationToken cancellationToken)
    {
        var result = await productNewsFeedService.GetFeedAsync(forceRefresh: true, cancellationToken);
        var response = BuildTemplateProperties(result);

        var commandResponse = ResponseFrom(response);

        if (result.IsSuccess)
        {
            return commandResponse.AddSuccessMessage("News feed refreshed.");
        }

        return commandResponse.AddErrorMessage(response.StatusMessage);
    }

    private static ProductNewsFeedTemplateProperties BuildTemplateProperties(ProductNewsFeedFetchResult result)
    {
        var feed = result.Data;

        return new ProductNewsFeedTemplateProperties
        {
            FeedTitle = feed.FeedTitle,
            FeedShortDescription = feed.FeedShortDescription,
            FeedItems = feed.Items.Select(MapItem).ToArray(),
            LastRetrievedUtc = feed.RetrievedAtUtc.ToString("u"),
            IsEmpty = feed.Items.Count == 0,
            IsFromCache = result.IsFromCache,
            HasError = !result.IsSuccess,
            StatusMessage = result.ErrorMessage ?? string.Empty,
        };
    }

    private static ProductNewsFeedItemClientProperties MapItem(ProductNewsFeedItemData item) => new()
    {
        Heading = item.Heading,
        DescriptionHtml = item.DescriptionHtml,
        CtaLabel = item.CtaLabel,
        CtaUrl = item.CtaUrl,
        Tags = item.Tags,
        PublishedAtUtc = item.PublishedAtUtc,
    };
}

public sealed class ProductNewsFeedTemplateProperties : TemplateClientProperties
{
    public string FeedTitle { get; set; } = string.Empty;

    public string FeedShortDescription { get; set; } = string.Empty;

    public IReadOnlyList<ProductNewsFeedItemClientProperties> FeedItems { get; set; } = [];

    public string LastRetrievedUtc { get; set; } = string.Empty;

    public bool IsEmpty { get; set; }

    public bool IsFromCache { get; set; }

    public bool HasError { get; set; }

    public string StatusMessage { get; set; } = string.Empty;
}

public sealed class ProductNewsFeedItemClientProperties
{
    public string Heading { get; set; } = string.Empty;

    public string DescriptionHtml { get; set; } = string.Empty;

    public string? CtaLabel { get; set; }

    public string? CtaUrl { get; set; }

    public IReadOnlyList<string> Tags { get; set; } = [];

    public DateTimeOffset? PublishedAtUtc { get; set; }
}
