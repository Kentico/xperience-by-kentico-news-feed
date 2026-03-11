namespace Kentico.Xperience.ProductNewsFeed.Services;

public interface IProductNewsFeedService
{
    public Task<ProductNewsFeedFetchResult> GetFeedAsync(bool forceRefresh, CancellationToken cancellationToken);
}
