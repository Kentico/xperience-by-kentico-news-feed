namespace Kentico.Xperience.NewsFeed.Services;

public interface INewsFeedService
{
    public Task<NewsFeedFetchResult> GetFeedAsync(bool forceRefresh, CancellationToken cancellationToken);
}
