import { NextResponse } from "next/server";
import { oauth2Client, GOOGLE_SCOPES } from "@/lib/google-calendar";

export async function GET() {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_SCOPES,
      prompt: "consent", // Force consent to get refresh token
    });

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
