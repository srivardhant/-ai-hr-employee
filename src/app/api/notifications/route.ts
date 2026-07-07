import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let whereClause = {};
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        whereClause = { userId: user.id };
      }
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let whereClause = {};
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        whereClause = { userId: user.id };
      }
    }

    await prisma.notification.updateMany({
      where: { ...whereClause, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notifications API update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, message, type, email, link } = await request.json();

    let userId: string | null = null;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      // Find admin or hr
      const user = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "HR"] } },
      });
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "No user found to notify" }, { status: 404 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "INFO",
        link,
      },
    });

    return NextResponse.json(notification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
