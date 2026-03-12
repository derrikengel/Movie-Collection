export function nowLocal() {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
}

export function toLocalDatetime(isoString) {
    if (!isoString) return nowLocal()
    const d = new Date(isoString)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
}
