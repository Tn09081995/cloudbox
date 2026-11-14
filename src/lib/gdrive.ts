import { google } from "googleapis";

/**
 * Google Drive Client Helper
 */
export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

export function isGoogleDriveConfigured(): boolean {
  return (
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    !!process.env.GOOGLE_REFRESH_TOKEN
  );
}

export function getDriveClient() {
  const auth = getGoogleOAuthClient();
  if (!auth) return null;
  return google.drive({ version: "v3", auth });
}

/**
 * Initiates a Google Drive Resumable Upload session.
 * The returned session URI allows direct browser-to-Google upload without passing through Vercel.
 */
export async function createGoogleDriveUploadSession(params: {
  name: string;
  mimeType: string;
  size?: number;
}): Promise<string | null> {
  const auth = getGoogleOAuthClient();
  if (!auth) return null;

  const { token } = await auth.getAccessToken();
  if (!token) return null;

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const metadata: { name: string; parents?: string[] } = {
    name: params.name,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type": params.mimeType || "application/octet-stream",
  };

  if (params.size) {
    headers["X-Upload-Content-Length"] = params.size.toString();
  }

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers,
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Drive Upload Session Error:", errorText);
    throw new Error(`Google Drive API error: ${response.statusText}`);
  }

  const uploadUrl = response.headers.get("location");
  return uploadUrl;
}

/**
 * Fetches Google Drive Storage Quota (e.g. 5 TB limit and used bytes)
 */
export async function getGoogleDriveQuota(): Promise<{
  limit: number;
  usage: number;
} | null> {
  try {
    const drive = getDriveClient();
    if (!drive) return null;

    const res = await drive.about.get({
      fields: "storageQuota",
    });

    const quota = res.data.storageQuota;
    if (!quota) return null;

    return {
      limit: parseInt(quota.limit || "5497558138880", 10), // default ~5 TB
      usage: parseInt(quota.usage || "0", 10),
    };
  } catch (err) {
    console.error("Failed to fetch Google Drive quota:", err);
    return null;
  }
}

/**
 * Deletes a file from Google Drive permanently
 */
export async function deleteGoogleDriveFile(fileId: string): Promise<boolean> {
  try {
    const drive = getDriveClient();
    if (!drive) return false;

    await drive.files.delete({
      fileId,
    });
    return true;
  } catch (err) {
    console.error("Failed to delete Google Drive file:", err);
    return false;
  }
}
