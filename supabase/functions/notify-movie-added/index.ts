import webpush from 'npm:web-push@3'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:derrikirred@gmail.com'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const QUALITY_RANK: Record<string, number> = { '4K': 3, 'HD': 2, 'SD': 1 }
const PREFERRED_ORDER = ['fandango_at_home', 'movies_anywhere', 'apple_tv', 'youtube']

function getPrimaryServiceUrl(services: { service: string; url: string | null; quality: string | null }[]): string | null {
    const linked = services.filter(s => s.url)
    if (!linked.length) return null
    const bestRank = Math.max(...linked.map(s => QUALITY_RANK[s.quality ?? ''] ?? 0))
    const best = linked.filter(s => (QUALITY_RANK[s.quality ?? ''] ?? 0) === bestRank)
    for (const slug of PREFERRED_ORDER) {
        const match = best.find(s => s.service === slug)
        if (match) return match.url!
    }
    return best[0].url!
}

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
        const movie = payload.record

        if (!movie?.id) {
            return new Response('No record', { status: 200 })
        }

        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null
        const titleWithYear = year ? `${movie.title} (${year})` : movie.title

        // Resolve images
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : null
        const icon = 'https://movies.derrikengel.com/icon-192.png'
        const badge = 'https://movies.derrikengel.com/notification-badge.png'
        const image = posterUrl ?? undefined

        // Check if this movie was a request — find requester user_ids
        const requests = await query(`movie_requests?tmdb_id=eq.${movie.tmdb_id}&select=id`)
        const requestIds: string[] = (requests ?? []).map((r: { id: string }) => r.id)
        let requesterUserIds: Set<string> = new Set()
        if (requestIds.length) {
            const wants = await query(`request_wants?request_id=in.(${requestIds.join(',')})&select=user_id`)
            requesterUserIds = new Set((wants ?? []).map((w: { user_id: string }) => w.user_id))
        }

        // Get primary streaming service URL
        const movieServices = await query(`movie_services?movie_id=eq.${movie.id}&select=service,url,quality`)
        const watchUrl = getPrimaryServiceUrl(movieServices ?? [])

        // Notification actions
        const actions: { action: string; title: string }[] = [
            { action: 'view', title: 'View Details' },
        ]
        if (watchUrl) actions.push({ action: 'watch', title: 'Watch Now' })

        // Get all push subscriptions
        const subscriptions = await query('push_subscriptions?select=user_id,subscription')

        // Fan out
        await Promise.all(
            (subscriptions ?? []).map(async (row: { user_id: string; subscription: PushSubscription }) => {
                const isRequester = requesterUserIds.has(row.user_id)
                const title = isRequester ? 'Your Requested Movie Added' : 'New Movie Added'

                const notificationPayload = JSON.stringify({
                    title,
                    body: titleWithYear,
                    icon,
                    badge,
                    image,
                    actions,
                    data: { url: `/${movie.slug}`, watchUrl },
                })

                try {
                    await webpush.sendNotification(row.subscription, notificationPayload)
                } catch (err: any) {
                    if (err?.statusCode === 404 || err?.statusCode === 410) {
                        await query(`push_subscriptions?user_id=eq.${row.user_id}`, 'DELETE')
                    } else {
                        console.error(`Failed to send to user ${row.user_id}:`, err)
                    }
                }
            })
        )

        return new Response('OK', { status: 200 })
    } catch (err) {
        console.error('notify-movie-added error:', err)
        return new Response('Error', { status: 500 })
    }
})
