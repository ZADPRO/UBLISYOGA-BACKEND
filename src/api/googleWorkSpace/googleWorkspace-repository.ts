import { calendar } from "@googleapis/calendar";
import { admin } from "@googleapis/admin";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime, formatTimestamp } from "../../helper/common";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { getAttendData } from "../../googleWorkspace/googleAttendance";

import {
  googleAuth,
  convertToGoogleMeetISO,
} from "../../googleWorkspace/googleAuth";
// const adminReports = google.admin({ version: "reports_v1", auth });// clearScreenDown;
import {
  getMeetingLinkType,
  insertMeetingData,
  getMeetingDetails,
  branch,
  getStudentList,
  deleteMeeting,
} from "./query";
import { executeQuery } from "../../helper/db";
import { generateToken, decodeToken } from "../../helper/token";
import { error } from "console";
// import { clearScreenDown } from "readline";

export class GoogleWorkSpaceRepository {
  public async MeetingLinkTypeV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const getMeetingLinkTypeResult = await executeQuery(
        getMeetingLinkType,
        []
      );
      const getBranch = await executeQuery(branch, []);
      return encrypt(
        {
          success: true,
          message: "Meeting Link Type Passed Successfully",
          token: token,
          MeetingType: getMeetingLinkTypeResult,
          branch: getBranch,
        },
        true
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Meeting Type Failed",
          error: error.message,
        },
        true
      );
    }
  }
  public async CreateMeetingV11(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    try {
      const timeZone = "Asia/Kolkata";

      const startDateStr = userData.startDateStr;
      const endDateStr = userData.endDateStr;
      const startTimeStr = userData.startTimeStr;
      const endTimeStr = userData.endTimeStr;

      const startDateTime = convertToGoogleMeetISO(startDateStr, startTimeStr);
      const endDateTime = convertToGoogleMeetISO(startDateStr, endTimeStr);

      const res = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary: userData.title,
          description: userData.description,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: timeZone,
          },
          attendees: [{ email: "loganathanvj123@gmail.com" }],
          conferenceData: {
            createRequest: {
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
              requestId: `ublisyoga-${startDateStr.replace(/\//g, "")}`,
            },
          },
        },
      });

      return encrypt(
        {
          success: true,
          message: "Meeting Created Successfully",
          meetingLink: res.data.hangoutLink || "No Link Available",
        },
        false
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Meeting Creation Failed",
          error: error.message,
        },
        false
      );
    }
  }
  public async CreateMeetingV1(
    userData: any,
    decodedToken: any,
    meetingType: number
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      console.log("userData", userData);
      const timeZone = "Asia/Kolkata";

      const startDateStr = userData.startDateStr;
      const startTimeStr = userData.startTimeStr;
      const endDateStr = userData.endDateStr;
      const endTimeStr = userData.endTimeStr;

      const startDateTime = convertToGoogleMeetISO(startDateStr, startTimeStr);
      const endDateTime = convertToGoogleMeetISO(startDateStr, endTimeStr);

      const endDate = convertToGoogleMeetISO(endDateStr, endTimeStr);

      const recurrenceEndDate = new Date(endDate);
      const recurrenceUntil =
        recurrenceEndDate.toISOString().replace(/[-:]/g, "").split(".")[0] +
        "Z";
      const res = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        sendUpdates: "all",
        requestBody: {
          summary: userData.title,
          description: userData.description,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: timeZone,
          },
          attendees: userData.attendees,
          extendedProperties: {
            private: {
              branch: String(userData.branchId),
              meetingType: String(userData.meetingType),
            },
          },

          recurrence: [`RRULE:FREQ=DAILY;UNTIL=${recurrenceUntil}`],
          conferenceData: {
            createRequest: {
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },

              requestId: `ublisyoga-${endDateStr.replace(/-/g, "")}`,
            },
          },
        },
      });
      if (res.data) {
        const params = [
          res.data.id,
          userData.meetingType,
          userData.branchId,
          res.data.hangoutLink,
          CurrentTime(),
          userData.startDateStr,
          userData.endDateStr,
          userData.startTimeStr,
          userData.endTimeStr,
          userData.title,
          userData.description,
          res.data.hangoutLink
            ?.split("/")[3]
            ?.replace(/-/g, "")
            .toUpperCase() ?? "UnKnown",
        ];

        await executeQuery(insertMeetingData, params);
      } else {
        throw error;
      }

      return encrypt(
        {
          success: true,
          message: "Google Meet Link Created Successfully",
          token: token,
          res: res,
        },
        true
      );
    } catch (error: any) {
      return encrypt(
        {
          success: false,
          message: "Recurring Meeting Creation Failed",
          token: token,
        },
        true
      );
    }
  }
  public async MeetingListV1(
    userData: any,
    decodedToken: any,
    meetingType: number
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const MeetingData = await executeQuery(getMeetingDetails, [
        decodedToken.branch,
      ]);
      return encrypt(
        {
          success: true,
          message: "Google Meet list Passed Successfully",
          token: token,
          data: MeetingData,
        },
        true
      );
    } catch (error: any) {
      return encrypt(
        {
          success: false,
          message: "Recurring Meeting Creation Failed",
          token: token,
        },
        true
      );
    }
  }
  public async DeleteMeetingV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    console.log("userData", userData);
    try {
      await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.delete({
        calendarId: "primary",
        eventId: userData.meetingId,
      });

      await executeQuery(deleteMeeting, [userData.meetingId]);

      return encrypt(
        {
          success: true,
          message: "Meeting Deleted Successfully",
          token: token,
        },
        true
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Deleting Meeting Failed",
          token: token,
        },
        true
      );
    }
  }
  public async DeleteAllMeetingV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const res = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.list({
        calendarId: "primary",
        maxResults: 1000,
        singleEvents: true,
      });

      const events = res.data.items || [];

      if (events.length === 0) {
        return encrypt(
          {
            success: true,
            message: "No Meetings Found to Delete",
            token: token,
          },
          false
        );
      }

      for (const event of events) {
        if (event.id) {
          await calendar({
            version: "v3",
            auth: googleAuth,
          }).events.delete({
            calendarId: "primary",
            eventId: event.id,
          });
        }
      }

      return encrypt(
        {
          success: true,
          message: "Meeting Deleted Successfully",
          token: token,
        },
        false
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Meeting Creation Failed",
          error: error.message,
          token: token,
        },
        false
      );
    }
  }
  public async GetMeetingV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const res = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.list({
        calendarId: "primary",
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });
      const count = res.data.items?.length || 0;
      return encrypt(
        {
          success: true,
          message: "Fetched Meetings Successfully",
          count: res.data.items?.length || 0,
          Data: res.data.items,
          token: token,
        },
        false
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Failed to fetch meetings",
          error: error.message,
          token: token,
        },
        false
      );
    }
  }
  // public async GetMeetingV1(userData: any, decodedToken: any): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);

  //   try {
  //     const admin = google.admin({
  //       version: "reports_v1",
  //       auth: googleAuth, // Use your Google Auth client
  //     });

  //     const res = await admin.activities.list({
  //       userKey: "all", // Fetch logs for all users
  //       applicationName: "meet", // Get Meet activity logs
  //       maxResults: 100,
  //     });

  //     const logs = res.data.items || [];

  //     const attendanceDetails = logs.map((item: any) => {
  //       return {
  //         user: item.actor?.email || "Unknown",
  //         joinedTime: item.id?.time || "No Time Data",
  //         eventName: item.events?.[0]?.name || "Unknown Event",
  //         duration: item.events?.[0]?.parameters?.find((p: any) => p.name === "duration")?.intValue || 0,
  //       };
  //     });

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Fetched Meeting Attendance Successfully",
  //         count: logs.length,
  //         Data: attendanceDetails,
  //         token: token,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.error("Google Meet API Error:", error);
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Failed to fetch meeting attendance",
  //         error: error.message,
  //         token: token,
  //       },
  //       false
  //     );
  //   }
  // }
  // public async GetMeetingV1(userData: any, decodedToken: any): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);

  //   try {
  //     const admin = google.admin({
  //       version: "reports_v1",
  //       auth: googleAuth, // Use your Google Auth client
  //     });

  //     const res = await admin.activities.list({
  //       userKey: "all", // Fetch logs for all users
  //       applicationName: "meet", // Get Meet activity logs
  //       maxResults: 100,
  //     });

  //     const logs = res.data.items || [];

  //     const meetingIDs = logs.map((item: any) => {
  //       return {
  //         user: item.actor?.email || "Unknown",
  //         meetingID:
  //           item.events?.[0]?.parameters?.find(
  //             (p: any) => p.name === "meeting_code"
  //           )?.value || "No Meeting ID",
  //         eventName: item.events?.[0]?.name || "Unknown Event",
  //         joinedTime: item.id?.time || "No Time Data",
  //       };
  //     });

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Fetched Meeting IDs Successfully",
  //         count: meetingIDs.length,
  //         Data: meetingIDs,
  //         token: token,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.error("Google Meet API Error:", error);
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Failed to fetch meeting IDs",
  //         error: error.message,
  //         token: token,
  //       },
  //       false
  //     );
  //   }
  // }

  public async GetMembersInMeetingV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const res = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.get({
        calendarId: "primary",
        eventId: userData.meetingId,
      });
      const data = res.data.attendees || [];

      const attendees = await executeQuery(getStudentList, [
        JSON.stringify(data),
      ]);

      return encrypt(
        {
          success: true,
          message: "Fetched students in meeting Link",
          Data: attendees,
          token: token,
          GetData: res,
        },
        true
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Failed to fetch student in meeting Link",
          token: token,
        },
        true
      );
    }
  }
  public async AddMembersInMeetingV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const eventRes = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.get({
        calendarId: "primary",
        eventId: userData.meetingId,
      });

      const event = eventRes.data;

      if (!event) {
        return encrypt(
          {
            success: false,
            message: "Meeting Not Found",
            token: token,
          },
          true
        );
      } else {
        const attendees = event.attendees || [];
        console.log("attendees", attendees);
        const newEmails = userData.studentEmails || [];
        console.log("newEmails", newEmails);

        const emailsToAdd = newEmails.filter(
          (email: string) => !attendees.some((att) => att.email === email)
        );
        console.log("emailsToAdd", emailsToAdd);

        console.log("emailsToAdd.length", emailsToAdd.length);
        if (emailsToAdd.length === 0) {
          return encrypt(
            {
              success: false,
              message: "All students are already added to the meeting",
              token: token,
            },
            true
          );
        }

        emailsToAdd.forEach((email: string) => attendees.push({ email }));

        await calendar({
          version: "v3",
          auth: googleAuth,
        }).events.update({
          calendarId: "primary",
          eventId: userData.meetingId,
          requestBody: {
            ...event,
            attendees,
          },
        });
      }

      return encrypt(
        {
          success: true,
          message: "Students Added Successfully",
          token: token,
        },
        true
      );
    } catch (error: any) {
      console.error("Google Meet API Error:", error);
      return encrypt(
        {
          success: false,
          message: "Failed to add students to the meeting",
          token: token,
        },
        true
      );
    }
  }

  public async RemoveMemberFromMeetingV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    console.log(" -> Line Number ----------------------------------- 541");
    console.log("userData", userData);
    try {
      const eventRes = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.get({
        calendarId: "primary",
        eventId: userData.meetingId,
      });

      const event = eventRes.data;
      if (!event) {
        return encrypt(
          {
            success: false,
            message: "Meeting Not Found",
            token: token,
          },
          false
        );
      } else {
        let attendees = event.attendees || [];
        if (!attendees.some((att) => att.email === userData.studentEmail)) {
          return encrypt(
            {
              success: false,
              message: "Student is not in the meeting",
              token: token,
            },
            false
          );
        } else {
          attendees = attendees.filter(
            (att) => att.email !== userData.studentEmail
          );

          await calendar({
            version: "v3",
            auth: googleAuth,
          }).events.update({
            calendarId: "primary",
            eventId: userData.meetingId,
            requestBody: {
              ...event,
              attendees,
            },
          });
        }
      }

      return encrypt(
        {
          success: true,
          message: "Student Removed Successfully",
          token: token,
        },
        false
      );
    } catch (error: any) {
      return encrypt(
        {
          success: false,
          message: "Failed to remove student from meeting",
          token: token,
        },
        false
      );
    }
  }
  // public async GetMeetingAttendanceV1(
  //   userData: any,
  //   decodedToken: any
  // ): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);
  //   try {
  //     const res = await admin({
  //       version: "reports_v1",
  //       auth: googleAuth,
  //     }).activities.list({
  //       userKey: "all",
  //       applicationName: "meet",
  //       eventName: "call_ended",
  //       filters: `meeting_code==${userData.meetingId}`,
  //       maxResults: 1000,
  //     });
  //     if (!res.data.items || res.data.items.length === 0) {
  //       return {
  //         success: false,
  //         message: "No attendance data found for this meeting.",
  //       };
  //     }

  //     const attendanceDetails =
  //       res.data.items?.map((item) => {
  //         const params = (item as any).parameters; // Type assertion

  //         return {
  //           user: item.actor?.email || "Unknown",
  //           joinedTime: item.id?.time || "N/A",
  //           duration:
  //             params?.find((p: any) => p.name === "duration")?.intValue || 0,
  //         };
  //       }) || [];

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Student Attendance Data",
  //         token: token,
  //         Data: attendanceDetails,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.log("error line -------- 671", error);
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Failed to get Students Attendance Data",
  //         token: token,
  //       },
  //       false
  //     );
  //   }
  // }
  // public async GetMeetingAttendanceV1(
  //   userData: any,
  //   decodedToken: any
  // ): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);
  //   try {
  //     const adminSDK = google.admin({
  //       version: "reports_v1",
  //       auth: googleAuth,
  //     });
  //     const targetDate = new Date(userData.date);
  //     console.log("targetDate", targetDate);

  //     console.log(" -> Line Number ----------------------------------- 815");
  //     const startOfToday = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
  //     const endOfToday = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

  //     const res = await adminSDK.activities.list({
  //       userKey: "all",
  //       applicationName: "meet",
  //       eventName: "call_ended",
  //       startTime: startOfToday,
  //       endTime: endOfToday,
  //       filters: `meeting_code==${userData.meetingId}`, // Apply meeting code filter
  //       maxResults: 1000,
  //     } as any); // Temporarily bypass type errors

  //     if (!res.data.items || res.data.items.length === 0) {
  //       return {
  //         success: false,
  //         message: "No attendance data found for this meeting.",
  //       };
  //     }

  //     interface Parameter {
  //       name: string;
  //       value?: string;
  //       intValue?: number;
  //     }

  //     const attendanceDetails =
  //       res.data.items?.map((item) => {
  //         const params: Parameter[] = (item as any).events[0].parameters; // Type assertion
  //         return {
  //           name:
  //             params.find((param) => param.name === "display_name")?.value ||
  //             "Unknown",
  //           email:
  //             params.find((param) => param.name === "identifier")?.value ||
  //             "Unknown",
  //           joinedTime:
  //             params.find((param) => param.name === "start_timestamp_seconds")
  //               ?.intValue || "N/A",
  //           duration:
  //             params.find((param) => param.name === "duration_seconds")
  //               ?.intValue || 0,
  //         };
  //       }) || [];

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Student Attendance Data",
  //         token: token,
  //         Data: attendanceDetails,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.log("error line -------- 671", error);
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Failed to get Students Attendance Data",
  //         token: token,
  //       },
  //       false
  //     );
  //   }
  // }

  // public async GetMeetingAttendanceV1(
  //   userData: any,
  //   decodedToken: any
  // ): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);

  //   try {
  //     const adminSDK = google.admin({
  //       version: "reports_v1",
  //       auth: googleAuth,
  //     });

  //     // Function to convert IST 12-hour format to UTC ISO string
  //     const convertISTToUTC = (dateStr: string, timeStr: string): string => {
  //       const [time, modifier] = timeStr.split(" ");
  //       let [hours, minutes] = time.split(":").map(Number);

  //       if (modifier === "PM" && hours !== 12) hours += 12;
  //       if (modifier === "AM" && hours === 12) hours = 0;

  //       // Create date in IST
  //       const date = new Date(
  //         `${dateStr}T${String(hours).padStart(2, "0")}:${String(
  //           minutes
  //         ).padStart(2, "0")}:00.000+05:30`
  //       );

  //       // Convert to UTC
  //       return date.toISOString();
  //     };

  //     // Convert given IST date-time to UTC
  //     const startTimeUTC = convertISTToUTC(
  //       userData.fromDate,
  //       userData.fromTime
  //     );
  //     const endTimeUTC = convertISTToUTC(userData.toDate, userData.toTime);

  //     const res = await adminSDK.activities.list({
  //       userKey: "all",
  //       applicationName: "meet",
  //       eventName: "call_ended",
  //       startTime: startTimeUTC,
  //       endTime: endTimeUTC,
  //       filters: `meeting_code==${userData.meetingId}`,
  //       maxResults: 1000,
  //     } as any);

  //     if (!res.data.items || res.data.items.length === 0) {
  //       return {
  //         success: false,
  //         message: "No attendance data found for this meeting.",
  //       };
  //     }

  //     interface Parameter {
  //       name: string;
  //       value?: string;
  //       intValue?: number;
  //     }

  //     const attendanceDetails =
  //       res.data.items?.map((item) => {
  //         const params: Parameter[] = (item as any).events[0].parameters;
  //         return {
  //           name:
  //             params.find((param) => param.name === "display_name")?.value ||
  //             "Unknown",
  //           email:
  //             params.find((param) => param.name === "identifier")?.value ||
  //             "Unknown",
  //           joinedTime: formatTimestamp(
  //             params.find((param) => param.name === "start_timestamp_seconds")
  //               ?.intValue || 0
  //           ),
  //           duration:
  //             params.find((param) => param.name === "duration_seconds")
  //               ?.intValue || 0,
  //           meetingCode:
  //             params.find((param) => param.name === "meeting_code")?.value ||
  //             "UnKnown",
  //           meetingId:
  //             params
  //               .find((param) => param.name === "calendar_event_id")
  //               ?.value?.split("_")[0] ?? "UnKnown",
  //         };
  //       }) || [];

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Student Attendance Data",
  //         token: token,
  //         res: res,
  //         count: attendanceDetails.length,
  //         Data: attendanceDetails,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.log("Error:", error);
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Failed to get Students Attendance Data",
  //         token: token,
  //       },
  //       false
  //     );
  //   }
  // }
  public async GetMeetingAttendanceV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const attendanceData = await getAttendData(userData);
      return encrypt(
        {
          success: true,
          message: "Student Attendance Data",
          token: token,
          attendanceData: attendanceData,
        },
        false
      );
    } catch (error: any) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Failed to get Students Attendance Data",
          token: token,
        },
        false
      );
    }
  }
}
