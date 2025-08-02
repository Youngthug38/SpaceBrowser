// This is the serverless function code
exports.handler = async function(event) {
    // Get the NASA API URL from the query parameter
    const { nasaApiUrl } = event.queryStringParameters;
    
    // Get the secret API key from the environment variables
    const apiKey = process.env.NASA_API_KEY;

    // Construct the full URL with the secret key
    const fullUrl = `${nasaApiUrl}&api_key=${apiKey}`;

    try {
        // We need to import a fetch-like library for server-side code
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(fullUrl);
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data from NASA API' })
        };
    }
};