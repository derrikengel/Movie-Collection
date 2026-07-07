export function slugifyName(name) {
    return (name ?? '').toLowerCase().replace(/\s+/g, '-')
}

/**
 * Actor identity has no stable ID in the schema (cast_members stores only name +
 * profile_path), so profile_path is the primary key and name is the fallback for
 * actors with no TMDB photo. See docs/adr/0003-actor-identity-by-profile-path.md.
 */
export function slugifyActor(name, profilePath) {
    const nameSlug = slugifyName(name)
    if (!profilePath) return nameSlug
    const fragment = profilePath.replace(/^\//, '').replace(/\.[a-z0-9]+$/i, '')
    return `${nameSlug}-${fragment}`
}

export function generateSlug(title, year) {
    return `${title}-${year}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Extracts the 4-digit release year from a Supabase date string (e.g. "2024-07-15" → 2024).
 * Returns null if the date is absent or unparseable.
 */
export function releaseYear(dateStr) {
    if (!dateStr) return null
    const year = parseInt(dateStr, 10)
    return Number.isFinite(year) ? year : null
}
