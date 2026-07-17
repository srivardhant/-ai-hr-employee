import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { interviewSchema } from "@/lib/validators";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = interviewSchema.parse(body);

    const existingInterview = await prisma.interview.findUnique({
      where: { id },
      include: { candidate: true },
    });

    if (!existingInterview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const startDateTime = new Date(validated.scheduledAt);
    const endDateTime = new Date(startDateTime.getTime() + validated.duration * 60000);

    let syncStatus = existingInterview.calendarSyncStatus;
    let syncError = existingInterview.calendarErrorMessage;

    if (existingInterview.googleEventId && existingInterview.candidate?.email) {
      try {
        const { updateGoogleCalendarEvent } = await import("@/lib/google-calendar");
        const { sendInterviewEmail } = await import("@/lib/email-service");

        const attendeesEmails = [existingInterview.candidate.email, process.env.COMPANY_GOOGLE_EMAIL!];
        
        await updateGoogleCalendarEvent(
          existingInterview.googleEventId,
          `${validated.type} - ${existingInterview.candidate.name}`,
          `Candidate Name: ${existingInterview.candidate.name}\nCandidate Email: ${existingInterview.candidate.email}\nInterview Type: ${validated.type}\nNotes: ${validated.notes || ""}`,
          startDateTime,
          endDateTime,
          attendeesEmails
        );

        // Send updated email
        await sendInterviewEmail({
          candidateEmail: existingInterview.candidate.email,
          candidateName: existingInterview.candidate.name,
          interviewType: validated.type,
          interviewDate: startDateTime.toLocaleDateString(),
          interviewTime: startDateTime.toLocaleTimeString(),
          interviewDuration: validated.duration,
          interviewerName: validated.panelMembers || "AI HR Team",
          googleMeetLink: existingInterview.googleMeetLink || "",
          calendarLink: existingInterview.googleCalendarLink || "",
        });

        syncStatus = "SUCCESS";
        syncError = null;
      } catch (e: any) {
        console.error("Failed to update Google event:", e);
        syncStatus = "FAILED";
        syncError = e.message || "Failed to update Google event";
      }
    }

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        scheduledAt: startDateTime,
        duration: validated.duration,
        type: validated.type,
        panelMembers: validated.panelMembers,
        location: existingInterview.googleMeetLink || validated.location,
        notes: validated.notes,
        calendarSyncStatus: syncStatus,
        calendarErrorMessage: syncError,
      },
      include: { candidate: { select: { name: true, email: true } } },
    });

    return NextResponse.json(updatedInterview);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const existingInterview = await prisma.interview.findUnique({
      where: { id },
      include: { candidate: true },
    });

    if (!existingInterview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (existingInterview.googleEventId && existingInterview.candidate?.email) {
      try {
        const { deleteGoogleCalendarEvent } = await import("@/lib/google-calendar");
        const { sendCancellationEmail } = await import("@/lib/email-service");

        await deleteGoogleCalendarEvent(existingInterview.googleEventId);
        await sendCancellationEmail({
          candidateEmail: existingInterview.candidate.email,
          candidateName: existingInterview.candidate.name,
          interviewType: existingInterview.type,
        });
      } catch (e: any) {
        console.error("Failed to delete Google event or send email:", e);
        // We still proceed to delete/cancel the interview in the database
      }
    }

    await prisma.interview.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
