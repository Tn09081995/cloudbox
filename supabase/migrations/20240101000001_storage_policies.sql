-- ==============================================================================
-- CloudBox Storage Bucket & Storage Row Level Security (RLS)
-- ==============================================================================

-- 1. Create the private bucket 'cloudbox' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cloudbox',
    'cloudbox',
    false, -- Private bucket: downloads and previews require signed URLs
    1073741824, -- 1 GB per file max
    NULL -- Allow all mime types
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 1073741824;

-- 2. Storage RLS Policies for the 'cloudbox' bucket
-- Storage paths must strictly follow: {owner_id}/{folder_or_root}/{file_id_or_unique_name}
-- storage.foldername(name)[1] extracts the first path component (which must equal auth.uid()::text)

-- Policy: Users can view/read their own files in storage
CREATE POLICY "Users can read own storage files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'cloudbox' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can upload files into their own folder in storage
CREATE POLICY "Users can upload own storage files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'cloudbox' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can update their own storage files
CREATE POLICY "Users can update own storage files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'cloudbox' AND
        (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'cloudbox' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can delete their own storage files
CREATE POLICY "Users can delete own storage files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'cloudbox' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
