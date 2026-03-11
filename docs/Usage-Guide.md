# Usage Guide

## Setup

Add the Admin package to your ASP.NET Core application using the .NET CLI. This includes the custom admin UI application and all required services.

```powershell
dotnet add package Kentico.Xperience.NewsFeed.Admin
```

If you only need the service contracts and DI registration (without the admin UI), you can use the core package separately:

```powershell
dotnet add package Kentico.Xperience.NewsFeed
```

## Quick Start

Register the library's services in your ASP.NET Core application, passing in your concrete `INewsFeedService` implementation:

```csharp
// Program.cs

// ...

builder.Services.AddNewsFeed<YourNewsFeedService>(builder.Configuration);
```

Add the required configuration to `appsettings.json`:

```json
"Kentico": {
  "NewsFeed": {
    "EndpointUrl": "https://<your-headless-endpoint>/graphql/<channel-guid>",
    "FeedItemId": "<headless-item-guid>",
    "BearerToken": "<your-bearer-token>",
    "CacheDurationMinutes": 5
  }
}
```

Register the admin application in your application's assembly (typically in `Program.cs`):

```csharp
using Kentico.Xperience.Admin.Base;
using Kentico.Xperience.NewsFeed.Admin;

[assembly: UICategory(
    "<your-category-identifier>",
    "<Category Display Name>",
    Icons.Cup,
    100)]

[assembly: UIApplication(
    "Kentico.Xperience.NewsFeed.Admin.Application",
    typeof(NewsFeedTemplatePage),
    "<page-slug>",
    "News Feed",
    "<your-category-identifier>",
    Icons.Cup,
    "@kentico/xperience-integrations-news-feed-web-admin/NewsFeed")]
```

Run the application and navigate to the registered "News Feed" application in the Xperience administration.

## Implementing `INewsFeedService`

The library does not fetch feed data itself. You provide the data retrieval logic by implementing `INewsFeedService`:

```csharp
namespace Kentico.Xperience.NewsFeed.Services;

public interface INewsFeedService
{
    Task<NewsFeedFetchResult> GetFeedAsync(bool forceRefresh, CancellationToken cancellationToken);
}
```

### Method parameters

- `forceRefresh` — when `true`, bypass any cached data and fetch fresh results from the source.
- `cancellationToken` — standard cancellation support.

### Return value

Return a `NewsFeedFetchResult` record:

```csharp
public sealed record NewsFeedFetchResult(
    NewsFeedData Data,
    bool IsSuccess,
    bool IsFromCache,
    string? ErrorMessage);

public sealed record NewsFeedData(
    string FeedTitle,
    string FeedShortDescription,
    IReadOnlyList<NewsFeedItemData> Items,
    DateTimeOffset RetrievedAtUtc);

public sealed record NewsFeedItemData(
    string Heading,
    string DescriptionHtml,
    string? CtaLabel,
    string? CtaUrl,
    IReadOnlyList<string> Tags,
    DateTimeOffset? PublishedAtUtc);
```

Return `IsSuccess: false` and a non-null `ErrorMessage` when retrieval fails; the admin UI surfaces the message to the user. Always populate `Data` with a valid (possibly empty) `NewsFeedData` value even on failure.

### DancingGoat example

The [DancingGoat example project](../examples/DancingGoat/Services/NewsFeedGraphqlService.cs) shows a complete implementation that:

1. Reads `NewsFeedOptions` from configuration.
2. Uses `IHttpClientFactory` to make an authenticated GraphQL POST request to an Xperience headless channel.
3. Caches the result in `IMemoryCache` using the configured `CacheDurationMinutes`.
4. Clears the cache when `forceRefresh` is `true`.
5. Optionally appends synthetic "preview" items (controlled by `IncludePreviewItems`).
6. Maps the GraphQL response to `NewsFeedFetchResult`.

Key constructor signature:

```csharp
public sealed class NewsFeedGraphqlService : INewsFeedService
{
    public NewsFeedGraphqlService(
        IOptions<NewsFeedOptions> options,
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache)
    { ... }
}
```

The GraphQL query used by the example:

```graphql
query NewsFeed($feedId: UUID!) {
  dancingGoatNewsFeedHeadlessItem(id: $feedId) {
    newsFeedHeadlessItemTitle
    newsFeedHeadlessItemDescription
    newsFeedHeadlessItemNewsItemContents(
      sort: { newsItemContentPublishedDate: DESC }
    ) {
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
```

