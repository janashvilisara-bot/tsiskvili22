-- Create extensions schema and common extensions

CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop and recreate extensions in the extensions schema
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Create pgjwt extension manually if not available
CREATE OR REPLACE FUNCTION extensions.sign(payload json, secret text, algorithm text DEFAULT 'HS256')
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 
    extensions.url_encode(convert_to('{"alg":"' || algorithm || '","typ":"JWT"}', 'utf8')) || '.' ||
    extensions.url_encode(convert_to(payload::text, 'utf8')) || '.' ||
    extensions.url_encode(extensions.hmac(
      extensions.url_encode(convert_to('{"alg":"' || algorithm || '","typ":"JWT"}', 'utf8')) || '.' ||
      extensions.url_encode(convert_to(payload::text, 'utf8')),
      secret,
      'sha256'
    ))
$$;

CREATE OR REPLACE FUNCTION extensions.url_encode(data bytea)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;

CREATE OR REPLACE FUNCTION extensions.url_decode(data text)
RETURNS bytea
LANGUAGE sql
IMMUTABLE
AS $$
  WITH t AS (SELECT translate(data, '-_', '+/') AS decoded)
  SELECT decode(
    decoded || repeat('=', (4 - length(decoded) % 4) % 4),
    'base64'
  )
  FROM t;
$$;

CREATE OR REPLACE FUNCTION extensions.hmac(message text, secret text, algorithm text)
RETURNS bytea
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT extensions.hmac(convert_to(message, 'utf8'), convert_to(secret, 'utf8'), algorithm);
$$;

CREATE OR REPLACE FUNCTION extensions.hmac(message bytea, secret bytea, algorithm text)
RETURNS bytea
LANGUAGE c
IMMUTABLE STRICT
AS '$libdir/pgcrypto', 'pg_hmac';

-- Grant usage
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
