# ADR 0002 — Push Notifications via Supabase Edge Function + VAPID

## Status
Accepted

## Context
The app needs to notify users when a new movie is added to the collection. The solution should be free. Options considered:

1. **DB webhook → Supabase Edge Function (chosen)**
2. Client-side trigger from the admin form after submission
3. Third-party push service (OneSignal, Firebase Cloud Messaging, etc.)

## Decision
Use a Supabase database webhook on `movies INSERT` to trigger a Supabase Edge Function that sends Web Push notifications directly via the VAPID protocol (`web-push` library).

## Rationale

**DB webhook over client-side trigger:** The webhook fires regardless of client state — if the admin closes the tab mid-submission or the network drops after the DB write, notifications still send. Client-side triggering couples delivery to the UI flow and is silently skipped on error.

**VAPID/web-push over third-party service:** Web Push with VAPID is a free, open standard supported natively by all major browsers. Third-party services add account management, API rate limits, and potential cost at scale. For 4 users, the standard is strictly simpler.

**Supabase Edge Functions over a separate server:** Supabase Edge Functions are free within the hobby tier limits and deploy alongside the existing database — no additional hosting, billing accounts, or infrastructure to manage.

## Notification payload
Each notification includes:
- **title:** "[Title] (Year) added to the movie collection" — or "Your request…" for requesters
- **icon:** TMDB poster image (`w300`)
- **image:** TMDB backdrop image (`w1280`), falls back to poster if no backdrop exists
- **actions:** "View Details" (opens movie detail page) and "Watch Now" (opens primary streaming service URL, omitted if no services exist). Actions apply the same service priority logic as `MovieServices.vue`.

## Consequences
- VAPID keys are generated once and cannot be rotated without re-subscribing all users.
- iOS Safari has limited Web Push support (notification actions not supported; basic notifications work on iOS 16.4+ when installed as a PWA).
- The Edge Function must be redeployed via the Supabase CLI when updated.
- Browser permission is the sole opt-out mechanism — there is no in-app toggle. When permission is revoked, the stale subscription is cleaned up automatically on the next failed send.
