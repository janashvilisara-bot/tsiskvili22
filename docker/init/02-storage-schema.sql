-- Supabase Storage Schema
-- Creates the storage schema tables required by Storage API

SET search_path TO storage;

-- Migrations table
CREATE TABLE IF NOT EXISTS storage.migrations (
  id integer PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  hash varchar(40) NOT NULL,
  executed_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  owner uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[],
  owner_id text
);

CREATE INDEX IF NOT EXISTS bname ON storage.buckets (name);

-- Objects table
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  bucket_id text REFERENCES storage.buckets(id),
  name text,
  owner uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
  version text,
  owner_id text,
  user_metadata jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS bucketid_objname ON storage.objects (bucket_id, name);
CREATE INDEX IF NOT EXISTS objects_owner_idx ON storage.objects (owner);
CREATE INDEX IF NOT EXISTS objects_bucket_id_idx ON storage.objects (bucket_id);
CREATE INDEX IF NOT EXISTS name_prefix_search ON storage.objects (name text_pattern_ops);

-- S3 multipart uploads table
CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads (
  id text NOT NULL PRIMARY KEY,
  in_progress_size bigint NOT NULL DEFAULT 0,
  upload_signature text NOT NULL,
  bucket_id text NOT NULL REFERENCES storage.buckets(id),
  key text NOT NULL,
  version text NOT NULL,
  owner_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_metadata jsonb
);

CREATE INDEX IF NOT EXISTS s3_multipart_uploads_bucket_id_idx ON storage.s3_multipart_uploads (bucket_id);

-- S3 multipart upload parts table
CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads_parts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  upload_id text NOT NULL REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE,
  size bigint NOT NULL DEFAULT 0,
  part_number integer NOT NULL,
  bucket_id text NOT NULL REFERENCES storage.buckets(id),
  key text NOT NULL,
  etag text NOT NULL,
  owner_id text,
  version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS s3_multipart_uploads_parts_upload_id_idx ON storage.s3_multipart_uploads_parts (upload_id);

-- Storage functions
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
  _parts text[];
BEGIN
  SELECT string_to_array(name, '/') INTO _parts;
  RETURN _parts[1:array_length(_parts,1)-1];
END;
$$;

CREATE OR REPLACE FUNCTION storage.filename(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  _parts text[];
BEGIN
  SELECT string_to_array(name, '/') INTO _parts;
  RETURN _parts[array_length(_parts,1)];
END;
$$;

CREATE OR REPLACE FUNCTION storage.extension(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  _parts text[];
  _filename text;
BEGIN
  SELECT string_to_array(name, '/') INTO _parts;
  SELECT _parts[array_length(_parts,1)] INTO _filename;
  RETURN split_part(_filename, '.', 2);
END;
$$;

CREATE OR REPLACE FUNCTION storage.search(
  prefix text,
  bucketname text,
  limits int DEFAULT 100,
  levels int DEFAULT 1,
  offsets int DEFAULT 0,
  search text DEFAULT '',
  sortcolumn text DEFAULT 'name',
  sortorder text DEFAULT 'asc'
)
RETURNS TABLE (
  name text,
  id uuid,
  updated_at timestamptz,
  created_at timestamptz,
  last_accessed_at timestamptz,
  metadata jsonb
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY EXECUTE
    'SELECT name, id, updated_at, created_at, last_accessed_at, metadata FROM storage.objects WHERE bucket_id = $1 AND name ILIKE $2 || ''%'' ORDER BY ' ||
    quote_ident(sortcolumn) || ' ' || sortorder || ' LIMIT $3 OFFSET $4'
  USING bucketname, prefix, limits, offsets;
END;
$$;

-- Insert required migrations to prevent storage API from running them
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES
  (0, 'create-migrations-table', 'e18a5e-create-migrations-table', now()),
  (1, 'initialmigration', 'a3f579-initialmigration', now()),
  (2, 'storage-hierarchies', 'a6c834-storage-hierarchies', now()),
  (3, 'pathtoken-column', 'b9c1ed-pathtoken-column', now()),
  (4, 'add-hierarchies-index', 'c7a8f9-add-hierarchies-index', now()),
  (5, 'add-version-column', 'd8b2e1-add-version-column', now()),
  (6, 'add-owner-id-column', 'e9c3f2-add-owner-id-column', now()),
  (7, 'add-user-metadata-column', 'f0d4g3-add-user-metadata-column', now()),
  (8, 'add-s3-multipart-uploads', 'g1e5h4-add-s3-multipart-uploads', now())
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO supabase_storage_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO supabase_storage_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA storage TO supabase_storage_admin;

GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;

RESET search_path;
