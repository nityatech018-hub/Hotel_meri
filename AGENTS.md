<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Hotel demo data lives in the browser via `src/lib/hotel/store.ts` (localStorage); all reads/writes go through its actions so a real backend can replace them in one place.
- Dashboards (`/account/*` guest, `/reception/*` staff) are layout routes wrapped in `RequireRole` + `DashboardShell`; sign-in is demo-only and must keep being labelled as not real security.
- Page-level transitions in `__root.tsx` animate opacity only — transforms on that wrapper break the fixed navbar and intro overlay.
- Shared motion helpers live in `src/components/site/Motion.tsx` and `src/components/dashboard/ui.tsx`; reuse them instead of ad-hoc animation code.
- The logo `Intro` is mounted once in `__root.tsx` (server-rendered so nothing flashes) and replays only on full page loads; above-the-fold entrance animations wait for `useIntroDone()` from `src/components/site/introState.ts` so they aren't hidden behind it.
- Entrance animations that use `filter`/`clipPath` must reset them via `transitionEnd` (`filter: "none"`, `clipPath: "none"`) — leftover values clip shadows and break fixed-position children.
- 3D entrances use framer-motion `transformPerspective` on the moving element (no parent setup); when an element also uses `useTilt`, put the entrance on an outer wrapper and the tilt on an inner one so the two rotations don't fight.
