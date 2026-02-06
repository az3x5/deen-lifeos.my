
-- 1. Enable HTTP extension in 'extensions' schema
create extension if not exists "http" with schema extensions;

-- 2. Create the function securely
create or replace function get_quran_token()
returns text
language plpgsql
security definer -- Runs with privileges of creator (admin)
set search_path = extensions, public -- Ensure http types are visible
as $$
declare
  client_id text := '50f20b0c-1ffa-485b-b495-fdeeaece65a9';
  client_secret text := 'o5kkhl1gfvYgePGR.kQB9Qpv9m';
  auth_endpoint text := 'https://oauth2.quran.foundation/oauth2/token';
  
  auth_header text;
  response http_response;
  response_body jsonb;
  access_token text;
begin
  -- Construct Basic Auth Header
  auth_header := 'Basic ' || encode(convert_to(client_id || ':' || client_secret, 'utf8'), 'base64');

  -- Make POST request
  response := http((
    'POST', 
    auth_endpoint, 
    ARRAY[http_header('Authorization', auth_header), http_header('Content-Type', 'application/x-www-form-urlencoded')],
    'application/x-www-form-urlencoded',
    'grant_type=client_credentials'
  )::http_request);

  -- Check status
  if response.status != 200 then
    raise exception 'Auth Failed: % %', response.status, response.content;
  end if;

  -- Parse JSON
  response_body := response.content::jsonb;
  access_token := response_body->>'access_token';

  return access_token;
end;
$$;

-- 3. GRANT PERMISSIONS (Critical for 401 Fix)
revoke all on function get_quran_token() from public;
grant execute on function get_quran_token() to anon;
grant execute on function get_quran_token() to authenticated;
grant execute on function get_quran_token() to service_role;
