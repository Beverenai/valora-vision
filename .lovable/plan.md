

# Secure Resales Online API Credentials

## Problem
The `contact_id` and `api_key` are stored in the `resales_online_config` table which has a public SELECT RLS policy — anyone can read the API credentials from the client.

## Solution
Store credentials as backend secrets (environment variables) accessible only by the edge function. Remove `contact_id` and `api_key` columns from the public config table.

## Changes

### 1. Add secrets via the secrets tool
- `RESALES_CONTACT_ID` — the p1 value
- `RESALES_API_KEY` — the p2 value

### 2. Database migration
- Drop `contact_id` and `api_key` columns from `resales_online_config`
- The table keeps filter settings, sync status, intervals — just no credentials

### 3. Update edge function (`resales-online-sync/index.ts`)
- Read `RESALES_CONTACT_ID` and `RESALES_API_KEY` from `Deno.env.get()` instead of from the config table
- Pass them into the API call params directly
- The `ResalesConfig` type no longer includes credential fields

### 4. Update Admin UI (`src/pages/Admin.tsx`)
- Remove the Contact ID and API Key input fields from the "Add Config" modal
- Remove credential display from config cards
- Add a note in the UI: "API credentials are securely stored in Cloud secrets"
- The modal now only has: Filter type, Province, Sync Interval

## Files Modified
- `supabase/functions/resales-online-sync/index.ts` — read creds from env
- `src/pages/Admin.tsx` — remove credential inputs
- Migration SQL — drop credential columns

