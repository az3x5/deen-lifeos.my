# Domain Configuration Guide

To host your app at `deen.lifeos.my`, follow these steps.

## 1. Frontend (React App on GitHub Pages)

I have verified the project structure and added a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will automatically build and deploy your app when you push to GitHub.

### A. Configure GitHub
1.  Go to your Repository on GitHub -> **Settings**.
2.  Go to **Pages** (sidebar).
3.  Under "Build and deployment", verify Source is "GitHub Actions".
4.  Adding Custom Domain:
    *   In the "Custom domain" field, enter: `deen.lifeos.my`
    *   Click **Save**.
    *   This will create a `CNAME` file in your repo (or you might need to create one manually if the automated process fails, but usually the UI handles it).

### B. Configure DNS (Code/Domain Provider)
Log in to where you bought `lifeos.my` (e.g., Godaddy, Namecheap, Cloudflare).
Add the following record:

| Type  | Name | Value/Target | TTL |
| :--- | :--- | :--- | :--- |
| CNAME | `deen` | `az3x5.github.io` | Auto/3600 |

*(Note: `az3x5` is your GitHub username)*

### C. Repository Secrets
For the build to work, you must add your environment variables to GitHub Secrets:
1.  Go to **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret**.
3.  Add:
    *   `VITE_SUPABASE_URL`: (Your Supabase URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Your Key)
    *   `VITE_GEMINI_API_KEY`: (Your Gemini Key)

---

## 2. Backend (Supabase on VPS)

Currently, your Supabase is accessible via `http://supabasekong...sslip.io`. To use a custom domain like `api.deen.lifeos.my`:

### A. DNS Record
Add an **A Record** pointing to your VPS IP:

| Type | Name | Value |
| :--- | :--- | :--- |
| A | `api.deen` | `76.13.193.146` |

### B. VPS Configuration (Nginx)
You need a reverse proxy on your VPS to handle SSL (HTTPS) and forward requests to Supabase (usually running on internal port 8000).

1.  **Install Nginx & Certbot**:
    ```bash
    sudo apt install nginx
    sudo apt install certbot python3-certbot-nginx
    ```
2.  **Configure Nginx** (e.g., `/etc/nginx/sites-available/supabase`):
    ```nginx
    server {
        server_name api.deen.lifeos.my;
        
        location / {
            proxy_pass http://localhost:8000; # Default Supabase Kong port
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```
3.  **Enable SSL**:
    ```bash
    sudo certbot --nginx -d api.deen.lifeos.my
    ```
4.  **Update Frontend**:
    Once done, update `VITE_SUPABASE_URL` in your secrets to `https://api.deen.lifeos.my`.
