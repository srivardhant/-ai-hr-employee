import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companyEmail = process.env.COMPANY_GOOGLE_EMAIL;
    if (!companyEmail) {
      return NextResponse.json({ status: "NOT_CONFIGURED" });
    }

    const integration = await prisma.googleIntegration.findUnique({
      where: { email: companyEmail },
    });

    if (!integration) {
      return NextResponse.json({ status: "NOT_CONNECTED", email: companyEmail });
    }

    const isExpired = integration.tokenExpiry.getTime() < Date.now();

    return NextResponse.json({
      status: isExpired ? "EXPIRED" : "CONNECTED",
      email: companyEmail,
      lastUpdated: integration.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
