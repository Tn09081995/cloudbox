import { NextResponse } from "next/server";
import { isGoogleDriveConfigured, getGoogleDriveQuota } from "@/lib/gdrive";

export async function GET() {
  const configured = isGoogleDriveConfigured();

  if (!configured) {
    return NextResponse.json({
      connected: false,
    });
  }

  const quota = await getGoogleDriveQuota();

  return NextResponse.json({
    connected: true,
    quota: quota || {
      limit: 5497558138880, // 5 TB
      usage: 0,
    },
  });
}
