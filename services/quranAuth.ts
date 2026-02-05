
const OAUTH_ENDPOINT = import.meta.env.VITE_QURAN_OAUTH_ENDPOINT;
const CLIENT_ID = import.meta.env.VITE_QURAN_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_QURAN_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export const getQuranAccessToken = async () => {
    // Return cached token if valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        // Use Basic Auth for client credentials
        // Note: Exposing Client Secret in frontend is not recommended for production.
        // Ideally use a backend proxy.
        const authString = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        // params.append('scope', 'read'); 

        const response = await fetch(`${OAUTH_ENDPOINT}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error(`Failed to get access token: ${response.statusText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        // Set expiry to slightly less than actual to be safe (e.g., -5 minutes)
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000;

        console.log("Successfully authenticated with Quran Foundation");
        return accessToken;
    } catch (error) {
        console.error("Quran Foundation Auth Error:", error);
        return null;
    }
};
