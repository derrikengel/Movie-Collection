import webpush from 'npm:web-push@3'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:derrikirred@gmail.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MY_USER_ID = Deno.env.get('MY_USER_ID')!
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

async function query(path: string, method = 'GET', body?: unknown) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method,
        headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    })
    if (method === 'DELETE') return null
    return res.json()
}

Deno.serve(async (req) => {
    try {
        const payload = await req.json()
        const want = payload.record

        if (!want?.request_id || !want?.user_id) {
            return new Response('No record', { status: 200 })
        }

        if (want.user_id === MY_USER_ID) {
            return new Response('Self-triggered, skipped', { status: 200 })
        }

        const subscriptions = await query(`push_subscriptions?user_id=eq.${MY_USER_ID}&select=id,subscription`)
        if (!subscriptions?.length) {
            return new Response('No subscriptions', { status: 200 })
        }

        const [request, wants, actor] = await Promise.all([
            query(`movie_requests?id=eq.${want.request_id}&select=title,release_date,slug,poster_path,backdrop_path`),
            query(`request_wants?request_id=eq.${want.request_id}&select=id`),
            query(`profiles?id=eq.${want.user_id}&select=display_name`),
        ])
        const requestData = request?.[0]
        if (!requestData) {
            return new Response('No request', { status: 200 })
        }

        const isNewRequest = (wants?.length ?? 0) <= 1
        const requesterName = actor?.[0]?.display_name ?? 'Someone'
        const year = requestData.release_date ? new Date(requestData.release_date).getFullYear() : null
        const titleWithYear = year ? `${requestData.title} (${year})` : requestData.title

        const title = isNewRequest ? 'New Request' : 'Request Update'
        const body = isNewRequest
            ? `${requesterName} requested ${titleWithYear}`
            : `${requesterName} also wants ${titleWithYear}`

        const posterUrl = requestData.poster_path
            ? `https://image.tmdb.org/t/p/w300${requestData.poster_path}`
            : null
        const backdropUrl = requestData.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${requestData.backdrop_path}`
            : null

        const notificationPayload = JSON.stringify({
            title,
            body,
            icon: posterUrl ?? undefined,
            badge: 'https://movies.derrikengel.com/notification-badge.png',
            image: backdropUrl ?? posterUrl ?? undefined,
            data: { url: `/requests/${requestData.slug}` },
        })

        await Promise.all(
            subscriptions.map(async (row: { id: string; subscription: PushSubscription }) => {
                try {
                    await webpush.sendNotification(row.subscription, notificationPayload, { urgency: 'high', TTL: 86400 })
                } catch (err: any) {
                    if (err?.statusCode === 404 || err?.statusCode === 410) {
                        await query(`push_subscriptions?id=eq.${row.id}`, 'DELETE')
                    } else {
                        console.error(`Failed to send to user ${MY_USER_ID}:`, err)
                    }
                }
            })
        )

        return new Response('OK', { status: 200 })
    } catch (err) {
        console.error('notify-request-activity error:', err)
        return new Response('Error', { status: 500 })
    }
})
