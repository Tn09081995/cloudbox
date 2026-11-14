import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // Optional cron secret authorization check for Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 1. Find all files soft-deleted > 30 days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: oldFiles, error: fetchFilesErr } = await admin
      .from("files")
      .select("id, storage_path")
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (fetchFilesErr) throw fetchFilesErr;

    // 2. Remove files from storage
    let purgedFilesCount = 0;
    if (oldFiles && oldFiles.length > 0) {
      const paths = oldFiles.map((f) => f.storage_path);
      await admin.storage.from("cloudbox").remove(paths);

      // Delete from DB (quota automatically subtracted by Postgres triggers)
      const { error: delFilesErr } = await admin
        .from("files")
        .delete()
        .in(
          "id",
          oldFiles.map((f) => f.id)
        );

      if (delFilesErr) throw delFilesErr;
      purgedFilesCount = oldFiles.length;
    }

    // 3. Find and delete folders soft-deleted > 30 days ago
    const { data: oldFolders, error: fetchFoldersErr } = await admin
      .from("folders")
      .select("id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (fetchFoldersErr) throw fetchFoldersErr;

    let purgedFoldersCount = 0;
    if (oldFolders && oldFolders.length > 0) {
      const { error: delFoldersErr } = await admin
        .from("folders")
        .delete()
        .in(
          "id",
          oldFolders.map((f) => f.id)
        );

      if (delFoldersErr) throw delFoldersErr;
      purgedFoldersCount = oldFolders.length;
    }

    return NextResponse.json({
      success: true,
      purgedFiles: purgedFilesCount,
      purgedFolders: purgedFoldersCount,
      message: `Đã dọn sạch ${purgedFilesCount} tệp và ${purgedFoldersCount} thư mục quá hạn 30 ngày.`,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Đã xảy ra lỗi khi dọn dẹp thùng rác";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
