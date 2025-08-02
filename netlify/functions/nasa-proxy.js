// Fil: netlify/functions/nasa-proxy.js (ännu mer robust version)

exports.handler = async function(event, context) {
    const apiKey = process.env.NASA_API_KEY;
    const { endpoint, params = '' } = event.queryStringParameters;

    const paramString = params ? `&${params}` : '';
    const nasaUrl = `https://api.nasa.gov${endpoint}?api_key=${apiKey}${paramString}`;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(nasaUrl);

        if (!response.ok) {
            return { statusCode: response.status, body: response.statusText };
        }

        // Hämta ALLTID svaret som en buffer först. Detta fungerar för både text och bilder.
        const buffer = await response.buffer();

        // FÖRSÖK att tolka bufferten som JSON.
        try {
            const data = JSON.parse(buffer.toString());
            // Om det lyckas, skicka tillbaka det som JSON.
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            };
        } catch (e) {
            // Om det misslyckas, var det inte JSON. Anta att det är en bild.
            return {
                statusCode: 200,
                headers: { 'Content-Type': response.headers.get('content-type') },
                body: buffer.toString('base64'),
                isBase64Encoded: true,
            };
        }
    } catch (error) {
        console.error("Proxy error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};