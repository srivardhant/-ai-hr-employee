import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { interviewSchema } from "@/lib/validators";
import { ZodError } from "zod";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        candidate: {
          select: { name: true, email: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(interviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = interviewSchema.parse(body);

    const interview = await prisma.interview.create({
      data: {
        candidateId: validated.candidateId,
        scheduledAt: new Date(validated.scheduledAt),
        duration: validated.duration,
        type: validated.type,
        panelMembers: validated.panelMembers,
        location: validated.location || "Google Meet",
        status: "SCHEDULED",
        notes: validated.notes || "",
      },
    });

    // Fetch candidate to get email
    const candidate = await prisma.candidate.findUnique({
      where: { id: validated.candidateId },
    });

    // Update candidate status to INTERVIEW
    if (candidate) {
      await prisma.candidate.update({
        where: { id: validated.candidateId },
        data: { status: "INTERVIEW" },
      });
    }

    let syncStatus = "PENDING";
    let syncError = null;
    let eventId = null;
    let meetLink = null;
    let htmlLink = null;

    const startDateTime = new Date(validated.scheduledAt);

    // Always create the Google Calendar event + Meet link immediately on scheduling
    if (candidate?.email) {
      try {
        const { createGoogleCalendarEvent } = await import("@/lib/google-calendar");
        const { sendInterviewEmail } = await import("@/lib/email-service");

        const endDateTime = new Date(startDateTime.getTime() + validated.duration * 60000);
        const attendeesEmails = [candidate.email, process.env.COMPANY_GOOGLE_EMAIL!];

        const eventData = await createGoogleCalendarEvent(
          `${validated.type} - ${candidate.name}`,
          `Candidate Name: ${candidate.name}\nCandidate Email: ${candidate.email}\nInterview Type: ${validated.type}\nNotes: ${validated.notes || ""}`,
          startDateTime,
          endDateTime,
          attendeesEmails
        );

        eventId = eventData.id;
        htmlLink = eventData.htmlLink;
        meetLink = eventData.hangoutLink || null;
        syncStatus = "SUCCESS";

        // Send confirmation email to candidate
        try {
          await sendInterviewEmail({
            candidateEmail: candidate.email,
            candidateName: candidate.name,
            interviewType: validated.type,
            interviewDate: startDateTime.toLocaleDateString(),
            interviewTime: startDateTime.toLocaleTimeString(),
            interviewDuration: validated.duration,
            interviewerName: validated.panelMembers || "AI HR Team",
            googleMeetLink: meetLink || "",
            calendarLink: htmlLink || "",
          });
        } catch (emailErr: any) {
          console.error("Email sending failed but calendar sync succeeded:", emailErr);
        }

      } catch (e: any) {
        console.error("Google Integration Failed:", e);
        syncStatus = "FAILED";
        syncError = e.message || "Failed to sync with Google Calendar";
      }
    } else {
      syncStatus = "FAILED";
      syncError = "Candidate has no email address";
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interview.id },
      data: {
        googleEventId: eventId,
        googleMeetLink: meetLink,
        googleCalendarLink: htmlLink,
        calendarSyncStatus: syncStatus,
        calendarErrorMessage: syncError,
        location: meetLink || validated.location || "Google Meet",
      },
      include: {
        candidate: {
          select: { name: true, email: true },
        }
      }
    });

    return NextResponse.json(updatedInterview);
  } catch (error: any) {
    console.error("Interview scheduling POST error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to schedule interview" },
      { status: 400 }
    );
  }
}
