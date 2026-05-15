export function slugifyName(name) {
    return (name ?? '').toLowerCase().replace(/\s+/g, '-')
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
