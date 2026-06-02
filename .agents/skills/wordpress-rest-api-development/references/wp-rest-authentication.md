# WordPress REST API authentication

This reference summarizes authentication choices for Lovable / TanStack Start frontends using WordPress as a headless CMS.

## Default rule

Use anonymous requests for public content. Use authenticated requests only for data that WordPress protects by capability, such as drafts, private posts, edit context, settings, users, widgets, templates, plugin options, or write operations.

Never ship long-lived WordPress credentials to browser JavaScript.

## Methods

| Method | Best for | Browser safe | Notes |
| --- | --- | --- | --- |
| Anonymous REST | public posts, pages, media, categories, menus | yes | Depends on endpoint permissions and site configuration. |
| Cookie + `X-WP-Nonce` | WordPress admin, same-origin plugin/theme screens | only inside WP admin context | WordPress uses REST nonces for CSRF protection. Requires logged-in WP cookies. |
| Application Passwords | server-to-WordPress requests, scripts, migrations | no | Built into WordPress 5.6+. Send with HTTPS Basic Auth from server-only code. |
| OAuth 1.0a plugin | external applications needing delegated auth | no | Requires plugin and setup. |
| JWT plugin | decoupled apps with token auth | depends on implementation | Not core WordPress. Protect token storage and refresh flow. |
| Basic Auth development plugin | local testing | no | Development/testing only; prefer Application Passwords for real remote access. |

## Recommended headless setup

1. Public pages call public REST endpoints directly when CORS and cache policy allow it.
2. Authenticated CMS reads happen in a server-only service layer.
3. Server-only requests use Application Passwords or another approved server-side auth method.
4. The frontend receives normalized, minimal data, not raw edit-context payloads.
5. Write operations validate input on the server before forwarding to WordPress.

## Application Passwords

Application Passwords are created per user in WordPress admin under the user profile. Use them only from trusted server-side code:

```bash
curl --user "USERNAME:APPLICATION_PASSWORD" \
  "https://example.com/wp-json/wp/v2/users?context=edit"
```

Environment variable pattern:

```txt
WP_API_BASE_URL=https://example.com/wp-json
WP_API_USERNAME=editor@example.com
WP_API_APPLICATION_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

Server-only request header pattern:

```ts
const token = Buffer.from(`${username}:${applicationPassword}`).toString("base64");

const response = await fetch(`${baseUrl}/wp/v2/settings`, {
  headers: {
    Authorization: `Basic ${token}`,
  },
});
```

Do not expose these variables through client-side bundles, `VITE_` public env vars, or serialized route data.

## Cookie and nonce auth

Cookie authentication is the standard WordPress logged-in flow. For manual REST requests inside WordPress admin or same-origin theme/plugin screens, send the nonce in `X-WP-Nonce`.

This is not a normal authentication strategy for a separate public headless frontend because it depends on WordPress login cookies and same-origin behavior.

## Permissions

Authentication only identifies the user. WordPress still checks capabilities per endpoint and action. For example:

- `context=view` may be public.
- `context=edit` usually requires permissions.
- Drafts/private posts require read permissions.
- Settings, templates, themes, widgets, users, and plugin/admin data often require elevated capabilities.
- Custom endpoints must define strict `permission_callback` behavior.

## Custom REST endpoint guardrails

For custom endpoints:

- Return only the fields the frontend needs.
- Use `permission_callback` deliberately; do not default sensitive data to public.
- Sanitize request params.
- Escape or sanitize rich HTML before rendering in the frontend.
- Cache public responses separately from authenticated responses.
- Avoid leaking private post IDs, user emails, internal option names, API keys, or edit URLs.

## Official docs

- WordPress REST API authentication: https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
- Application Passwords reference: https://developer.wordpress.org/rest-api/reference/application-passwords/
- REST API reference: https://developer.wordpress.org/rest-api/reference/

