import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import {
  getCurrentStudentData,
  addTherapyAttendCount,
  updateHistoryQuery,
  studentMonthWiseReport,
  monthWiseCount,
} from "./query";
import { executeQuery } from "../../helper/db";
import { CurrentTime } from "../../helper/common";
import { classCount } from "../../helper/classCount";

export class ClassInfoRepository {
  public async overViewV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const Data = await executeQuery(studentMonthWiseReport, [
        userData.refMonth,
      ]);

      const results = {
        success: true,
        message: "Class Info Overview Page Data",
        token: token,
        Data: Data,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in passing Class Info OverView Page Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async overViewChartV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const Data = await executeQuery(monthWiseCount, [userData.refYear]);

      const results = {
        success: true,
        message: "Class Info Overview Chart count",
        token: token,
        Data: Data,
      };
      return encrypt(results, false);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in passing Class Info OverView Chart Count Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async currentStudentDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const StudentData = await executeQuery(getCurrentStudentData, [
        decodedToken.branch,
      ]);
      const results = {
        success: true,
        message: "Current Student Data is Passed Successfully",
        token: token,
        data: StudentData,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error In Passing the Current Student Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addUserTherapyCountV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      await executeQuery(addTherapyAttendCount, [userData.refStId]);
      const transId = 39,
        transData = "student complete one therapy session",
        refUpdatedBy = "Therapist";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        CurrentTime(),
        refUpdatedBy,
        decodedToken.id,
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      const results = {
        success: true,
        message: "therapy Attend Count is added Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error In Adding therapy attend Count",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async studentMonthWiseReportV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let Data = await executeQuery(studentMonthWiseReport, [
        userData.refMonth,
      ]);

      console.log(' -> Line Number ----------------------------------- 160', );
      console.log('userData.refMonth', userData.refMonth) 

      for (let i = 0; i < Data.length; i++) {
        const count: any = await classCount(userData.refMonth, Data[i].refStId);
        Data[i] = {
          ...Data[i],
          totalClassCount: count.totalClassCount,
          classAttendanceCount: count.classAttendCount,
          reCount: count.reCount,
          onlineCount: count.onlineCount,
          totalAttendCount: count.totalAttendCount,
        };
      }
      console.log(" -> Line Number ----------------------------------- 172");
      console.log("Data", Data);

      const results = {
        success: true,
        message: "Month wise Student Report Passed Successfully",
        token: token,
        data: Data,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error In passing Month wise Student Report Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
