# Enabling SSL for Supabase on Coolify

Since you are using **Coolify**, you can easily enable HTTPS for your Supabase instance without manual Nginx configuration!

## Steps

1.  **Login to your Coolify Dashboard**.
    *   URL: http://76.13.193.146:something (check your Coolify install URL)
    
2.  **Navigate to your Supabase Project**.
    *   Find the Supabase validation service or the specific Supabase component (Kong).

3.  **Add Domain**:
    *   In the "Configuration" or "Settings" tab for Supabase.
    *   Find the **Domains** or **URL** field.
    *   Enter your custom domain: `https://api.deen.lifeos.my`
    *   **Click Save**.

4.  **Coolify Auto-Magic**:
    *   Coolify handles SSL generation (via Let's Encrypt) automatically when you add a domain.
    *   Wait a few minutes for the certificate to issue.

5.  **DNS (Important)**:
    *   Ensure you have added the **A Record** for `api.deen` -> `76.13.193.146` in your domain provider **before** doing step 3, otherwise SSL generation will fail.

6.  **Update GitHub Secrets**:
    *   Once you can access `https://api.deen.lifeos.my/rest/v1/`, update your `VITE_SUPABASE_URL` in GitHub Secrets to this new HTTPS URL.
