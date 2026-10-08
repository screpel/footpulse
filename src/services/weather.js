// src/services/weather.js

export async function getHistoricalWeather(dateStr, timeStr = '18:00', ville = 'Bondues') {
    try {
        // 1. Géocodage de la ville
        let lat = 50.69
        let lon = 3.09

        if (ville && ville.toLowerCase() !== 'bondues') {
            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ville)}&count=1&language=fr&format=json`
            )
            const geoData = await geoRes.json()
            if (geoData.results && geoData.results.length > 0) {
                lat = geoData.results[0].latitude
                lon = geoData.results[0].longitude
            }
        }

        // 2. Récupération de l'historique météo à la date et heure ciblées
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,weather_code&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) return null
        const data = await res.json()

        const hourIndex = parseInt(timeStr.split(':')[0], 10) || 18
        const temp = data.hourly?.temperature_2m?.[hourIndex] ?? null
        const code = data.hourly?.weather_code?.[hourIndex] ?? 0

        let weatherDesc = 'Ensoleillé'
        if (code > 0 && code <= 3) weatherDesc = 'Éclaircies'
        else if (code >= 51 && code <= 67) weatherDesc = 'Pluie'
        else if (code >= 71 && code <= 77) weatherDesc = 'Neige'
        else if (code >= 80) weatherDesc = 'Averses'

        return { temperature: temp, condition: weatherDesc }
    } catch (e) {
        console.error('Erreur météo:', e)
        return null
    }
}