-- ==============================================================================
-- CloudBox Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- Table 1: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    quota_bytes BIGINT NOT NULL DEFAULT 1073741824, -- 1 GB default quota
    used_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Table 2: folders
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by owner and parent folder
CREATE INDEX IF NOT EXISTS idx_folders_owner_parent ON public.folders(owner_id, parent_id, deleted_at);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders"
    ON public.folders FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own folders"
    ON public.folders FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own folders"
    ON public.folders FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own folders"
    ON public.folders FOR DELETE
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- Table 3: files
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    size BIGINT NOT NULL CHECK (size >= 0),
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for folder browsing and owner filtering
CREATE INDEX IF NOT EXISTS idx_files_owner_folder ON public.files(owner_id, folder_id, deleted_at);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files"
    ON public.files FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own files"
    ON public.files FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own files"
    ON public.files FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own files"
    ON public.files FOR DELETE
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- Table 4: share_links
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Owner of the file can manage share links
CREATE POLICY "File owners can view their share links"
    ON public.share_links FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.files
            WHERE files.id = share_links.file_id AND files.owner_id = auth.uid()
        )
    );

CREATE POLICY "File owners can insert share links"
    ON public.share_links FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.files
            WHERE files.id = share_links.file_id AND files.owner_id = auth.uid()
        )
    );

CREATE POLICY "File owners can update share links"
    ON public.share_links FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.files
            WHERE files.id = share_links.file_id AND files.owner_id = auth.uid()
        )
    );

CREATE POLICY "File owners can delete share links"
    ON public.share_links FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.files
            WHERE files.id = share_links.file_id AND files.owner_id = auth.uid()
        )
    );

-- Anyone can read an active, unexpired share link by token
CREATE POLICY "Public can view valid share link"
    ON public.share_links FOR SELECT
    USING (
        revoked = FALSE AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
    );

-- ------------------------------------------------------------------------------
-- Triggers and Stored Procedures
-- ------------------------------------------------------------------------------

-- 1. Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, quota_bytes, used_bytes)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        1073741824, -- 1 GB
        0
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Quota tracking: Increase used_bytes when file is added
CREATE OR REPLACE FUNCTION public.handle_file_inserted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET used_bytes = used_bytes + NEW.size,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.owner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_file_inserted ON public.files;
CREATE TRIGGER on_file_inserted
    AFTER INSERT ON public.files
    FOR EACH ROW EXECUTE FUNCTION public.handle_file_inserted();

-- 3. Quota tracking: Decrease used_bytes when file is permanently deleted
CREATE OR REPLACE FUNCTION public.handle_file_deleted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET used_bytes = GREATEST(0, used_bytes - OLD.size),
        updated_at = timezone('utc'::text, now())
    WHERE id = OLD.owner_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_file_deleted ON public.files;
CREATE TRIGGER on_file_deleted
    AFTER DELETE ON public.files
    FOR EACH ROW EXECUTE FUNCTION public.handle_file_deleted();

-- 4. Purge old trash (items soft-deleted more than 30 days ago)
CREATE OR REPLACE FUNCTION public.purge_old_trash()
RETURNS TABLE(purged_files_count INT, purged_folders_count INT) AS $$
DECLARE
    f_count INT;
    d_count INT;
BEGIN
    -- Delete files deleted over 30 days ago
    WITH deleted_files AS (
        DELETE FROM public.files
        WHERE deleted_at IS NOT NULL AND deleted_at < (timezone('utc'::text, now()) - INTERVAL '30 days')
        RETURNING id
    )
    SELECT count(*) INTO f_count FROM deleted_files;

    -- Delete folders deleted over 30 days ago
    WITH deleted_folders AS (
        DELETE FROM public.folders
        WHERE deleted_at IS NOT NULL AND deleted_at < (timezone('utc'::text, now()) - INTERVAL '30 days')
        RETURNING id
    )
    SELECT count(*) INTO d_count FROM deleted_folders;

    RETURN QUERY SELECT f_count, d_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
