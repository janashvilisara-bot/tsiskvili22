-- Supabase Auth Schema
-- Creates the auth schema tables required by GoTrue

SET search_path TO auth;

-- Schema version table
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
  version varchar(14) NOT NULL,
  PRIMARY KEY (version)
);

-- Users table
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id uuid,
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  aud varchar(255),
  role varchar(255),
  email varchar(255) UNIQUE,
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token varchar(255),
  confirmation_sent_at timestamptz,
  recovery_token varchar(255),
  recovery_sent_at timestamptz,
  email_change_token_new varchar(255),
  email_change varchar(255),
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  phone varchar(15) UNIQUE DEFAULT NULL,
  phone_confirmed_at timestamptz,
  phone_change varchar(15) DEFAULT '',
  phone_change_token varchar(255) DEFAULT '',
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current varchar(255) DEFAULT '',
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token varchar(255) DEFAULT '',
  reauthentication_sent_at timestamptz,
  is_sso_user boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (instance_id, lower(email));
CREATE INDEX IF NOT EXISTS users_is_anonymous_idx ON auth.users ((raw_user_meta_data->>'is_anonymous'));

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  instance_id uuid,
  id bigserial NOT NULL,
  token varchar(255),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked boolean,
  created_at timestamptz,
  updated_at timestamptz,
  parent varchar(255),
  session_id uuid,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS refresh_tokens_token_unique ON auth.refresh_tokens (token);
CREATE INDEX IF NOT EXISTS refresh_tokens_instance_id_idx ON auth.refresh_tokens (instance_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens (instance_id, user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_parent_idx ON auth.refresh_tokens (parent);
CREATE INDEX IF NOT EXISTS refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens (session_id, revoked);
CREATE INDEX IF NOT EXISTS refresh_tokens_updated_at_idx ON auth.refresh_tokens (updated_at DESC);

-- Instances table
CREATE TABLE IF NOT EXISTS auth.instances (
  id uuid NOT NULL,
  uuid uuid,
  raw_base_config text,
  created_at timestamptz,
  updated_at timestamptz,
  PRIMARY KEY (id)
);

-- Audit log entries
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  instance_id uuid,
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  payload json,
  created_at timestamptz,
  ip_address varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS audit_logs_instance_id_idx ON auth.audit_log_entries (instance_id);

-- Sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz,
  updated_at timestamptz,
  factor_id uuid,
  aal varchar(10),
  not_after timestamptz,
  refreshed_at timestamptz,
  user_agent text,
  ip inet,
  tag text,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_not_after_idx ON auth.sessions (not_after DESC);
CREATE INDEX IF NOT EXISTS user_id_created_at_idx ON auth.sessions (user_id, created_at);

-- MFA factors table
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friendly_name text,
  factor_type varchar(255) NOT NULL,
  status varchar(255) NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  secret text,
  phone text,
  last_challenged_at timestamptz,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS mfa_factors_user_id_idx ON auth.mfa_factors (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS mfa_factors_user_friendly_name_unique ON auth.mfa_factors (friendly_name, user_id) WHERE factor_type = 'totp';
CREATE INDEX IF NOT EXISTS factor_id_created_at_idx ON auth.mfa_factors (user_id, created_at);

-- MFA challenges table
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  factor_id uuid NOT NULL REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  verified_at timestamptz,
  ip_address inet NOT NULL,
  otp_code text,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS mfa_challenges_factor_id_idx ON auth.mfa_challenges (factor_id);

-- MFA AMRS table
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  session_id uuid NOT NULL REFERENCES auth.sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  authentication_method text NOT NULL,
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims (session_id, authentication_method);

-- SSO providers table
CREATE TABLE IF NOT EXISTS auth.sso_providers (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  resource_id text,
  created_at timestamptz,
  updated_at timestamptz,
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS sso_providers_resource_id_idx ON auth.sso_providers (lower(resource_id));

-- SSO domains table
CREATE TABLE IF NOT EXISTS auth.sso_domains (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  sso_provider_id uuid NOT NULL REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  domain text NOT NULL,
  created_at timestamptz,
  updated_at timestamptz,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS sso_domains_sso_provider_id_idx ON auth.sso_domains (sso_provider_id);
CREATE UNIQUE INDEX IF NOT EXISTS sso_domains_domain_idx ON auth.sso_domains (lower(domain));

-- SAML providers table
CREATE TABLE IF NOT EXISTS auth.saml_providers (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  sso_provider_id uuid NOT NULL REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  entity_id text NOT NULL UNIQUE,
  metadata_xml text NOT NULL,
  metadata_url text,
  attribute_mapping jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  name_id_format text,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS saml_providers_sso_provider_id_idx ON auth.saml_providers (sso_provider_id);

-- SAML relay states table
CREATE TABLE IF NOT EXISTS auth.saml_relay_states (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  sso_provider_id uuid NOT NULL REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  request_id text NOT NULL,
  for_email text,
  redirect_to text,
  created_at timestamptz,
  updated_at timestamptz,
  flow_state_id uuid,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states (sso_provider_id);
CREATE INDEX IF NOT EXISTS saml_relay_states_for_email_idx ON auth.saml_relay_states (for_email);
CREATE INDEX IF NOT EXISTS saml_relay_states_created_at_idx ON auth.saml_relay_states (created_at DESC);

-- Flow state table
CREATE TABLE IF NOT EXISTS auth.flow_state (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid,
  auth_code text NOT NULL,
  code_challenge_method varchar(255) NOT NULL,
  code_challenge text NOT NULL,
  provider_type text NOT NULL,
  provider_access_token text,
  provider_refresh_token text,
  created_at timestamptz,
  updated_at timestamptz,
  authentication_method text NOT NULL,
  auth_code_issued_at timestamptz,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS flow_state_created_at_idx ON auth.flow_state (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_code ON auth.flow_state (auth_code);
CREATE INDEX IF NOT EXISTS idx_user_id_auth_method ON auth.flow_state (user_id, authentication_method);

-- Identities table
CREATE TABLE IF NOT EXISTS auth.identities (
  provider_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities (user_id);
CREATE INDEX IF NOT EXISTS identities_email_idx ON auth.identities (email);
CREATE UNIQUE INDEX IF NOT EXISTS identities_provider_id_provider_unique ON auth.identities (provider_id, provider);

-- One time tokens table
CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_type varchar(255) NOT NULL,
  token_hash text NOT NULL,
  relates_to text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);
CREATE INDEX IF NOT EXISTS one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);
CREATE UNIQUE INDEX IF NOT EXISTS one_time_tokens_user_id_token_type_key ON auth.one_time_tokens (user_id, token_type);

-- Grant permissions to supabase_auth_admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA auth TO supabase_auth_admin;

-- Grant SELECT on auth.users to authenticated and service_role for RLS functions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- Allow authenticator to switch roles
GRANT anon, authenticated, service_role TO authenticator;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON FUNCTIONS TO supabase_auth_admin;

-- Create auth.uid() function
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- Create auth.role() function
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '')::text
$$;

-- Create auth.email() function
CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.email', true), '')::text
$$;

-- Create auth.jwt() function
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true), '{}')::jsonb
$$;

RESET search_path;
