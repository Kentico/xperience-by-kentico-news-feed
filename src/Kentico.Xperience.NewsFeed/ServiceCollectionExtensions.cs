using Kentico.Xperience.NewsFeed.Services;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Kentico.Xperience.NewsFeed;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddNewsFeed<TNewsFeedService>(
        this IServiceCollection services,
        IConfiguration configuration)
        where TNewsFeedService : class, INewsFeedService
    {
        services.AddMemoryCache();
        services.AddHttpClient(NewsFeedOptions.HttpClientName);

        services
            .AddOptions<NewsFeedOptions>()
            .Bind(configuration.GetSection(NewsFeedOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(
                options => Uri.IsWellFormedUriString(options.EndpointUrl, UriKind.Absolute),
                $"{NewsFeedOptions.SectionName}:EndpointUrl must be an absolute URI.")
            .ValidateOnStart();

        services.AddSingleton<INewsFeedService, TNewsFeedService>();

        return services;
    }
}
