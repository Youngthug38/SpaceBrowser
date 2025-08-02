// Fil: netlify/functions/nasa-proxy.js

exports.handler = async function(event, context) {
    // Hämta den hemliga API-nyckeln från miljövariablerna
    const apiKey = process.env.NASA_API_KEY;

    // Hämta NASA API-slutpunkten från anropet (t.ex. "/planetary/apod")
    const { endpoint, params } = event.queryStringParameters;

    // Bygg den fullständiga URL:en till NASA:s API
    const nasaUrl = `https://api.nasa.gov${endpoint}?api_key=${apiKey}&${params}`;

    try {
        // Importera 'node-fetch' dynamiskt
        const fetch = (await import('node-fetch')).default;

        // Gör anropet till NASA:s API
        const response = await fetch(nasaUrl);
        if (!response.ok) {
            // Om NASA returnerar ett fel, skicka det vidare
            return { statusCode: response.status, body: response.statusText };
        }

        // Läs datan från NASA:s svar
        const data = await response.json();

        // Skicka tillbaka datan till din frontend
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("Proxy error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};