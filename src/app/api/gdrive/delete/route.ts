import { NextResponse } from "next/server";
import { deleteGoogleDriveFile } from "@/lib/gdrive";

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "Thiếu fileId" },
        { status: 400 }
      );
    }

    const success = await deleteGoogleDriveFile(fileId);

    return NextResponse.json({ success });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Không thể xóa tệp Google Drive";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
