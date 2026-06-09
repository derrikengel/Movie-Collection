# Movie Collection — Domain Context

## Push Notifications

**Push Subscription**
A browser-generated endpoint + cryptographic keys stored as a JSON blob in the `push_subscriptions` table. Scoped to one user + device pair. Created when the user grants notification permission via the browser prompt. Managed entirely through browser settings — there is no in-app toggle. Stale subscriptions (browser permission revoked) are automatically removed from the table when the Edge Function receives a 404 or 410 response on send.

**VAPID**
A public/private key pair used to authenticate Web Push sends. The public key (`VITE_VAPID_PUBLIC_KEY`) is exposed to the client and embedded in each push subscription. The private key (`VAPID_PRIVATE_KEY`) lives only in the Edge Function environment and is never sent to the browser.

**Notification trigger**
Always initiated server-side via a Supabase DB webhook on `movies INSERT` → the `notify-movie-added` Edge Function. Never client-initiated. This ensures all subscribers are notified regardless of who added the movie or whether the admin's browser is still open.

**Requester**
A user who added a "want" to a movie request (via `request_wants`) before the movie was added to the collection. Requesters receive a personalized notification variant: "Your request [Title] ([Year]) added to the movie collection." All other subscribers receive the standard variant.
