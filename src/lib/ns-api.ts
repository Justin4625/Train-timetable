import {NSArrivalsResponse} from "@/types/ns";

const NS_ENDPOINT = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/arrivals";

export async function getArrivals(stationCode: string): Promise<NSArrivalsResponse> {
    const apiKey = process.env.NS_API_KEY;
    if (!apiKey) {
        throw new Error("NS API key is not set in environment variables.");
    }

    const response = await fetch(`${NS_ENDPOINT}?station=${stationCode}`, {
        headers: {
            "Ocp-Apim-Subscription-Key": apiKey,
        },
        cache: "no-store" // Zorg ervoor dat we altijd de meest recente gegevens krijgen
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch NS arrivals (${response.status}): ${response.statusText}. ` +
            `Station code: ${stationCode}. ${errorText ? `Details: ${errorText}` : ''}`
        );
    }

    const result = await response.json();

    // NS API returns { payload: { arrivals: [...], messages: [...] } }
    return {
        arrivals: result.payload?.arrivals || result.arrivals || [],
        messages: result.payload?.messages || result.messages || []
    };
}