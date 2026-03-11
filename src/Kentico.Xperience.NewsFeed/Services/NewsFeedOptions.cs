using System.ComponentModel.DataAnnotations;

namespace Kentico.Xperience.NewsFeed.Services;

public sealed class NewsFeedOptions
{
    public const string SectionName = "Kentico:NewsFeed";
    public const string HttpClientName = "Kentico.NewsFeed";

    [Required]
    public string EndpointUrl { get; set; } = string.Empty;

    [Required]
    public string FeedItemId { get; set; } = string.Empty;

    [Required]
    public string BearerToken { get; set; } = string.Empty;

    [Range(1, 1440)]
    public int CacheDurationMinutes { get; set; } = 5;

    public bool IncludePreviewItems { get; set; } = true;

    [Range(0, 200)]
    public int PreviewItemCount { get; set; } = 15;

    [Range(1, 24)]
    public int PreviewWindowMonths { get; set; } = 12;
}
