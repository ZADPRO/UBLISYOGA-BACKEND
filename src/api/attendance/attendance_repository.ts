import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { attendanceQuery, getAttendance } from "../../helper/attendanceDb";
import { classCount } from "../../helper/classCount";
import {
  searchUser,
  userAttendance,
  getOnlineCount,
  getOfflineCount,
  packageListData,
  getAttendanceDatas,
  getOnlineAttendanceDatas,
  packageOptions,
  packageOptionsMonth,
  getAttendanceDataTiming,
  getOnlineAttendanceDataTiming,
  timingOptions,
  mapUserData,
  getUserData,
  getTodayPackageList,
  getUserCount,
  getPackageList,
  petUserAttendCount,
  getGenderCount,
  onlineSessionWiseCount,
  onlineAttendanceData,
  getUserEmailId,
} from "./query";
import {
  CurrentTime,
  getMatchingData,
  generateDateArray,
  getDateRange,
  mapAttendanceData,
  findNearestTimeRange,
} from "../../helper/common";

export class AttendanceRepository {
  public async attendanceOverViewV1(userData: any, decodedToken: any) {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let todayDate;
      if (userData.date.length > 0) {
        todayDate = userData.date;
      } else {
        todayDate = CurrentTime();
      }
      const packageList = await executeQuery(getTodayPackageList, [todayDate]);
      const refTimeIds = packageList.map((item: any) => item.refTimeId);
      const getUserCountResult = await executeQuery(getUserCount, [refTimeIds]);
      const timeRanges = getUserCountResult.map((item: any) => ({
        refTimeId: item.refTimeId,
        refTime: item.refTime,
        usercount: item.usercount,
      }));
      const attendanceCounts = await attendanceQuery(getOfflineCount, [
        todayDate,
        JSON.stringify(timeRanges),
      ]);
      const onlineAttendanceData = await executeQuery(getOnlineCount, [
        todayDate,
        JSON.stringify(timeRanges),
      ]);

      const genderCount = await executeQuery(getGenderCount, [
        JSON.stringify(attendanceCounts),
      ]);
      const genderCountOnline = await executeQuery(getGenderCount, [
        JSON.stringify(onlineAttendanceData[0].result),
      ]);

      let finalData: any[] | null = null;
      finalData = await findNearestTimeRange(genderCount, todayDate);
      finalData = [...genderCount, { nearestRefTimeId: finalData }];

      let finalDataOnline: any[] | null = null;
      finalDataOnline = await findNearestTimeRange(
        genderCountOnline,
        todayDate
      );
      finalDataOnline = [...genderCountOnline, { nearestRefTimeId: finalData }];

      const results = {
        success: true,
        message: "OverView Attendance Count is passed successfully",
        token,
        attendanceCount: finalData,
        onlineAttendanceData: finalDataOnline,
      };
      return encrypt(results, true);
    } catch (error) {
      console.error("Error", error);
      const results = {
        success: false,
        message: "Error in passing the OverView Attendance",
        token,
      };
      return encrypt(results, true);
    }
  }
  public async sessionAttendanceV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const date = userData.date == "" ? CurrentTime() : userData.date;
      const sessionMode = userData.sessionMode == 1 ? "Online" : "Offline";
      const params = [decodedToken.branch, sessionMode, date];

      let registerCount = await executeQuery(getPackageList, params);

      let attendCount: any;

      if (sessionMode === "Offline") {
        attendCount = await attendanceQuery(petUserAttendCount, [
          date,
          JSON.stringify(registerCount),
        ]);
      } else {
        attendCount = await executeQuery(onlineSessionWiseCount, [
          date,
          JSON.stringify(registerCount),
        ]);
      }

      const results = {
        success: true,
        message: "Overall Attendance Count is passed successfully",
        token: token,
        attendanceCount: attendCount,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in passing the Session Attendance",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async userSearchV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const searchText = userData.searchText;
      let searchResult = await executeQuery(searchUser, [searchText]);
      const results = {
        success: true,
        message: "Searching For User",
        token: token,
        searchResult: searchResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Searching User",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async userDataV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let userData = await executeQuery(getUserData, [decodedToken.id]);
      const results = {
        success: true,
        message: "Passing The User Data",
        token: token,
        data: userData[0],
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in sending User Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async userAttendanceV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      function formatMonthYear(dateString: string) {
        const [datePart, timePart] = dateString.split(", ");
        const [day, month, year] = datePart.split("/").map(Number);
        const date = new Date(year, month - 1, day);

        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const monthName = months[date.getMonth()];
        const yearValue = date.getFullYear();
        return `${monthName},${yearValue}`;
      }

      const custId = userData.refCustId;
      let Month;
      if (userData.month == "") {
        Month = formatMonthYear(CurrentTime());
      } else {
        Month = userData.month;
      }
      let attendanceResult = await attendanceQuery(userAttendance, [
        custId,
        Month,
      ]);
      const emailId = await executeQuery(getUserEmailId, [custId]);
      const onlineattendance = await executeQuery(onlineAttendanceData, [
        emailId[0].refCtEmail,
        Month,
      ]);

      attendanceResult = [...attendanceResult, ...onlineattendance];
      function formatDate(input: string) {
        const [month, year] = input.split(",");
        const date = new Date(`${month} 1, ${year}`);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = "01";

        const formattedDate = `${yyyy}-${mm}-${dd}`;
        return formattedDate;
      }

      const count: any = await classCount(
        formatDate(Month),
        emailId[0].refStId
      );
      const AttendanceCount = {
        totalClassCount: count.totalClassCount,
        classAttendanceCount: count.classAttendCount,
        reCount: count.reCount,
        onlineCount: count.onlineCount,
        totalAttendCount: count.totalAttendCount,
      };

      const results = {
        success: true,
        message: "User Attendance is passed successfully",
        token: token,
        attendanceResult: attendanceResult,
        AttendanceCount: AttendanceCount,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in passing the User Attendance",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async attendanceReportOptionV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let attendanceOptions;
      if (userData.reportType.code == 1) {
        const mode =
          userData.mode.length > 1
            ? "'Online', 'Offline'"
            : userData.mode[0] == 1
            ? "Online"
            : "Offline";
        if (userData.date == "") {
          attendanceOptions = await executeQuery(packageOptionsMonth, [
            decodedToken.branch,
          ]);
        } else {
          attendanceOptions = await executeQuery(packageOptions, [
            mode,
            userData.date,
            decodedToken.branch,
          ]);
        }
      } else {
        attendanceOptions = await executeQuery(timingOptions, []);
      }

      const results = {
        success: true,
        message: "Overall Attendance Options is passed successfully",
        token: token,
        options: attendanceOptions,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in passing the Session Attendance",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async attendanceReportV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let Data;
      const resultMap: any = {};
      let allCustomerIds: string[] = [];
      let finalData;
      const sessionMod =
        userData.refSessionMod.length > 1
          ? "Online,Offline"
          : userData.refSessionMod[0] === 1
          ? "Online"
          : "Offline";
      if (userData.reportType.code == 1) {
        Data = await executeQuery(packageListData, [
          sessionMod,
          userData.refPackageId,
        ]);

        Data.forEach((item: any) => {
          if (!resultMap[item.refPaId]) {
            resultMap[item.refPaId] = {
              refPaId: item.refPaId,
              refPackageName: item.refPackageName,
              users: [],
            };
          }
          if (item.refStId !== null) {
            resultMap[item.refPaId].users.push({
              refStId: item.refStId,
              refSCustId: item.refSCustId,
              refStFName: item.refStFName,
              refStLName: item.refStLName,
              refCtMobile: item.refCtMobile,
            });

            allCustomerIds.push(item.refSCustId);
          }
        });
        let date: string[] = [];

        if (userData.refRepDurationType == 1) {
          date[0] = userData.refRepDuration;
          date[1] = userData.refRepDuration;
        } else {
          [date[0], date[1]] = getDateRange(userData.refRepDuration);
        }

        async function formatData(Data: any, Mode: string) {
          Data.forEach((att: any) => {
            const { emp_code, attendance: empAttendance } = att;

            Object.values(resultMap).forEach((packageItem: any) => {
              const user = packageItem.users.find(
                (user: any) => user.refSCustId === emp_code
              );

              if (user) {
                if (!user.attendance) {
                  user.attendance = []; // Initialize if not present
                }

                // Append new attendance records without overwriting old ones
                empAttendance.forEach((time: string) => {
                  user.attendance.push({ time, mode: Mode });
                });
              }
            });
          });
        }

        const params = [date[0], date[1], allCustomerIds];

        if (sessionMod.includes("Offline")) {
          const attendance = await attendanceQuery(getAttendanceDatas, params);
          await formatData(attendance, "Offline");
        }

        if (sessionMod.includes("Online")) {
          const onlineAttendance = await executeQuery(
            getOnlineAttendanceDatas,
            params
          );

          await formatData(onlineAttendance, "Online");
        }

        finalData = Object.values(resultMap);
      } else {
        let dates: string[] = [];
        try {
          if (userData.refRepDurationType === 1) {
            dates[0] = userData.refRepDuration;
            dates[1] = userData.refRepDuration;
          } else {
            [dates[0], dates[1]] = getDateRange(userData.refRepDuration);
          }
          const params = [dates[0], dates[1]];
          let formattedAttendanceData: string[] = []; // Initialize as an empty array

          if (sessionMod.includes("Online")) {
            const onlineData = await executeQuery(
              getOnlineAttendanceDataTiming,
              params
            );

            formattedAttendanceData = formattedAttendanceData.concat(
              onlineData.map(
                (item) => `${item.emp_code},${item.punch_time},${item.mode}`
              )
            );
          }

          if (sessionMod.includes("Offline")) {
            const offlineData = await attendanceQuery(
              getAttendanceDataTiming,
              params
            );
            formattedAttendanceData = formattedAttendanceData.concat(
              offlineData.map(
                (item) => `${item.emp_code},${item.punch_time},${item.mode}`
              )
            );
          }

          const userMapData = await executeQuery(mapUserData, [
            formattedAttendanceData,
            userData.refPackageId,
          ]);

          finalData = mapAttendanceData(userMapData);
        } catch (error) {
          console.error("Error fetching or processing data:", error);
          throw error;
        }
      }

      const results = {
        success: true,
        message: "Attendance Report Data IS Passed Successfully",
        token: token,
        attendanceData: finalData,
      };
      return encrypt(results, true);
    } catch (error) {
      console.error(error);
      const results = {
        success: false,
        message: "Error in passing the Session Attendance Report Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
