import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY);

export async function sendInterviewEmail({
  candidateEmail,
  candidateName,
  interviewType,
  interviewDate,
  interviewTime,
  interviewDuration,
  interviewerName,
  googleMeetLink,
  calendarLink,
}: {
  candidateEmail: string;
  candidateName: string;
  interviewType: string;
  interviewDate: string;
  interviewTime: string;
  interviewDuration: string | number;
  interviewerName: string;
  googleMeetLink: string;
  calendarLink?: string;
}) {
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4f46e5;">Interview Scheduled - ${interviewType}</h2>
      <p>Dear ${candidateName},</p>
      <p>We are excited to invite you to an upcoming interview at AI HR Employee.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Type:</strong> ${interviewType}</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Duration:</strong> ${interviewDuration} minutes</p>
        <p><strong>Interviewer:</strong> ${interviewerName}</p>
      </div>

      <p>Please join the interview using the following Google Meet link at the scheduled time:</p>
      <p>
        <a href="${googleMeetLink}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Join Google Meet
        </a>
      </p>

      ${calendarLink ? `<p>You can also view this event on your <a href="${calendarLink}">Google Calendar</a>.</p>` : ""}

      <p>If you need to reschedule or have any questions, please reply to this email.</p>
      <br />
      <p>Best regards,<br/><strong>AI HR Employee Team</strong></p>
    </div>
  `;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: candidateEmail,
    subject: `Interview Scheduled - ${interviewType}`,
    html: emailHtml,
  });
}

export async function sendCancellationEmail({
  candidateEmail,
  candidateName,
  interviewType,
}: {
  candidateEmail: string;
  candidateName: string;
  interviewType: string;
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: candidateEmail,
    subject: `Interview Cancelled - ${interviewType}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #e11d48;">Interview Cancelled</h2>
        <p>Dear ${candidateName},</p>
        <p>Your upcoming ${interviewType} has been cancelled.</p>
        <p>We will be in touch with you shortly with further details or to reschedule.</p>
        <br />
        <p>Best regards,<br/><strong>AI HR Employee Team</strong></p>
      </div>
    `,
  });
}
