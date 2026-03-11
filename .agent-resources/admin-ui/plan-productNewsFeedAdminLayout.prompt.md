## Plan: Product News Feed Admin Layout

Build a project-consistent Xperience admin application page that loads a hardcoded GraphQL feed (with hardcoded bearer auth), caches the feed server-side for 5 minutes, passes typed feed + item data to React template properties, and renders a Kentico-branded, scrollable news experience with safe rich-text/image constraints.

**Steps**

1. Phase 1 - Normalize Admin Module Naming and Registration (_blocks all later backend wiring_)
1. Replace boilerplate Acme identifiers with project-consistent ProductNewsFeed naming in admin module + category constants.
1. Align client module registration identity with client webpack/org/project naming so template resolution is deterministic.
1. Remove or retire boilerplate demo page/extender references that would conflict with new application naming.
1. Phase 2 - Add Backend News Feed Application/Page Contracts (_depends on Phase 1_)
1. Create a root admin application page class for Product News Feed using `UIApplication` and Xperience section layout conventions.
1. Create a child page (or direct application page template, depending on final nav choice) backed by `Page<TClientProperties>` with a template name matching the React export.
1. Define strongly-typed `TemplateClientProperties` for feed title, feed short description, item collection, and UI metadata (timestamp/empty-state flags as needed).
1. Define DTOs for `KenticoCommunityLinksFeedHeadlessItem` and nested `KenticoCommunityLinksFeedItemContent` fields required by UI (heading, description HTML, CTA label/url, tags if needed).
1. Phase 3 - Implement GraphQL Integration + 5-Minute Cache Service (_depends on Phase 2_)
1. Add a dedicated admin service (e.g., ProductNewsFeedGraphqlService) that posts GraphQL query payloads using `HttpClient` and deserializes response models.
1. Hardcode constants in service for endpoint URL (`https://community.kentico.com/api/headless/adf3284e-e886-4c35-965b-b921e17baf8a`), feed id (`b8511aaa-e2f7-4b08-b470-9c92d5022936`), and literal bearer token.
1. Query `kenticoCommunityLinksFeedHeadlessItem(id: ...)` and map nested `linksFeedHeadlessItemLinksFeedLinkContents` items to client DTOs.
1. Wrap retrieval in a simple in-memory cache with absolute expiration of 5 minutes and a stable cache key per endpoint+feed+language.
1. Handle failure paths explicitly (empty list + user-facing info/error message via response builder) without breaking page load.
1. Phase 4 - Wire Page Lifecycle and Commands (_depends on Phase 3_)
1. Populate initial template data inside `ConfigureTemplateProperties` using cached service result.
1. Add a page command (e.g., RefreshFeed) to bypass/refresh cache and repopulate item data for live admin refresh behavior.
1. Return typed command responses and status messages compatible with `usePageCommand` in the client.
1. Phase 5 - Build React Layout + Components (Kentico Brand, Scrollable UX) (_parallel with Phase 4 once DTO contract is stable_)
1. Create a layout template component whose name maps exactly to backend `templateName` (without `Template` suffix in C# identifier).
1. Add composable UI pieces (feed header + news card list + item body/CTA blocks) using Tailwind + shadcn-compatible patterns already present in client setup.
1. Apply Kentico color tokens by extending existing CSS variables and using a branded accent system from Kentico brand guidance (avoid generic default theme).
1. Render rich text descriptions in a constrained content container and enforce image sizing rules (`max-height`, `object-fit`, responsive widths) so large images never dominate cards.
1. Ensure list area is scrollable with clear visual affordance and card spacing optimized for admin readability.
1. Add CTA rendering with safe link behavior (target/rel decisions consistent with admin UX).
1. Phase 6 - Export, Build, and Validate End-to-End (_depends on Phases 4 and 5_)
1. Export new layout/component entry points from client `entry.tsx` so Xperience can resolve template modules.
1. Build client bundle and .NET solution to validate backend/frontend contracts compile together.
1. Perform manual runtime checks in admin: page registration, initial load, cache hit after first request, refresh command, rich text with large images, CTA click behavior.

**Relevant files**

- `src/Kentico.Xperience.ProductNewsFeed.Admin/AcmeWebAdminModule.cs` - Rename module/category/client registration to ProductNewsFeed-consistent identifiers.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Kentico.Xperience.ProductNewsFeed.Admin.csproj` - Align `AdminOrgName` and client module identity with final naming.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/UIPages/CustomTemplate/CustomTemplate.cs` - Replace or retire demo page pattern; reference for current `Page<TClientProperties>` wiring.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/UIPages/` (new ProductNewsFeed folder/files) - New application page, child page, client properties, commands.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Services/` (new) - GraphQL retrieval + caching service and response models.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Client/webpack.config.js` - Confirm org/project mapping matches backend module registration.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Client/src/entry.tsx` - Export new layout/component templates.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Client/src/globals.css` - Extend/adjust brand-aligned tokens and content styling constraints.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Client/src/layouts/` (new) - Main ProductNewsFeed layout template.
- `src/Kentico.Xperience.ProductNewsFeed.Admin/Client/src/components/` (new) - News list/card/rich-text presentation components.
- `.agent-resources/admin-ui/schema.graphql` - Source schema for query field names and DTO mapping.

**Verification**

1. Run client lint/build in `src/Kentico.Xperience.ProductNewsFeed.Admin/Client` (`npm run lint`, `npm run build`) and confirm no TS/ESLint violations.
1. Run solution build (`dotnet build`) and verify admin project compiles cleanly.
1. In Xperience admin, open Product News Feed page and verify feed title/description + list items are rendered from GraphQL response.
1. Confirm cache behavior: first request hits endpoint, repeated requests inside 5 minutes use cache, refresh command invalidates/refreshes.
1. Validate UX with rich text containing large images: images are constrained, content remains readable, list remains scrollable on common viewport sizes.
1. Validate CTA interactions: links open as intended and do not break admin shell usability.

**Decisions**

- Endpoint is hardcoded: `https://community.kentico.com/api/headless/adf3284e-e886-4c35-965b-b921e17baf8a`.
- Authentication is hardcoded bearer token in request Authorization header.
- Feed selection uses hardcoded root item id: `b8511aaa-e2f7-4b08-b470-9c92d5022936`.
- Scope includes full rename/migration from Acme boilerplate naming to ProductNewsFeed-consistent naming.
- 5-minute cache is in-memory and local to admin app process (no distributed cache in this iteration).

**Further Considerations**

1. Keep hardcoded token in source only for this milestone; next milestone should move secrets to configuration and rotate token.
2. If multilingual feed output is needed, add hardcoded `languageName` now or expose page command parameter later.
3. If feed grows large, add server-side `take` and client progressive reveal to keep page render fast.
