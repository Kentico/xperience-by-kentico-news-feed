# Xperience by Kentico News Feed

[![Kentico Labs](https://img.shields.io/badge/Kentico_Labs-grey?labelColor=orange&logo=data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWljb24iIHN0eWxlPSJ3aWR0aDogMWVtOyBoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05NTYuMjg4IDgwNC40OEw2NDAgMjc3LjQ0VjY0aDMyYzE3LjYgMCAzMi0xNC40IDMyLTMycy0xNC40LTMyLTMyLTMyaC0zMjBjLTE3LjYgMC0zMiAxNC40LTMyIDMyczE0LjQgMzIgMzIgMzJIMzg0djIxMy40NEw2Ny43MTIgODA0LjQ4Qy00LjczNiA5MjUuMTg0IDUxLjIgMTAyNCAxOTIgMTAyNGg2NDBjMTQwLjggMCAxOTYuNzM2LTk4Ljc1MiAxMjQuMjg4LTIxOS41MnpNMjQxLjAyNCA2NDBMNDQ4IDI5NS4wNFY2NGgxMjh2MjMxLjA0TDc4Mi45NzYgNjQwSDI0MS4wMjR6IiAgLz48L3N2Zz4=)](https://github.com/Kentico/.github/blob/main/SUPPORT.md#labs-limited-support) [![CI: Build and Test](https://github.com/Kentico/xperience-by-kentico-news-feed/actions/workflows/ci.yml/badge.svg)](https://github.com/Kentico/xperience-by-kentico-news-feed/actions/workflows/ci.yml)

## Description

An experimental integration to deliver news directly into the Xperience administration.

## Screenshots

![News Feed highlighted in the Xperience administration dashboard](./images/administration-dashboard-news-feed-highlight.jpg)

![News Feed administration page](./images/administration-news-feed.jpg)

![News Feed headless item editing](./images/news-feed-headless-item-edit.jpg)

## Requirements

### Library Version Matrix

| Xperience Version | Library Version |
| ----------------- | --------------- |
| >= 31.2.1         | 1.0.0           |

### Dependencies

- [ASP.NET Core 10.0](https://dotnet.microsoft.com/en-us/download)
- [Xperience by Kentico](https://docs.kentico.com)

### Other requirements

This integration can serve news content from any source, but it is designed to work with [Xperience by Kentico headless channels](https://docs.kentico.com/x/nYWOD). The demo project included in this repository includes an example headless channel and headless item for a news feed.

## Package Installation

Add the package to your application using the .NET CLI

```powershell
dotnet add package Kentico.Xperience.NewsFeed.Admin
```

## Quick Start

Use these minimal steps to get the integration running. For a full walkthrough and deeper customization, use [Usage Guide](./docs/Usage-Guide.md).

1. Register News Feed services in your app startup.

   Use [examples/DancingGoat/Program.cs](examples/DancingGoat/Program.cs) as reference and add:

   ```csharp
   using Kentico.Xperience.NewsFeed;
   using Kentico.Xperience.NewsFeed.Admin;

   builder.Services.AddNewsFeed<NewsFeedGraphqlService>(builder.Configuration);
   ```

1. Configure the `Kentico:NewsFeed` section in your `appsettings.json`.

   Use [examples/DancingGoat/appsettings.json](examples/DancingGoat/appsettings.json) as reference:

   ```json
   "Kentico": {
     "NewsFeed": {
       "EndpointUrl": "https://<your-headless-endpoint>/graphql/<channel-guid>",
       "FeedItemId": "<headless-item-guid>",
       "BearerToken": "<bearer-token>",
       "CacheDurationMinutes": 5
     }
   }
   ```

1. Register the admin page application attribute.

   Use [examples/DancingGoat/Program.cs](examples/DancingGoat/Program.cs) as reference:

   ```csharp
   [assembly: UICategory(
       "DancingGoat.Admin.NewsFeed.Category",
       "Dancing Goat",
       Icons.Cup,
       100)]
   [assembly: UIApplication(
       "Kentico.Xperience.NewsFeed.Admin.Application",
       typeof(NewsFeedTemplatePage),
       "<page-slug>",
       "News Feed",
       "DancingGoat.Admin.NewsFeed.Category",
       Icons.Cup,
       "@kentico/xperience-integrations-news-feed-web-admin/NewsFeed")]
   ```

   Registering these in your own application gives you full control over how they are presented.

1. Implement and register an `INewsFeedService`.

   A working example is available in [examples/DancingGoat/Services/NewsFeedGraphqlService.cs](examples/DancingGoat/Services/NewsFeedGraphqlService.cs).

1. Run your application and open Xperience admin.

   Navigate to the registered "News Feed" application page and confirm feed items are loaded.

## Full Instructions

View the [Usage Guide](./docs/Usage-Guide.md) for more detailed instructions.

## Contributing

To see the guidelines for Contributing to Kentico open source software, please see [Kentico's `CONTRIBUTING.md`](https://github.com/Kentico/.github/blob/main/CONTRIBUTING.md) for more information and follow the [Kentico's `CODE_OF_CONDUCT`](https://github.com/Kentico/.github/blob/main/CODE_OF_CONDUCT.md).

Instructions and technical details for contributing to **this** project can be found in [Contributing Setup](./docs/Contributing-Setup.md).

## License

Distributed under the MIT License. See [`LICENSE.md`](./LICENSE.md) for more information.

## Support

[![Kentico Labs](https://img.shields.io/badge/Kentico_Labs-grey?labelColor=orange&logo=data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWljb24iIHN0eWxlPSJ3aWR0aDogMWVtOyBoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05NTYuMjg4IDgwNC40OEw2NDAgMjc3LjQ0VjY0aDMyYzE3LjYgMCAzMi0xNC40IDMyLTMycy0xNC40LTMyLTMyLTMyaC0zMjBjLTE3LjYgMC0zMiAxNC40LTMyIDMyczE0LjQgMzIgMzIgMzJIMzg0djIxMy40NEw2Ny43MTIgODA0LjQ4Qy00LjczNiA5MjUuMTg0IDUxLjIgMTAyNCAxOTIgMTAyNGg2NDBjMTQwLjggMCAxOTYuNzM2LTk4Ljc1MiAxMjQuMjg4LTIxOS41MnpNMjQxLjAyNCA2NDBMNDQ4IDI5NS4wNFY2NGgxMjh2MjMxLjA0TDc4Mi45NzYgNjQwSDI0MS4wMjR6IiAgLz48L3N2Zz4=)](https://github.com/Kentico/.github/blob/main/SUPPORT.md#labs-limited-support)

This project has **Kentico Labs limited support**.

See [`SUPPORT.md`](https://github.com/Kentico/.github/blob/main/SUPPORT.md#full-support) for more information.

For any security issues see [`SECURITY.md`](https://github.com/Kentico/.github/blob/main/SECURITY.md).
