import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/gdrive";
import { Readable } from "stream";

interface RouteProps {
  params: Promise<{ fileId: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";

    const drive = getDriveClient();
    if (!drive) {
      return NextResponse.json(
        { error: "Google Drive chưa được cấu hình" },
        { status: 500 }
      );
    }

    // 1. Get file metadata
    const metaRes = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size",
    });

    const fileMeta = metaRes.data;

    // 2. Fetch file content stream
    const fileRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const stream = fileRes.data as unknown as Readable;

    const headers = new Headers();
    if (fileMeta.mimeType) {
      headers.set("Content-Type", fileMeta.mimeType);
    }
    if (fileMeta.size) {
      headers.set("Content-Length", fileMeta.size);
    }

    const encodedName = encodeURIComponent(fileMeta.name || "file");
    headers.set(
      "Content-Disposition",
      `${isDownload ? "attachment" : "inline"}; filename*=UTF-8''${encodedName}`
    );

    // Convert node stream to web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Không thể tải tệp từ Google Drive";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
