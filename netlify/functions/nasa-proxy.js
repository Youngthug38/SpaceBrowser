// Fil: netlify/functions/nasa-proxy.js (uppdaterad version)

exports.handler = async function(event, context) {
    const apiKey = process.env.NASA_API_KEY;
    const { endpoint, params } = event.queryStringParameters;

    // Bygg den fullständiga URL:en till NASA:s API
    // Vi lägger till en '&' bara om det finns parametrar
    const paramString = params ? `&${params}` : '';
    const nasaUrl = `https://api.nasa.gov${endpoint}?api_key=${apiKey}${paramString}`;

    try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(nasaUrl);
        if (!response.ok) {
            return { statusCode: response.status, body: response.statusText };
        }

        // *** NY LOGIK BÖRJAR HÄR ***
        // Kontrollera vilken typ av innehåll NASA skickade
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            // Om det är JSON, hantera det som förut
            const data = await response.json();
            return {
                statusCode: 200,
                body: JSON.stringify(data),
            };
        } else {
            // Om det är något annat (t.ex. en bild), hantera det som binär data
            const buffer = await response.buffer();
            return {
                statusCode: 200,
                headers: { 'Content-Type': contentType }, // Skicka med original-content-type
                body: buffer.toString('base64'), // Skicka tillbaka datan som Base64
                isBase64Encoded: true, // Tala om för Netlify att detta är Base64
            };
        }
        // *** NY LOGIK SLUTAR HÄR ***

    } catch (error) {
        console.error("Proxy error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};

};