Adapt the query and field mappings to match your own headless channel schema.

## Configuration reference

All settings live under the `Kentico:NewsFeed` section in `appsettings.json`.

`AddNewsFeed<T>()` validates all required fields on startup and rejects absolute-URI violations for `EndpointUrl`.

| Property               | Type     | Required | Default | Description                                                                             |
| ---------------------- | -------- | -------- | ------- | --------------------------------------------------------------------------------------- |
| `EndpointUrl`          | `string` | ✅       | —       | Absolute URL of the GraphQL endpoint (e.g. headless channel URL).                       |
| `FeedItemId`           | `string` | ✅       | —       | GUID of the headless item that represents the feed container.                           |
| `BearerToken`          | `string` | ✅       | —       | Bearer token used to authenticate requests to the endpoint.                             |
| `CacheDurationMinutes` | `int`    |          | `5`     | How long (in minutes) fetched feed data is held in memory. Valid range: 1–1440.         |
| `IncludePreviewItems`  | `bool`   |          | `true`  | When `true`, your `INewsFeedService` implementation can append synthetic preview items. |
| `PreviewItemCount`     | `int`    |          | `15`    | Number of synthetic preview items to generate. Valid range: 0–200.                      |
| `PreviewWindowMonths`  | `int`    |          | `12`    | Spread of mock publish dates across this many months. Valid range: 1–24.                |

Full example:

```json
"Kentico": {
  "NewsFeed": {
    "EndpointUrl": "https://your-site.com/graphql/111e78a6-bbd7-4be0-b5bf-221416fae0ae",
    "FeedItemId": "126c371f-0f79-40dd-85ee-5db6f3dd5212",
    "BearerToken": "<your-bearer-token>",
    "CacheDurationMinutes": 5,
    "IncludePreviewItems": true,
    "PreviewItemCount": 15,
    "PreviewWindowMonths": 12
  }
}
```

## Admin page registration

The admin page is registered via Xperience's `UIApplication` assembly attribute. You control identifiers, display names, icons, and the category it appears under.

```csharp
// Program.cs (or any file compiled into your application assembly)

using Kentico.Xperience.Admin.Base;
using Kentico.Xperience.NewsFeed.Admin;

// Optional: create a new admin category to group the application under.
[assembly: UICategory(
    "MyApp.Admin.NewsFeed.Category",   // unique identifier
    "My Application",                   // display label
    Icons.Cup,                          // icon
    100)]                               // sort order

// Register the News Feed admin page.
[assembly: UIApplication(
    "Kentico.Xperience.NewsFeed.Admin.Application",           // unique application identifier
    typeof(NewsFeedTemplatePage),                              // page class from the library
    "news",                                                    // URL slug for this page
    "News Feed",                                               // display name
    "MyApp.Admin.NewsFeed.Category",                          // parent category identifier
    Icons.Cup,                                                 // icon
    "@kentico/xperience-integrations-news-feed-web-admin/NewsFeed")] // React module entry point
```

You can place the application inside any existing category — the category identifier string just needs to match a registered `UICategory`.

### Permissions

The admin page uses two standard Xperience permissions:

| Permission | Grants                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| `View`     | Read-only access. Required to see the application tile and load the feed. |
| `Update`   | Allows the "Refresh feed" action to bypass cache and force a fresh fetch. |

Configure these through Xperience's standard role and permission management.

## Local development

When running the Admin client locally (for example while working on the React UI), configure the dev proxy in `appsettings.json` so the Xperience admin loads the webpack dev server bundle instead of the embedded one:

```json
"CMSAdminClientModuleSettings": {
  "kentico-xperience-integrations-news-feed-web-admin": {
    "Mode": "Proxy",
    "Port": 3030
  }
}
```

Start the webpack dev server from the `src/Kentico.Xperience.NewsFeed.Admin/Client` directory:

```bash
npm run start
```

The dev server listens on port `3030` by default (configured in `webpack.config.js`).

## How the feed is displayed

The admin page renders two commands:

- **Load feed** — called automatically on first render. Returns cached data when available.
- **Refresh feed** — forces a cache bypass and fetches live data from the source.

The React layout (`NewsFeedTemplate`) displays:

- A header with the feed title and short description.
- A table-of-contents sidebar grouping items by month.
- A scrollable list of news cards, each showing the heading, description (rich text), optional call-to-action link, tags, and published date.
- A status bar showing when data was last retrieved and whether it came from cache.
