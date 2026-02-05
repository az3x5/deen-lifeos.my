
-- Enable HTTP extension
create extension if not exists http with schema extensions;

-- Function to get Quran Foundation Access Token securely
create or replace function get_quran_token()
returns text
language plpgsql
security definer -- Runs with privileges of creator (admin), needed to access networking
as $$
declare
  client_id text := '492b1d4c-9d11-4290-80cc-76c6013c13f3';
  client_secret text := 's0uQJBlpXO8~g25Il_yoUFkECE';
  auth_endpoint text := 'https://prelive-oauth2.quran.foundation/oauth2/token';
  
  auth_header text;
  response http_response;
  response_body jsonb;
  access_token text;
begin
  -- Construct Basic Auth Header
  auth_header := 'Basic ' || encode(convert_to(client_id || ':' || client_secret, 'utf8'), 'base64');

  -- Make POST request
  response := extensions.http((
    'POST', 
    auth_endpoint, 
    ARRAY[http_header('Authorization', auth_header), http_header('Content-Type', 'application/x-www-form-urlencoded')],
    'application/x-www-form-urlencoded',
    'grant_type=client_credentials'
  )::extensions.http_request);

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
