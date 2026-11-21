import { NextResponse } from "next/server";
import { isGoogleDriveConfigured, createGoogleDriveUploadSession } from "@/lib/gdrive";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const isConfigured = isGoogleDriveConfigured();

    if (!isConfigured) {
      return NextResponse.json({
        provider: "supabase",
      });
    }

    const { name, mimeType, size } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Tên tệp không hợp lệ" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userEmail =
      user?.email || (user?.id ? `user_${user.id.slice(0, 8)}` : "Demo_User");

    const origin = request.headers.get("origin") || undefined;

    const uploadUrl = await createGoogleDriveUploadSession({
      name,
      mimeType: mimeType || "application/octet-stream",
      size,
      origin,
      userEmail,
    });

    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Không thể tạo phiên tải lên Google Drive" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      provider: "gdrive",
      uploadUrl,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Lỗi khởi tạo tải lên";
    return NextResponse.json(
      { error: errorMsg, provider: "supabase" },
      { status: 500 }
    );
  }
}
