import { generateToken, generateToken1, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { generateMailLink } from "../../helper/linkgenerate";
import { PoolClient } from "pg";
import { calendar } from "@googleapis/calendar";
import {
  googleAuth,
  convertToGoogleMeetISO,
} from "../../googleWorkspace/googleAuth";
import {
  initialDataOfPayment,
  otherPackage,
  verifyCoupon,
  invoiceAuditData,
  downloadInvoice,
  pastFessCount,
  paymentCount,
  newPayment,
  getbranchId,
  getStudentCount,
  refUtId_userId_Update,
  refUtIdUpdate,
  updateHistoryQuery,
  getCustId,
  getUserDetailsPaymentPageQuery,
  getotherPackagePaymentPageQuery,
  getOffersQuery,
  getNextMonthWantPay,
  getOfflineAttendanceCount,
  getOnlineCount,
  getUserPackageOnly,
  getCustomPackage,
  getTherapyCount,
  getOfferPointsValidation,
  getUserData,
  getPointsCount,
  addNewPayment,
  addNewPaymentThreapy,
  addCashDenom,
  getGoogleMeetingData,
} from "./query";

import {
  CurrentTime,
  getMatchingData,
  generateDateArray,
  getDateRange,
  mapAttendanceData,
  findNearestTimeRange,
  convertToFormattedDateTime,
} from "../../helper/common";
import { attendanceQuery } from "../../helper/attendanceDb";

export class UserPaymentRepository {
  public async userPaymentV1(userData: any, decodedToken: any) {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const params = [decodedToken.id];
      console.log("params", params);

      const userInitialData = await executeQuery(initialDataOfPayment, params);
      console.log("userInitialData", userInitialData);

      const results = {
        success: true,
        userInitialData: userInitialData,
        message: "Userdata for payment passed successfully",
        token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.error("Error", error);
      const results = {
        success: false,
        message: "Error in passing the user details for payment",
        token,
      };
      return encrypt(results, true);
    }
  }
  public async userOtherPaymentV1(userData: any, decodedToken: any) {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const userOtherPackageData = await executeQuery(otherPackage, [
        userData.refPaId,
      ]);
      const results = {
        success: true,
        userOtherPackageData: userOtherPackageData,
        message: "Data for other packages passed successfully",
        token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.error("Error", error);
      const results = {
        success: false,
        message: "Error in passing the user details for payment",
        token,
      };
      return encrypt(results, true);
    }
  }
  public async userPaymentAPIV1(userData: any, decodedToken: any) {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const results = {
        success: true,
        message: "OverView Attendance Count is passed successfully",
        token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.error("Error", error);
      const results = {
        success: false,
        message: "Error in passing the payment details",
        token,
      };
      return encrypt(results, true);
    }
  }

  public async addPaymentV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    let id;
    let by;
    if ((userData.refStId = "")) {
      id = decodedToken.id;
      by = "user";
    } else {
      id = userData.refStId;
      by = "Front Office";
    }
    try {
      const feesCount = await executeQuery(pastFessCount, [userData.refStId]);
      const countResult = await executeQuery(paymentCount, [CurrentTime()]);
      let newOrderId = convertToFormattedDateTime(CurrentTime());
      newOrderId = `${newOrderId}${(10000 + countResult[0].count).toString()}`;
      const transId = userData.transId ? userData.transId : "Offline";

      let Data = [
        id, //1
        newOrderId, //2
        transId, //3
        userData.pagID, //4
        userData.payFrom, //5
        userData.payTp, //6
        userData.pagExp, //7
        userData.offId, //8
        userData.OffType, //9
        userData.feesType, //10
        userData.pagFees, // 11
        userData.feesPaid, //12
        decodedToken.id, //13
        CurrentTime(), //14
        userData.payStatus, //15
      ];

      const storeFees = await executeQuery(newPayment, Data);

      if (userData.payStatus == false) {
        return Error;
      } else {
        const custId: any = executeQuery(getCustId, id);

        if (custId[0].refSCustId.startsWith("UY0")) {
          const refUtIdUpdateResult = await executeQuery(refUtIdUpdate, [
            userData.refStId,
          ]);
        } else {
          if (feesCount[0].count == 0) {
            const branch = await executeQuery(getbranchId, [userData.refStId]);
            let bId = branch[0].refBranchId.toString().padStart(2, "0");
            const studentCountResult = await executeQuery(getStudentCount, [
              bId,
            ]);
            const userCount = parseInt(studentCountResult[0].count, 10);
            const newCustomerId = `UY${bId}${(userCount + 1)
              .toString()
              .padStart(4, "0")}`;
            const refUtIdUpdateResult = await executeQuery(
              refUtId_userId_Update,
              [userData.refStId, newCustomerId]
            );

            const mailResult = await generateMailLink(id);
            console.log("mailResult", mailResult);
          } else {
            const refUtIdUpdateResult = await executeQuery(refUtIdUpdate, [
              userData.refStId,
            ]);
          }
        }
      }

      const history = [
        7, //Trance Id
        "Payment Success", // Trans Data
        userData.refStId, // trans For
        CurrentTime(), // time
        by, //updated By
        decodedToken.id, // updater Id
      ];
      const updateHistory = await executeQuery(updateHistoryQuery, history);

      if (!storeFees && !updateHistory) {
        return encrypt(
          {
            success: false,
            message: "error in storing the Fess data",
            token: token,
          },
          true
        );
      }

      return encrypt(
        {
          success: true,
          message: "fees Data Is Stored Successfully",
          token: token,
          data: newOrderId,
        },
        true
      );
    } catch (error) {
      console.error("Error:", error);
      const history = [
        8, //Trance Id
        "Payment Failed", // Trans Data
        userData.refStId, // trans For
        CurrentTime(), // time
        by, //updated By
        decodedToken.id, // updater Id
      ];
      const updateHistory = await executeQuery(updateHistoryQuery, history);

      return encrypt(
        {
          success: false,
          message: "Error in Storing Fees Data",
          token: token,
        },
        true
      );
    }
  }

  public async paymentPageDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const UserDetails = await executeQuery(getUserDetailsPaymentPageQuery, [
        decodedToken.id,
      ]);
      console.log(" -> Line Number ----------------------------------- 462");
      console.log("UserDetails", UserDetails);

      const otherPackage = await executeQuery(getotherPackagePaymentPageQuery, [
        UserDetails[0].refPaId,
        UserDetails[0].refBranchId,
      ]);
      console.log(" -> Line Number ----------------------------------- 469");
      const offers = await executeQuery(getOffersQuery, [
        UserDetails[0].refBranchId,
        CurrentTime(),
        otherPackage[0].refPaId,
        UserDetails[0].refBatchId,
      ]);
      console.log(" -> Line Number ----------------------------------- 476");
      console.log("offers", offers);
      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned successfully",
          UserDetails: UserDetails,
          otherPackage: otherPackage,
          offers: offers,
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: token,
        },
        true
      );
    }
  }
  public async userPaymentPayFromDateV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const Id: number = userData.refStId || decodedToken.id;
      console.log("Id", Id);
      let StartMonth: string;
      let Package: any[];
      let Offline_Count: number = 0;
      let Online_Count: number = 0;

      const UserData = await executeQuery(getNextMonthWantPay, [
        Id,
        CurrentTime(),
      ]);

      if (userData.StartMonth) {
        StartMonth = userData.StartMonth;
      } else {
        StartMonth = UserData[0].nextMonth;
      }

      function isMonthYearEqual(date1: string, date2: string): boolean {
        const parsedDate1 = new Date(date1);
        const [day, month, year, time] = date2.split(/[/, ]+/);

        const parsedDate2 = new Date(`${year}-${month}-${day} ${time}`);
        const year1 = parsedDate1.getFullYear();
        const month1 = parsedDate1.getMonth();
        const year2 = parsedDate2.getFullYear();
        const month2 = parsedDate2.getMonth();
        return year1 === year2 && month1 === month2;
      }

      function formatDate(input: string): string {
        const [datePart, timePart] = input.split(", ");
        const [day, month, year] = datePart.split("/").map(Number);

        return `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      }

      if (isMonthYearEqual(StartMonth, CurrentTime())) {
        const offlineCount = await attendanceQuery(getOfflineAttendanceCount, [
          UserData[0].refCustId,
          StartMonth,
          formatDate(CurrentTime()),
        ]);
        const OnlineCount = await executeQuery(getOnlineCount, [
          UserData[0].refCtEmail,
          StartMonth,
          formatDate(CurrentTime()),
        ]);

        Offline_Count = offlineCount[0].attendCount;
        Online_Count = OnlineCount[0].attendCount;

        Package = await executeQuery(getUserPackageOnly, [Id]);
        console.log("offlineCount[0].attendCount", offlineCount[0].attendCount);
        console.log("OnlineCount[0].attendCount", OnlineCount[0].attendCount);

        if (
          offlineCount[0].attendCount + OnlineCount[0].attendCount == 0 &&
          Package.length > 0
        ) {
          const CustomPackage = await executeQuery(getCustomPackage, [
            UserData[0].refBranchId,
          ]);
          Package.push(CustomPackage[0]);
        }
      } else {
        Package = await executeQuery(getUserPackageOnly, [Id]);
      }

      console.log("Package line ------ 407", Package);
      let threapyCount = await executeQuery(getTherapyCount, [Id]);
      if (threapyCount.length === 0) {
        threapyCount = [
          {
            Pending_Count: 0,
            Total_Therapy_Count: 0,
            Payed_Count: 0,
            Therapy_Fees: 0,
          },
        ];
      }

      threapyCount = threapyCount[0];
      const user_PackageData = {
        UserData,
        Package,
        threapyCount,
        Offline_Count: Offline_Count,
        Online_Count: Online_Count,
      };

      return encrypt(
        {
          success: true,
          message: "User Data and Package Data is Passed successfully",
          token: token,
          data: user_PackageData,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: token,
        },
        true
      );
    }
  }
  public async userPaymentGetTherapyAndOfferV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      return encrypt(
        {
          success: true,
          message: "User Data and Package Data is Passed successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: token,
        },
        true
      );
    }
  }
  public async verifyCouponV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const couponData = userData.refCoupon;

    try {
      let updateData = {
        refFees: Math.round(Number(userData.refFees)),
        refExDate: userData.refEndDate,
        refStartDate: userData.refStartDate,
        refEndDate: userData.refEndDate,
        refOfferValue: null,
        refOfferName: null,
        refOfferId: null,
        refOfferType: null,
      };
      const getTotalMonths = (startDate: string, endDate: string): number => {
        const formatDate = (dateStr: string) =>
          dateStr.split("T")[0].slice(0, 7);

        const [startYear, startMonth] = formatDate(startDate)
          .split("-")
          .map(Number);
        const [endYear, endMonth] = formatDate(endDate).split("-").map(Number);

        const totalMonths =
          (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        return totalMonths;
      };
      const monthCount = getTotalMonths(
        updateData.refStartDate,
        updateData.refEndDate
      );
      const UserData = await executeQuery(getUserData, [userData.refStId]);
      const couponDataResult = await executeQuery(verifyCoupon, [
        String(couponData),
        updateData.refFees,
        monthCount,
        UserData[0].refBranchId,
        UserData[0].refPaId,
        UserData[0].refBatchId,
      ]);

      if (couponDataResult.length === 0) {
        throw new Error("No coupon data found");
      }

      updateData.refOfferName = couponDataResult[0].refOfferName;
      updateData.refOfferId = couponDataResult[0].refOfId;
      updateData.refOfferType = couponDataResult[0].refOfferId;

      if (couponDataResult[0].isValid === true) {
        switch (couponDataResult[0].refOfferId) {
          case 1:
            const offerValue =
              (updateData.refFees / 100) * couponDataResult[0].refOffer;
            updateData.refFees = updateData.refFees - offerValue;
            updateData.refOfferValue = couponDataResult[0].refOffer;
            break;

          case 2:
            updateData.refFees =
              updateData.refFees - couponDataResult[0].refOffer;
            updateData.refOfferValue = couponDataResult[0].refOffer;
            break;

          case 3:
            const refOfferMonths = couponDataResult[0].refOffer;
            const currentDate = new Date(updateData.refExDate);
            currentDate.setMonth(currentDate.getMonth() + refOfferMonths);
            const newYear = currentDate.getFullYear();
            const newMonth = currentDate.getMonth() + 1;
            updateData.refExDate = `${newYear}-${
              newMonth < 10 ? "0" + newMonth : newMonth
            }`;
            updateData.refOfferValue = couponDataResult[0].refOffer;
            break;

          default:
            console.log("Coupon code may be expired or invalid");
            break;
        }
      } else {
        return encrypt(
          {
            success: false,
            message: "Coupon is Expired or Invalid",
            token: token,
          },
          true
        );
      }

      const refEndDate = new Date(updateData.refEndDate);
      let newYear = refEndDate.getFullYear();
      let newMonth = refEndDate.getMonth() + 1;
      updateData.refEndDate = `${newYear}-${
        newMonth < 10 ? "0" + newMonth : newMonth
      }`;
      const refStartDate = new Date(updateData.refStartDate);
      newYear = refStartDate.getFullYear();
      newMonth = refStartDate.getMonth() + 1;
      updateData.refStartDate = `${newYear}-${
        newMonth < 10 ? "0" + newMonth : newMonth
      }`;
      const refExDate = new Date(updateData.refExDate);
      newYear = refExDate.getFullYear();
      newMonth = refExDate.getMonth() + 1;
      updateData.refExDate = `${newYear}-${
        newMonth < 10 ? "0" + newMonth : newMonth
      }`;

      return encrypt(
        {
          success: true,
          message: "Coupon data is validated successfully",
          token: token,
          data: updateData,
        },
        true
      );
    } catch (error) {
      console.error("Error verifying coupon:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Validating Coupon Data",
          token: token,
        },
        true
      );
    }
  }
  public async offerPointsValidationV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const validation = await executeQuery(getOfferPointsValidation, [
        userData.refStartDate,
        userData.refEndDate,
        userData.refStId,
      ]);
      return encrypt(
        {
          success: true,
          message: "User offer points validation ",
          token: token,
          data: validation,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "error in validate the user offer Points",
          error: errorMessage,
          token: token,
        },
        true
      );
    }
  }

  public async userNewPaymentV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    console.log(
      "userData line ------ 682",

      userData
    );
    const token = generateToken(tokenData, true);
    const client: PoolClient = await getClient();
    try {
      await client.query("BEGIN");

      const feesCount = await executeQuery(pastFessCount, [userData.refStId]);
      const countResult = await executeQuery(paymentCount, [CurrentTime()]);
      let newOrderId = convertToFormattedDateTime(CurrentTime());
      newOrderId = `${newOrderId}${(100 + countResult[0].count).toString()}`;
      const transId = userData.refTransId ? userData.refTransId : "Offline";

      const pointsData = await executeQuery(getPointsCount, [
        userData.classPackage.refPayFrom,
        userData.classPackage.refPayTo,
        userData.refStId,
      ]);
      console.log("pointsData line -------- 701", pointsData);
      let points: number;
      if (userData.refClimedFreeCourse) {
        points = (parseInt(pointsData[0].refPoints) + parseInt(pointsData[0].new_point)) - 10;
      } else {
        if (pointsData[0].last_pay > 2 || userData.refOffId == 3) {
          points = 0;
        } else {
          points = parseInt(pointsData[0].refPoints) + parseInt(pointsData[0].new_point);
        }
      }
      let params = [];
      if (userData.classPackage) {
        params = [
          userData.refStId, //1
          newOrderId, //2
          transId, //3
          userData.refFeesType, //4
          userData.refFeesPaid, //5
          decodedToken.id, //6
          CurrentTime(), //7
          userData.refPayStatus, //8
          userData.refPaymentCharge, //9
          userData.classPackage.refPackage, //10
          userData.classPackage.refPayFrom, //11
          userData.classPackage.refPayTo, //12
          userData.classPackage.refPagExp, //13
          userData.classPackage.refOffId, //14
          userData.classPackage.refOffType, //15
          userData.classPackage.refPagFees, //16
          userData.classPackage.refTotalClassCount, //17
          userData.classPackage.refPayTyId, //18
          userData.classPackage.refCustomClass, //19
          userData.classPackage.refClimedFreeCourse, //20
          points, //21
        ];

        console.log("params", params);
        await client.query(addNewPayment, params);
      }

      if (userData.Therapy) {
        params = [
          userData.refStId, //1
          newOrderId, //2
          transId, //3
          userData.refFeesType, //4
          userData.refFeesPaid, //5
          decodedToken.id, //6
          CurrentTime(), //7
          userData.refPayStatus, //8
          userData.refPaymentCharge, //9
          "Therapy", //10
          null, //11
          null, //12
          null, //13
          null, //14
          null, //15
          userData.Therapy.refPagFees, //16
          userData.Therapy.refTotalClassCount, //17
          userData.Therapy.refPayTyId, //18
          null, //19
          null, //20
          null, //21
        ];
        console.log("params line ----- 751", params);

        await client.query(addNewPaymentThreapy, params);
      }

      if (userData.Coin) {
        for (let i = 0; i < userData.Coin.length; i++) {
          const cashParams = [
            newOrderId,
            transId,
            userData.Coin[i].refCashType,
            userData.Coin[i].ref_500,
            userData.Coin[i].ref_200,
            userData.Coin[i].ref_100,
            userData.Coin[i].ref_50,
            userData.Coin[i].ref_20,
            userData.Coin[i].ref_10,
            userData.Coin[i].refCoin,
          ];
          await client.query(addCashDenom, cashParams);
        }
      }

      const custId: any = await executeQuery(getCustId, [userData.refStId]);
      console.log("custId line ---- 840", custId);

      if (custId[0].refSCustId.startsWith("UY")) {
        const refUtIdUpdateResult = client.query(refUtIdUpdate, [
          userData.refStId,
        ]);
      } else {
        const branch = await executeQuery(getbranchId, [userData.refStId]);
        let bId = branch[0].refBranchId.toString().padStart(2, "0");
        const studentCountResult = await executeQuery(getStudentCount, [bId]);
        const userCount = parseInt(studentCountResult[0].count, 10);
        const newCustomerId = `UY${bId}${(userCount + 1)
          .toString()
          .padStart(4, "0")}`;
        const refUtIdUpdateResult = client.query(refUtId_userId_Update, [
          userData.refStId,
          newCustomerId,
        ]);

        const mailResult = await generateMailLink(userData.refStId);
        console.log("mailResult", mailResult);
      }

      let history = [];
      if (userData.refPayStatus) {
        history = [
          7,
          "Payment Success",
          userData.refStId,
          CurrentTime(),
          decodedToken.id,
          decodedToken.id,
        ];
      } else {
        history = [
          8,
          "Payment Failed",
          userData.refStId,
          CurrentTime(),
          decodedToken.id,
          decodedToken.id,
        ];
      }

      await client.query(updateHistoryQuery, history);

      await client.query("COMMIT");

      const meetingData: any = await executeQuery(getGoogleMeetingData, [
        userData.refStId,
      ]);
      const userMail = [meetingData[0].refCtEmail];

      let MeetingLink: string;
      if (userData.refCustomClass) {
        MeetingLink = meetingData[0].Custom_Class_Id;
      } else {
        MeetingLink = meetingData[0].Normal_Class_Id;
      }

      console.log("MeetingLink", MeetingLink);

      const eventRes = await calendar({
        version: "v3",
        auth: googleAuth,
      }).events.get({
        calendarId: "primary",
        eventId: MeetingLink,
      });
      console.log(" -> Line Number ----------------------------------- 909");
      const event = eventRes.data;
      console.log(" -> Line Number ----------------------------------- 911");
      if (!event) {
        console.log(" -> Line Number ----------------------------------- 913");
        // return encrypt(
        //   {
        //     success: false,
        //     message: "Meeting Not Found",
        //     token: token,
        //   },
        //   true
        // );
      } else {
        console.log(" -> Line Number ----------------------------------- 923");
        const attendees = event.attendees || [];
        const newEmails = userMail || [];
        const emailsToAdd = newEmails.filter(
          (email: string) => !attendees.some((att) => att.email === email)
        );
        if (emailsToAdd.length === 0) {
          console.log(
            " -> Line Number ----------------------------------- 930"
          );
          // return encrypt(
          //   {
          //     success: false,
          //     message: "All students are already added to the meeting",
          //     token: token,
          //   },
          //   true
          // );
        }
        console.log(" -> Line Number ----------------------------------- 940");
        emailsToAdd.forEach((email: string) => attendees.push({ email }));
        console.log(" -> Line Number ----------------------------------- 942");
        await calendar({
          version: "v3",
          auth: googleAuth,
        }).events.update({
          calendarId: "primary",
          eventId: MeetingLink,
          requestBody: {
            ...event,
            attendees,
          },
        });
      }
      console.log(" -> Line Number ----------------------------------- 955");

      return encrypt(
        {
          success: true,
          message: "New User Payment Added Successfully",
          token: token,
          orderId: newOrderId,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Error in adding New Payment",
          token: token,
        },
        true
      );
    }
  }
  public async invoiceDownloadV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    console.log("userData line ----- 971", userData);
    const token = generateToken(tokenData, true);
    try {
      const InvoiceData = await executeQuery(downloadInvoice, [
        userData.refOrderId,
      ]);
      console.log("InvoiceData", InvoiceData);
      return encrypt(
        {
          success: true,
          message: "Payment Invoice Data Passed Successfully",
          token: token,
          data: InvoiceData,
        },
        true
      );
    } catch (error) {
      console.error("Error", error);
      return encrypt(
        {
          success: false,
          message: "Error in Downloading the user invoice",
          token: token,
        },
        true
      );
    }
  }
  public async invoiceAuditDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    let id;
    if (userData.refStId == "") {
      id = decodedToken.id;
    } else {
      id = userData.refStId;
    }
    try {
      const auditData = await executeQuery(invoiceAuditData, [id]);
      return encrypt(
        {
          success: true,
          message: "Invoice Audit Data Passed",
          token: token,
          data: auditData,
        },
        true
      );
    } catch (error) {
      console.error("Error", error);
      return encrypt(
        {
          success: false,
          message: "Error in invoice audit data passing",
          token: token,
        },
        true
      );
    }
  }
}
