export const mpaaGroupOptions = [
    { value: 'family', label: 'Family Friendly', ratings: ['G', 'PG'] },
    { value: 'teens', label: 'Teens & Up', ratings: ['PG-13', 'TV-14'] },
    { value: 'mature', label: 'Mature', ratings: ['R', 'NC-17', 'TV-MA'] },
    { value: 'unrated', label: 'Unrated', ratings: ['NR', 'Unrated'] },
]

export const sortOptions = [
    { value: 'acquired-desc', label: 'Recently Acquired' },
    { value: 'acquired-asc', label: 'Oldest Acquired' },
    { value: 'title-asc', label: 'Title A–Z' },
    { value: 'title-desc', label: 'Title Z–A' },
    { value: 'year-desc', label: 'Newest Release' },
    { value: 'year-asc', label: 'Oldest Release' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'rating-asc', label: 'Lowest Rated' },
]

export const watchedOptions = [
    { value: 'fade', label: 'Fade' },
    { value: 'show', label: 'Show' },
]

export const ignoredOptions = [
    { value: 'hide', label: 'Hide' },
    { value: 'show', label: 'Show' },
]
