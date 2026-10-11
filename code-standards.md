# Code standards

These standards apply to the Illyrian Brains website and its supporting scripts and
Supabase schema. `AGENTS.md` defines repository context and workflow; this file defines
implementation quality.

The site is growing from an organization website into a platform where people can be
discovered, understand why they are relevant to one another, and build useful
professional and community connections. New code should support that direction without
turning simple content pages into unnecessary application code.

## Architecture and ownership

- Keep public, mostly static pages in Astro and generate them at build time where
  practical. Add browser JavaScript only for live data, authentication, or interaction.
- Keep page composition in `src/pages/`, reusable presentation in `src/components/`,
  shared browser/domain behavior in `src/scripts/`, and typed content in `src/data/`.
- Keep global visual rules in `src/styles/global.css` and accent/theme rules in
  `src/styles/accents.css`. Prefer existing classes and tokens before adding new ones.
- Supabase is the source of truth for members, relationships, posts, ideas, teams, and
  organizations. Build-time JSON files are generated snapshots, not parallel databases.
- Put database changes in a new numbered migration under `supabase/`. Do not rewrite a
  migration that may already have been applied.
- Do not add a framework island, dependency, or abstraction unless the feature genuinely
  needs it and the repository's existing tools cannot express it clearly.
- Treat 400 lines as a review trigger for source and stylesheet files. A cohesive data or
  presentation artifact may remain longer, but mixed responsibilities should be split into
  specifically named modules. Do not compress code onto fewer lines to satisfy the count.

## Astro and TypeScript

- Use 2-space indentation, single quotes in TypeScript and Astro frontmatter, and
  semicolons, matching the surrounding code.
- Keep components focused on one visible responsibility. Extract a component or helper
  when it is reused or when it isolates a meaningful behavior, not merely to reduce line
  count.
- Prefer semantic HTML and progressive enhancement. Core public content and navigation
  must remain understandable before client-side JavaScript runs.
- Use descriptive names based on the product language: member, profile, connection,
  organization, post, idea, city, field, and team. Avoid vague `utils` or `helpers` when a
  more specific module name is available.
- Type data at module boundaries. Reuse the established member and organization types
  instead of creating slightly different local shapes.
- Treat DOM lookups and external data as nullable or untrusted. Validate before use and
  fail with a useful message when required state is missing.
- Keep Albanian interface copy natural and consistent, including `ë`, `ç`, and curly
  apostrophes. Do not expose internal database terminology in user-facing text.

## Platform and networking behavior

- Design discovery around useful context, not popularity alone. When ranking or
  recommending people, use explainable signals such as shared city, field, skills,
  aspirations, team, or organization.
- Keep matching and ranking rules in shared TypeScript functions so directories,
  profiles, and the signed-in network view do not drift apart. Add focused tests when a
  rule changes.
- A member slug is a public identifier and shares the root route namespace. Generate and
  validate it through `src/scripts/members.ts`; never construct profile URLs ad hoc.
- Preserve stable profile URLs and database identifiers. If a route or identifier must
  change, provide a redirect or compatibility path and update all consumers together.
- Empty, loading, signed-out, and permission-denied states are product states. Handle
  each explicitly, with an actionable next step where appropriate.
- Build connection features for keyboard use and small screens as well as pointer-based
  desktop use. Network graphs must have an understandable non-graph alternative.
- Do not introduce engagement mechanics that obscure why content or people are shown.
  Counts and ranking should help members connect, not act as unexplained authority.

## Data, privacy, and security

- Treat profile data as personal data. Publish only fields exposed by an approved public
  view or RPC; never query private member tables from anonymous browser code.
- Never expose email addresses, payment state, return plans, admin notes, secret keys, or
  other private/admin-only fields in HTML, generated JSON, logs, client bundles, or public
  views.
- Use the Supabase publishable key in the browser. Secret/service-role keys belong only in
  local administrative scripts and must never enter CI output or committed files.
- Enforce authorization and validation in database policies/functions, not only by hiding
  controls in the interface. Client checks improve UX but are not a security boundary.
- Prefer the narrowest database result needed by the UI. Avoid `select('*')` in public
  browser queries when an explicit field list or public view can define the contract.
- Validate and normalize all member-authored text, tags, URLs, uploads, and identifiers at
  the write boundary. Escape rendered content and allow only intentional markup and safe
  URL schemes.
- Make mutations safe to retry where practical. Show success or failure only after the
  server response, and prevent duplicate submissions while a request is pending.
- Keep generated member, team, idea, and organization snapshots gitignored. Fixtures in
  tests must be synthetic and must not contain real member details.

## Supabase changes

- Use lowercase `snake_case` for tables, columns, views, functions, and policies.
- Give public views and RPCs an explicit, minimal contract. Treat changes to their column
  names, return shapes, and semantics as API changes.
- Enable row-level security on tables reachable through the API and define policies for
  each intended role. Default to no access when a case is not explicitly supported.
- Keep privileged logic in `security definer` functions small, set a safe `search_path`,
  qualify referenced objects, and grant execution only to the roles that need it.
- Put data integrity rules in the database when they must hold across every client:
  uniqueness, ownership, status transitions, limits, and foreign-key relationships.
- When a migration changes a public contract, update sync scripts, browser queries,
  TypeScript types, documentation, and regression tests in the same change.

## Accessibility and interface quality

- Use native links, buttons, labels, headings, dialogs, and form controls before adding
  ARIA. Every interactive control needs an accessible name and a visible focus state.
- Do not rely on color alone to communicate membership, relationship, status, or match
  strength. Pair it with text, an icon, or another structural cue.
- Preserve usable tap targets, readable text, and layout at narrow viewport widths.
- Avoid unexpected motion. Respect `prefers-reduced-motion` for non-essential animation.
- Keep member cards and profiles scannable: identity first, then location/field context,
  then the action that helps someone connect.

## Errors and observability

- Catch only errors the caller can handle. Do not silently swallow authentication,
  network, parsing, or database failures.
- User-facing errors should explain what failed and what the person can do next without
  revealing private data or raw backend messages.
- Console output is acceptable for actionable development diagnostics, but do not log
  access tokens, session objects, complete profiles, or submitted personal information.
- Record unrelated defects in the root `bugs.csv` as described by `AGENTS.md`; do not fix
  them as part of an unrelated change.

## Verification

- Add or update focused tests for shared matching, slugging, sanitization, permissions,
  parsing, and other behavior that can regress without a visible build failure.
- Test public outcomes rather than private implementation details. Use small synthetic
  fixtures representing boundaries such as missing fields, duplicate names, unsafe URLs,
  signed-out users, and members without public profile pages.
- After a non-trivial change, run `npm run build` and then `npm test`. For database work,
  also inspect the migration for public grants, row-level security, and accidental private
  field exposure.
