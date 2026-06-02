# WordPress theme development data reference

This reference maps data that a WordPress theme commonly reads to REST API sources for a Lovable / TanStack Start headless frontend.

Use it as a planning checklist. Do not assume every item is public or available on every site. WordPress version, active theme type, plugin setup, custom post type registration, and user capability can change which endpoints are exposed.

## Official docs

- Theme Developer Handbook: https://developer.wordpress.org/themes/
- Theme structure: https://developer.wordpress.org/themes/core-concepts/theme-structure/
- `functions.php`: https://developer.wordpress.org/themes/core-concepts/custom-functionality/
- Navigation menus: https://developer.wordpress.org/themes/functionality/navigation-menus/
- `theme.json`: https://developer.wordpress.org/themes/global-settings-and-styles/introduction-to-theme-json/
- REST API Handbook: https://developer.wordpress.org/rest-api/
- REST API reference: https://developer.wordpress.org/rest-api/reference/
- REST API authentication: https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/

## Common theme data

| Data | Core REST source | Headless usage | Notes |
| --- | --- | --- | --- |
| Site identity | `/wp/v2/settings` | site title, tagline, locale, home URL | Some settings require authentication or a custom endpoint. |
| Posts | `/wp/v2/posts` | listing, detail, related content | Use `_embed` for featured media and author when useful. |
| Pages | `/wp/v2/pages` | static pages, landing pages, legal pages | Front page / posts page IDs usually come from settings or a custom endpoint. |
| Media | `/wp/v2/media` | images, downloads, featured media | Public media can still contain private metadata; map only needed fields. |
| Categories | `/wp/v2/categories` | archive filters, breadcrumbs | Hierarchical taxonomy. |
| Tags | `/wp/v2/tags` | archive filters, related content | Flat taxonomy. |
| Taxonomies | `/wp/v2/taxonomies` | discover category/tag/custom taxonomy metadata | Custom taxonomies need REST support. |
| Post types | `/wp/v2/types` | route generation, CMS capability discovery | Custom post types need `show_in_rest`. |
| Menus | `/wp/v2/menus` | menu metadata and assigned locations | Added for classic navigation menu data. |
| Menu locations | `/wp/v2/menu-locations` | header/footer/mobile menu lookup | The `menu` field points to the assigned menu ID. |
| Menu items | `/wp/v2/menu-items` | build nested nav trees | Sort by `menu_order`; parent-child relation uses `parent`. |
| Block navigations | `/wp/v2/navigation` | block theme navigation content | Useful for block themes using Navigation blocks. |
| Sidebars | `/wp/v2/sidebars` | legacy widget area discovery | Mostly relevant to classic or hybrid themes. |
| Widgets | `/wp/v2/widgets` | rendered widget content | Often auth-sensitive for edit contexts. |
| Search | `/wp/v2/search` | site search | Normalize result types before rendering. |
| Users | `/wp/v2/users` | author pages, bylines | Anonymous access may be limited by site settings and capabilities. |
| Comments | `/wp/v2/comments` | comment lists/forms | Posting comments requires anti-spam and permission planning. |
| Templates | `/wp/v2/templates` | block theme template inspection | Usually not needed for the public frontend unless mirroring FSE. |
| Template parts | `/wp/v2/template-parts` | header/footer/block theme inspection | Prefer frontend components unless you intentionally render WP blocks. |
| Global styles | `/wp/v2/global-styles` | style tokens from block themes | Often requires authenticated context. |
| Themes | `/wp/v2/themes` | active theme metadata | Auth and permissions can apply. |

## Menus

For classic themes, WordPress registers menu locations in PHP with `register_nav_menus()` and renders them with `wp_nav_menu()`. In headless frontend work, the equivalent flow is:

1. Fetch `/wp/v2/menu-locations`.
2. Find the requested location, such as `primary`, `header`, `footer`, or `mobile`.
3. Read its assigned `menu` ID.
4. Fetch `/wp/v2/menu-items?menus=<menuId>&per_page=100&orderby=menu_order&order=asc`.
5. Build a tree using `parent` and `menu_order`.
6. Render only safe fields: label/title, URL, target, rel/XFN, classes that are intentionally supported by the frontend.

For block themes, also check `/wp/v2/navigation`. Block navigation stores navigation as post content, so the frontend must either parse/render blocks intentionally or ask WordPress for a custom normalized menu endpoint.

## Custom endpoints

Many theme-level values are not cleanly public through core REST endpoints:

- logo and favicon IDs / URLs
- front page and posts page mapping
- header/footer contact data
- social links
- theme options
- ACF option pages
- reusable CTA blocks
- business schema data
- SEO plugin metadata

Expose those through a small custom REST endpoint or a backend service layer instead of querying `wp_options` directly from the browser.

Recommended normalized shape:

```json
{
  "site": {},
  "theme": {},
  "menus": [],
  "menuLocations": [],
  "menuItems": [],
  "navigationPosts": [],
  "taxonomies": [],
  "terms": [],
  "sidebars": [],
  "widgets": [],
  "customOptions": {}
}
```

The matching schema is `references/schemas/wp-theme-common-data.schema.json`.

## Authentication note

Public content can usually be fetched without authentication. Private content, edit contexts, protected settings, users, drafts, templates, widgets, plugin options, and write operations require authentication and the correct WordPress capability.

For headless production frontends, do not expose WordPress Application Passwords, JWT secrets, admin cookies, or nonces in browser code. Use a backend proxy or server-only runtime when authenticated requests are needed.

