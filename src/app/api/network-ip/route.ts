import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    let lanIp = "localhost";

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          lanIp = iface.address;
          break;
        }
      }
      if (lanIp !== "localhost") break;
    }

    return NextResponse.json({ lanIp });
  } catch {
    return NextResponse.json({ lanIp: "localhost" });
  }
}
