import { NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 400 });
    }

    const companyEmail = process.env.COMPANY_GOOGLE_EMAIL;
    if (!companyEmail) {
      return NextResponse.json({ error: "COMPANY_GOOGLE_EMAIL not set" }, { status: 500 });
    }

    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000);

    // Ensure we have a refresh token (it's only sent on first consent)
    const existing = await prisma.googleIntegration.findUnique({
      where: { email: companyEmail },
    });

    const refreshToken = tokens.refresh_token || existing?.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available. Please reconnect and force consent." },
        { status: 400 }
      );
    }

    await prisma.googleIntegration.upsert({
      where: { email: companyEmail },
      update: {
        accessToken: tokens.access_token,
        refreshToken: refreshToken,
        tokenExpiry: expiryDate,
      },
      create: {
        email: companyEmail,
        accessToken: tokens.access_token,
        refreshToken: refreshToken,
        tokenExpiry: expiryDate,
      },
    });

    // Redirect back to settings
    return NextResponse.redirect(new URL("/settings", request.url));
  } catch (error: any) {
    console.error("Google Callback Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
