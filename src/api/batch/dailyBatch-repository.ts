import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { encrypt } from "../../helper/encrypt";
import { generateToken, generateToken1 } from "../../helper/token";
import {
  getBirthdayData,
  getWeedingData,
  getGoogleMeetCode,
  insertAttendanceData,
} from "./query";
import { sendEmail } from "../../helper/mail";
import {
  sendBirthdayWish,
  sendAnniversaryWish,
} from "../../helper/mailcontent";
import { getAttendData } from "../../googleWorkspace/googleAttendance";
import { getAdjustedTime, CurrentTime } from "../../helper/common";

export class BatchRepository {
  public async BirthdayRepositoryV1(): Promise<any> {
    try {
      const getData = await executeQuery(getBirthdayData, []);
      if (getData.length > 0) {
        for (let i = 0; i < getData.length; i++) {
          const main = async () => {
            const mailOptions = {
              to: getData[i].refCtEmail,
              subject: "Birthday Wish From Ublis Yoga",
              html: sendBirthdayWish(
                getData[i].refStFName,
                getData[i].refStLName
              ),
            };

            // Call the sendEmail function
            try {
              await sendEmail(mailOptions);
            } catch (error) {
              console.error("Failed to send email:", error);
            }
          };

          main().catch(console.error);
        }
      }

      const results = {
        success: true,
        message: "Birthday Wish Mail Is Send Successfully",
        // token: generateToken1(this.decodedToken, true),
      };
      return encrypt(results, false);
    } catch (error) {
      console.log(error);
      const results = {
        success: false,
        message: "error In sending Birthday Wish Mail",
        // token: generateToken1(this.decodedToken, true),
      };
      return encrypt(results, false);
    }
  }
  public async WeedingWishRepositoryV1(): Promise<any> {
    try {
      const getData = await executeQuery(getWeedingData, []);
      if (getData.length > 0) {
        for (let i = 0; i < getData.length; i++) {
          const main = async () => {
            const mailOptions = {
              to: getData[i].refCtEmail,
              subject: "Wedding Wish From Ublis Yoga",
              html: sendAnniversaryWish(
                getData[i].refStFName,
                getData[i].refStLName
              ),
            };

            // Call the sendEmail function
            try {
              await sendEmail(mailOptions);
            } catch (error) {
              console.error("Failed to send email:", error);
            }
          };

          main().catch(console.error);
        }
      }

      const results = {
        success: true,
        message: "Birthday Wish Mail Is Send Successfully",
        // token: generateToken1(this.decodedToken, true),
      };
      return encrypt(results, false);
    } catch (error) {
      console.log(error);
      const results = {
        success: false,
        message: "error In sending Birthday Wish Mail",
        // token: generateToken1(this.decodedToken, true),
      };
      return encrypt(results, false);
    }
  }
  public async googleMeetAttendanceV1(): Promise<any> {
    try {
      const meetingCode = await executeQuery(getGoogleMeetCode, [
        CurrentTime(),
      ]);
      console.log("meetingCode", meetingCode);

      let allAttendanceData: AttendanceData = { attendanceData: [] };

      for (const meeting of meetingCode) {
        for (const code of meeting.refmeetingcodes) {
          const userData = {
            meetingId: code,
            fromDate: new Date(CurrentTime()).toISOString().split("T")[0],
            toDate: new Date(CurrentTime()).toISOString().split("T")[0],
            fromTime: meeting.matchedTimeRange.split(" to ")[0],
            toTime: meeting.matchedTimeRange.split(" to ")[1],
          };
          let attendanceData = await getAttendData(userData);

          if (!Array.isArray(attendanceData)) {
            attendanceData = [];
          }

          allAttendanceData.attendanceData.push({
            branchId: meeting.refBranchId,
            attendanceData,
          });
        }
      }

      type AttendanceRecord = {
        name: string;
        email: string;
        joinedTime: string;
        duration: number;
        meetingCode: string;
        meetingId: string;
        TotalCount?: number;
        TotalDuration?: number;
      };

      type BranchAttendance = {
        branchId: number;
        attendanceData: AttendanceRecord[];
      };

      type AttendanceData = {
        attendanceData: BranchAttendance[];
      };

      function addTotalCountAndDurationPerBranch(
        data: AttendanceData
      ): AttendanceData {
        return {
          attendanceData: data.attendanceData.map((branch) => {
            const userCounts: Record<string, number> = {};
            const userDurations: Record<string, number> = {};

            for (const record of branch.attendanceData) {
              userCounts[record.email] = (userCounts[record.email] || 0) + 1;
              userDurations[record.email] =
                (userDurations[record.email] || 0) + record.duration;
            }

            const updatedAttendanceData = branch.attendanceData.map(
              (record) => ({
                ...record,
                TotalCount: userCounts[record.email] || 0,
                TotalDuration: userDurations[record.email] || 0,
              })
            );

            return {
              branchId: branch.branchId,
              attendanceData: updatedAttendanceData,
            };
          }),
        };
      }

      function filterAttendance(data: AttendanceData): AttendanceData {
        return {
          attendanceData: data.attendanceData
            .map((branch) => ({
              branchId: branch.branchId,
              attendanceData: branch.attendanceData.filter(
                (record) => record.duration > 220
              ),
            }))
            .filter((branch) => branch.attendanceData.length > 0),
        };
      }

      allAttendanceData = addTotalCountAndDurationPerBranch(allAttendanceData);

      const filteredData = filterAttendance(allAttendanceData);

      await executeQuery(insertAttendanceData, [filteredData]);

      const results = {
        success: true,
        message: "Google Attendance Data stored Successfully",
      };
      return encrypt(results, true);
    } catch (error) {
      console.log(error);
      const results = {
        success: false,
        message: "Error in fetching and storing Google Meet attendance data",
      };
      return encrypt(results, true);
    }
  }
}
