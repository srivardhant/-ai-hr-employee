import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { candidate: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (!interview.candidate?.email) {
      return NextResponse.json({ error: "Candidate has no email address" }, { status: 400 });
    }

    const { createGoogleCalendarEvent, updateGoogleCalendarEvent } = await import("@/lib/google-calendar");
    const { sendInterviewEmail } = await import("@/lib/email-service");

    const startDateTime = new Date(interview.scheduledAt);
    const endDateTime = new Date(startDateTime.getTime() + interview.duration * 60000);
    const attendeesEmails = [interview.candidate.email, process.env.COMPANY_GOOGLE_EMAIL!];

    let eventId = interview.googleEventId;
    let meetLink = interview.googleMeetLink;
    let htmlLink = interview.googleCalendarLink;

    try {
      if (eventId) {
        // Event exists, try to update and resend email
        await updateGoogleCalendarEvent(
          eventId,
          `${interview.type} - ${interview.candidate.name}`,
          `Candidate Name: ${interview.candidate.name}\nCandidate Email: ${interview.candidate.email}\nInterview Type: ${interview.type}\nNotes: ${interview.notes || ""}`,
          startDateTime,
          endDateTime,
          attendeesEmails
        );
      } else {
        // Event doesn't exist, create it
        const eventData = await createGoogleCalendarEvent(
          `${interview.type} - ${interview.candidate.name}`,
          `Candidate Name: ${interview.candidate.name}\nCandidate Email: ${interview.candidate.email}\nInterview Type: ${interview.type}\nNotes: ${interview.notes || ""}`,
          startDateTime,
          endDateTime,
          attendeesEmails
        );
        eventId = eventData.id || null;
        htmlLink = eventData.htmlLink || null;
        meetLink = eventData.hangoutLink || null;
      }

      // Send email
      await sendInterviewEmail({
        candidateEmail: interview.candidate.email,
        candidateName: interview.candidate.name,
        interviewType: interview.type,
        interviewDate: startDateTime.toLocaleDateString(),
        interviewTime: startDateTime.toLocaleTimeString(),
        interviewDuration: interview.duration,
        interviewerName: interview.panelMembers || "AI HR Team",
        googleMeetLink: meetLink || "",
        calendarLink: htmlLink || "",
      });

      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
          googleEventId: eventId,
          googleMeetLink: meetLink,
          googleCalendarLink: htmlLink,
          calendarSyncStatus: "SUCCESS",
          calendarErrorMessage: null,
          location: meetLink || interview.location,
        },
      });

      return NextResponse.json(updatedInterview);
    } catch (e: any) {
      console.error("Manual sync failed:", e);
      
      const failedInterview = await prisma.interview.update({
        where: { id },
        data: {
          calendarSyncStatus: "FAILED",
          calendarErrorMessage: e.message || "Manual sync failed",
        },
      });

      return NextResponse.json(failedInterview, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
