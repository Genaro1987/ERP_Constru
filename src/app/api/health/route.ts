import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    mensagem: "API operante",
    timestamp: new Date().toISOString(),
  });
}
