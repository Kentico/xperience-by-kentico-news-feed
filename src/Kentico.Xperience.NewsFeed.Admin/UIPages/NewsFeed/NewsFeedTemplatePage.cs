using CMS.Membership;

using Kentico.Xperience.Admin.Base;
using Kentico.Xperience.NewsFeed.Services;

namespace Kentico.Xperience.NewsFeed.Admin;

[UIPermission(SystemPermissions.VIEW)]
[UIPermission(SystemPermissions.UPDATE)]
[UIEvaluatePermission(SystemPermissions.VIEW)]
public class NewsFeedTemplatePage(INewsFeedService newsFeedService) : Page<NewsFeedTemplateProperties>
{
    public override Task<NewsFeedTemplateProperties> ConfigureTemplateProperties(NewsFeedTemplateProperties properties) =>
        Task.FromResult(properties);

    [PageCommand(Permission = SystemPermissions.VIEW)]
    public async Task<ICommandResponse<NewsFeedTemplateProperties>> LoadFeed(CancellationToken cancellationToken)
    {
        var result = await newsFeedService.GetFeedAsync(forceRefresh: false, cancellationToken);
        var props = BuildTemplateProperties(result);
        var commandResponse = ResponseFrom(props);

        return result.IsSuccess
            ? commandResponse
            : commandResponse.AddErrorMessage(props.StatusMessage);
    }

    [PageCommand(Permission = SystemPermissions.UPDATE)]
    public async Task<ICommandResponse<NewsFeedTemplateProperties>> RefreshFeed(CancellationToken cancellationToken)
    {
        var result = await newsFeedService.GetFeedAsync(forceRefresh: true, cancellationToken);
        var response = BuildTemplateProperties(result);

        var commandResponse = ResponseFrom(response);

        if (result.IsSuccess)
        {
            return commandResponse.AddSuccessMessage("News feed refreshed.");
        }

        return commandResponse.AddErrorMessage(response.StatusMessage);
    }

    private static NewsFeedTemplateProperties BuildTemplateProperties(NewsFeedFetchResult result)
    {
        var feed = result.Data;

        return new NewsFeedTemplateProperties
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

    private static NewsFeedItemClientProperties MapItem(NewsFeedItemData item) => new()
    {
        Heading = item.Heading,
        DescriptionHtml = item.DescriptionHtml,
        CtaLabel = item.CtaLabel,
        CtaUrl = item.CtaUrl,
        Tags = item.Tags,
        PublishedAtUtc = item.PublishedAtUtc,
    };
}

public sealed class NewsFeedTemplateProperties : TemplateClientProperties
{
    public string FeedTitle { get; set; } = string.Empty;

    public string FeedShortDescription { get; set; } = string.Empty;

    public IReadOnlyList<NewsFeedItemClientProperties> FeedItems { get; set; } = [];

    public string LastRetrievedUtc { get; set; } = string.Empty;

    public bool IsEmpty { get; set; }

    public bool IsFromCache { get; set; }

    public bool HasError { get; set; }

    public string StatusMessage { get; set; } = string.Empty;
}

public sealed class NewsFeedItemClientProperties
{
    public string Heading { get; set; } = string.Empty;

    public string DescriptionHtml { get; set; } = string.Empty;

    public string? CtaLabel { get; set; }

    public string? CtaUrl { get; set; }

    public IReadOnlyList<string> Tags { get; set; } = [];

    public DateTimeOffset? PublishedAtUtc { get; set; }
}
