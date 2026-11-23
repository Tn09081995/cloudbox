import { NextRequest, NextResponse } from "next/server";

interface PairedDeviceData {
  id: string;
  name: string;
  model: string;
  os: string;
  type: "ios" | "android" | "tablet" | "desktop";
  isPrimary?: boolean;
  status: "connected";
  batteryLevel: number;
  network: string;
  storageUsed: string;
  syncedStats: {
    photos: number;
    videos: number;
    sizeString: string;
    lastSync: string;
  };
}

interface PairSession {
  code: string;
  createdAt: number;
  status: "pending" | "paired";
  device?: PairedDeviceData;
}

// In-memory pairing store with 15-minute TTL
const pairSessions = new Map<string, PairSession>();

// Cleanup expired sessions older than 15 minutes
function cleanupOldSessions() {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  for (const [code, session] of pairSessions.entries()) {
    if (now - session.createdAt > fifteenMinutes) {
      pairSessions.delete(code);
    }
  }
}

// GET: Check status of a pairing code
export async function GET(req: NextRequest) {
  cleanupOldSessions();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Thiếu mã liên kết (code)" }, { status: 400 });
  }

  const session = pairSessions.get(code);
  if (!session) {
    // If not found yet, create a pending session so mobile client can pair against it
    pairSessions.set(code, {
      code,
      createdAt: Date.now(),
      status: "pending",
    });
    return NextResponse.json({ status: "pending", code });
  }

  if (session.status === "paired" && session.device) {
    return NextResponse.json({
      status: "paired",
      code,
      device: session.device,
    });
  }

  return NextResponse.json({ status: "pending", code });
}

// POST: Confirm pairing from mobile device or simulated action
export async function POST(req: NextRequest) {
  cleanupOldSessions();
  try {
    const body = await req.json();
    const { code, device } = body;

    if (!code) {
      return NextResponse.json({ error: "Thiếu mã liên kết (code)" }, { status: 400 });
    }

    const deviceName = device?.name?.trim() || "Điện thoại di động";
    const deviceModel = device?.model?.trim() || "Smartphone";
    const deviceOs = device?.os?.trim() || "Mobile OS";
    const deviceType = (device?.type as "ios" | "android" | "tablet" | "desktop") || "android";

    const newDevice: PairedDeviceData = {
      id: `dev-${Date.now()}`,
      name: deviceName,
      model: deviceModel,
      os: deviceOs,
      type: deviceType,
      isPrimary: false,
      status: "connected",
      batteryLevel: Math.floor(Math.random() * 20) + 78,
      network: "Wi-Fi (Đã kết nối)",
      storageUsed: "64/256 GB",
      syncedStats: {
        photos: Math.floor(Math.random() * 15) + 5,
        videos: Math.floor(Math.random() * 3) + 1,
        sizeString: `${Math.floor(Math.random() * 200) + 80} MB`,
        lastSync: "Vừa xong",
      },
    };

    pairSessions.set(code, {
      code,
      createdAt: Date.now(),
      status: "paired",
      device: newDevice,
    });

    return NextResponse.json({
      success: true,
      message: "Liên kết thiết bị thành công",
      device: newDevice,
    });
  } catch {
    return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ" }, { status: 400 });
  }
}
