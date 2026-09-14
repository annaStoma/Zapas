# Zapas

Zapas tells a retail buyer how many days of stock is left for every product, and what to reorder today.

Stock counts on their own don't answer the question a buyer actually has. 128 units of milk is fine if you sell 5 a day and an emergency if you sell 41. Zapas divides stock by the measured daily velocity, sorts everything by days-to-zero, and puts the shortest number first.

**Live demo:** <!-- add the deployed URL --> · **Design:** <!-- Figma link -->

---

## Why this project exists

I've spent six years building frontends in Angular. Zapas is how I moved to React: instead of following tutorials, I picked a domain I know (retail inventory and demand data) and built something that needed the parts of React people actually argue about — server state caching, optimistic mutations, concurrent rendering, form state, virtualization, and real-time updates.

The interesting parts of this repo are therefore the decisions, not the feature list. Those are in [Decisions and trade-offs](#decisions-and-trade-offs).

---

## Features

| Area | What it does |
|---|---|
| Shelf | Products sorted by days-to-zero, with a fill bar showing how empty the shelf is. Filters and search live in the URL, so any view is shareable |
| Product detail | Consumption history with a projected run-out date and a below-minimum band |
| Inline min-stock edit | Updates immediately, rolls back with a toast if the server rejects it |
| Restock wizard | Four steps, per-step validation, draft survives navigation and reload |
| Orders | Order list with status, plus a live delivery feed over WebSocket |
| Reports | Turnover by category and forecast accuracy; loaded as a separate chunk |
| CSV import | Parsed off the main thread in a worker, with progress |

Dark theme, keyboard navigation, and visible focus are supported throughout.

---

## Stack

| | | Why |
|---|---|---|
| React 19.3 + TypeScript | UI | Actions, `useOptimistic`, `use`, View Transitions |
| Vite | Build | Fast dev server, Rollup for production |
| React Router v7 | Routing | Data mode — route loaders start fetching alongside the route chunk, which removes the render-then-fetch waterfall |
| TanStack Query | Server state | Cache, deduplication, invalidation, optimistic mutations |
| Zustand | Client UI state | Store outside React, no provider, subscribers re-render on their slice only |
| Redux Toolkit | Order draft | Explicit event model and a devtools timeline for the one flow where step-by-step state history actually helps |
| React Hook Form + Zod | Forms | Uncontrolled by default; one schema produces both validation and types |
| TanStack Table + Virtual | Data grid | Headless — the library owns the logic, the markup is mine |
| Recharts | Charts | |
| Tailwind | Styling | |
| Vitest + Testing Library + Playwright | Tests | |
| MSW | Network mocking | Same handlers in tests and in the offline dev mode |
| React Compiler | Optimization | Enabled; see the note on memoization below |

---

## Data

The app runs against [DummyJSON](https://dummyjson.com) — a public REST API, no key required. Product `stock`, `price`, `category` and barcode come from there; daily velocity and the forecast series are derived locally from a seeded function so the numbers stay stable between reloads.

Two things about that API shaped the code:

**Writes are simulated.** `PATCH /products/:id` returns the updated object but persists nothing. Rather than fake a backend, I added an overlay layer: mutations apply optimistically, the resulting patches live in a separate store, and they merge into the query's `select`. So the UI stays consistent across navigation while the cache still reflects what the server really said. This is also what made the rollback path worth testing — it's a real code path, not a mock.

**Responses are instant.** The API accepts `?delay=`, which I use in development to keep loading states honest. Suspense boundaries and skeletons that only ever render for 10ms are boundaries you haven't actually verified.

Auth uses the API's real JWT endpoints (`/auth/login`, `/auth/refresh`), so the token refresh flow — 401, refresh, replay the original request, deduplicate concurrent refreshes — is genuine.

---

## Architecture

```
src/
  app/          providers, router, global styles
  pages/        route-level composition
  features/     user scenarios (filters, wizard, inline edit, feed, import)
  entities/     domain models and their thin UI (product, order, warehouse)
  shared/       api client, ui kit, hooks, lib
```

Three rules hold it together:

**Dependencies point one way:** `pages → features → entities → shared`. Modules on the same layer don't import each other. When two features need the same thing, it moves down a layer instead of sideways.

**One boundary owns the API shape.** `entities/product/model/mappers.ts` is where a DummyJSON product becomes a domain `Product` with `daysToZero` and `status`. Nothing above that file knows the API exists, which is why swapping the data source wouldn't touch a single screen.

**Query keys are declared, not typed inline.** One `queryKeys` factory per entity. Without it, cache invalidation becomes guesswork by the third screen.

---

## Running locally

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

No environment variables are required — the API needs no key. To develop offline, run `pnpm dev:msw`, which serves the same data from MSW handlers.

```bash
pnpm test          # unit and component tests
pnpm test:e2e      # Playwright
pnpm lint
pnpm build
```

Node <!-- fill in your version --> or newer.

---

## Tests

Component tests go through the interface the way a user does — roles and labels, not implementation details. The cases worth reading are the ones covering behaviour that's easy to get wrong:

- optimistic min-stock edit rolling back on a 500
- filters surviving a reload because they live in the URL
- the wizard refusing to advance on an invalid step while still allowing back-navigation
- token refresh firing once when three requests get a 401 at the same time

<!-- Add coverage numbers if you're happy with them. Don't add a badge you'd have to explain. -->

---

## Decisions and trade-offs

**No framework.** This is a client-rendered SPA behind a login. There's no SEO surface and no content to stream, so Next.js would have added a server I don't need. If Zapas had public pages, or if the product list needed to render on the server for first paint, I'd have started from the App Router instead.

**TanStack Query instead of putting server data in a store.** The order draft is application state and belongs in a store. Product data is a cache of somebody else's state, with staleness, refetching and invalidation — different problem, different tool. Keeping them apart is the reason there's no manual loading flag anywhere in the codebase.

**Two state libraries on purpose.** Zustand holds UI state where the only requirement is cheap subscriptions. Redux Toolkit holds the order draft, where I wanted the action log. I'd collapse to one in a team project; here the comparison was part of the point.

**Memoization after the compiler.** With the React Compiler enabled, most manual `useMemo` and `useCallback` calls became noise and I removed them. <!-- Replace with your own Profiler numbers: what was the render cost before and after? --> The ones that remain exist for cache semantics, not render cost.

**Virtualization is real, not decorative.** The API returns a couple of hundred products; the table is fed a multiplied dataset so the row count is in the tens of thousands. Measuring on 200 rows would have proved nothing.

### What I'd change with two more weeks

<!-- Keep this section. It's the one interviewers read most carefully. Two or three items, specific. Examples of the right shape:
- the filter state schema grew organically and should be one Zod schema shared by the URL parser and the query key
- the delivery feed reconnects but doesn't backfill missed events
-->

### What I got wrong first

<!-- Two items, honestly written. This is the strongest part of any portfolio README and the only part nobody can fake.
Think about: an effect you wrote that shouldn't have been an effect; state you derived that you'd stored; a place where index-as-key bit you. Say what broke and what you changed. -->

---

## Not built

Deliberately out of scope: multi-tenant permissions, supplier-side accounts, real demand forecasting (the projection here is linear on measured velocity, not a model), and i18n beyond the two locales.

---

<!-- Optional: license and contact -->
