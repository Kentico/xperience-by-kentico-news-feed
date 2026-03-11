using Kentico.Xperience.ProductNewsFeed.Services;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Kentico.Xperience.ProductNewsFeed;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddProductNewsFeed<TProductNewsFeedService>(
        this IServiceCollection services,
        IConfiguration configuration)
        where TProductNewsFeedService : class, IProductNewsFeedService
    {
        services.AddMemoryCache();
        services.AddHttpClient(ProductNewsFeedOptions.HttpClientName);

        services
            .AddOptions<ProductNewsFeedOptions>()
            .Bind(configuration.GetSection(ProductNewsFeedOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(
                options => Uri.IsWellFormedUriString(options.EndpointUrl, UriKind.Absolute),
                $"{ProductNewsFeedOptions.SectionName}:EndpointUrl must be an absolute URI.")
            .ValidateOnStart();

        services.AddSingleton<IProductNewsFeedService, TProductNewsFeedService>();

        return services;
    }
}
