

# Add Resales Online API Secrets

## What
Add two secrets to the project so the edge function can authenticate with the Resales Online V6 API:

1. **RESALES_CONTACT_ID** — your Contact ID (p1 parameter)
2. **RESALES_API_KEY** — your API key (p2 parameter)

## How
Use the `add_secret` tool to prompt you for each value. Once added, the `resales-online-sync` edge function will read them via `Deno.env.get()`.

## After Adding
We can test the sync by calling the edge function to verify the API connection works.

