import { google } from "googleapis";
import { prisma } from "./prisma";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
];

export async function getCalendarClient() {
  const companyEmail = process.env.COMPANY_GOOGLE_EMAIL;
  if (!companyEmail) throw new Error("COMPANY_GOOGLE_EMAIL not set in env");

  const integration = await prisma.googleIntegration.findUnique({
    where: { email: companyEmail },
  });

  if (!integration) {
    throw new Error("Google Calendar is not connected. Please connect from Settings.");
  }

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expiry_date: integration.tokenExpiry.getTime(),
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.googleIntegration.update({
        where: { email: companyEmail },
        data: {
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token || integration.accessToken,
          tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
      });
    } else if (tokens.access_token) {
      await prisma.googleIntegration.update({
        where: { email: companyEmail },
        data: {
          accessToken: tokens.access_token,
          tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
      });
    }
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createGoogleCalendarEvent(
  title: string,
  description: string,
  startDateTime: Date,
  endDateTime: Date,
  attendeesEmails: string[]
) {
  const calendar = await getCalendarClient();

  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "UTC",
    },
    attendees: attendeesEmails.map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "email", minutes: 60 },
        { method: "email", minutes: 15 },
      ],
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: "all",
  });

  return response.data;
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  title: string,
  description: string,
  startDateTime: Date,
  endDateTime: Date,
  attendeesEmails: string[]
) {
  const calendar = await getCalendarClient();

  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "UTC",
    },
    attendees: attendeesEmails.map((email) => ({ email })),
  };

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId: eventId,
    requestBody: event,
    sendUpdates: "all",
  });

  return response.data;
}

export async function deleteGoogleCalendarEvent(eventId: string) {
  const calendar = await getCalendarClient();
  
  await calendar.events.delete({
    calendarId: "primary",
    eventId: eventId,
    sendUpdates: "all",
  });
}
