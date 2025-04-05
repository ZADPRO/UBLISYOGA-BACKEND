import { executeQuery, getClient } from "../../helper/db";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import bcrypt from "bcryptjs";
import path from "path";
import { PoolClient } from "pg";
import { sendEmail } from "../../helper/mail";
import {} from "../../helper/mailcontent";

import {
  getStudentData,
  getStudentProfileData,
  feesEntry,
  verifyCoupon,
  paymentCount,
  setFeesStored,
  passInvoiceData,
  userPaymentAuditList,
  refUtIdUpdate,
  updateHistoryQuery,
  pastFessCount,
  getStudentCount,
  refUtId_userId_Update,
  getbranchId,
} from "./query";
import { encrypt } from "../../helper/encrypt";
import { generateToken, decodeToken } from "../../helper/token";
import {
  formatDate,
  getAdjustedTime,
  CurrentTime,
  convertToFormattedDateTime,
} from "../../helper/common";

export class FinanceRepository {
  public async studentDetailsV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const branchId = decodedToken.branch;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const studentData = await executeQuery(getStudentData, [branchId]);

      const filteredData = studentData.map((student) => ({
        refStId: student.refStId,
        refSCustId: student.refSCustId,
        refStFName: student.refStFName,
        refStLName: student.refStLName,
        refCtMobile: student.refCtMobile,
        refCtEmail: student.refCtEmail,
      }));

      return encrypt(
        {
          success: true,
          message: "Student Data Is Passed successfully to the Finance Page",
          data: filteredData,
          token: token,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "error in passing student data to finance",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async studentProfileV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const id = userData.refStId;
      console.log("id line ---------- 86", id);
      let studentData = await executeQuery(getStudentProfileData, [id]);
      console.log("studentData", studentData);

      return encrypt(
        {
          success: true,
          message:
            "Student Profile Data Is Passed successfully to the Finance Page",
          data: studentData,
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "error in passing student data to finance",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async studentFeesDetailsV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const id = userData.refStId;
    try {
      const FeesData = await executeQuery(feesEntry, [id]);

      // const filteredData = studentData.map((student) => ({
      //   refStId: student.refStId,
      //   refSCustId: student.refSCustId,
      //   refStFName: student.refStFName,
      //   refStLName: student.refStLName,
      //   refCtMobile: student.refCtMobile,
      //   refCtEmail: student.refCtEmail,
      // }));

      return encrypt(
        {
          success: true,
          message: "Fess Data is Passed Successfully",
          data: FeesData,
          token: token,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "error in passing Fess Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  // public async verifyCouponV1(userData: any, decodedToken: any): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);
  //   const couponData = userData.refCoupon;

  //   try {
  //     let updateData = {
  //       refFees: Math.round(Number(userData.refFees)),
  //       refExDate: userData.refExDate,
  //       refStartDate: userData.refStartDate,
  //       refEndDate: userData.refEndDate,
  //       refOfferValue: null,
  //       refOfferName: null,
  //     };
  //     const getTotalMonths = (startDate: string, endDate: string): number => {
  //       const formatDate = (dateStr: string) =>
  //         dateStr.split("T")[0].slice(0, 7);

  //       const [startYear, startMonth] = formatDate(startDate)
  //         .split("-")
  //         .map(Number);
  //       const [endYear, endMonth] = formatDate(endDate).split("-").map(Number);

  //       const totalMonths =
  //         (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  //       return totalMonths;
  //     };
  //     const monthCount = getTotalMonths(
  //       updateData.refStartDate,
  //       updateData.refEndDate
  //     );
  //     const couponDataResult = await executeQuery(verifyCoupon, [
  //       String(couponData),
  //       updateData.refFees,
  //       monthCount,
  //     ]);
  //     console.log("couponDataResult", couponDataResult);

  //     if (couponDataResult.length === 0) {
  //       throw new Error("No coupon data found");
  //     }

  //     // Update offer details
  //     updateData.refOfferName = couponDataResult[0].refOfferName;

  //     if (couponDataResult[0].isValid === true) {
  //       switch (couponDataResult[0].refOfferId) {
  //         case 1: // Percentage discount
  //           const offerValue =
  //             (updateData.refFees / 100) * couponDataResult[0].refOffer;
  //           updateData.refFees = updateData.refFees - offerValue;
  //           updateData.refOfferValue = couponDataResult[0].refOffer;
  //           break;

  //         case 2: // Fixed amount discount
  //           updateData.refFees =
  //             updateData.refFees - couponDataResult[0].refOffer;
  //           updateData.refOfferValue = couponDataResult[0].refOffer;
  //           break;

  //         case 3: // Additional months offer
  //           const refOfferMonths = couponDataResult[0].refOffer;
  //           const currentDate = new Date(updateData.refExDate);
  //           currentDate.setMonth(currentDate.getMonth() + refOfferMonths);
  //           const newYear = currentDate.getFullYear();
  //           const newMonth = currentDate.getMonth() + 1;
  //           updateData.refExDate = `${newYear}-${
  //             newMonth < 10 ? "0" + newMonth : newMonth
  //           }`;
  //           updateData.refOfferValue = couponDataResult[0].refOffer;
  //           break;

  //         default:
  //           console.log("Coupon code may be expired or invalid");
  //           break;
  //       }
  //     } else {
  //       return encrypt(
  //         {
  //           success: false,
  //           message: "Coupon is Expired or Invalid",
  //           token: token,
  //         },
  //         true
  //       );
  //     }

  //     const refEndDate = new Date(updateData.refEndDate);
  //     let newYear = refEndDate.getFullYear();
  //     let newMonth = refEndDate.getMonth() + 1;
  //     updateData.refEndDate = `${newYear}-${
  //       newMonth < 10 ? "0" + newMonth : newMonth
  //     }`;
  //     const refStartDate = new Date(updateData.refStartDate);
  //     newYear = refStartDate.getFullYear();
  //     newMonth = refStartDate.getMonth() + 1;
  //     updateData.refStartDate = `${newYear}-${
  //       newMonth < 10 ? "0" + newMonth : newMonth
  //     }`;
  //     const refExDate = new Date(updateData.refExDate);
  //     newYear = refExDate.getFullYear();
  //     newMonth = refExDate.getMonth() + 1;
  //     updateData.refExDate = `${newYear}-${
  //       newMonth < 10 ? "0" + newMonth : newMonth
  //     }`;

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Coupon data is validated successfully",
  //         token: token,
  //         data: updateData,
  //       },
  //       true
  //     );
  //   } catch (error) {
  //     console.error("Error verifying coupon:", error);
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Error in Validating Coupon Data",
  //         token: token,
  //       },
  //       true
  //     );
  //   }
  // }
  public async FeesPaidV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const client: PoolClient = await getClient();

    try {
      const feesCount = await executeQuery(pastFessCount, [userData.refStId]);

      await client.query("BEGIN");
      const countResult = await executeQuery(paymentCount, []);
      const currentTime = CurrentTime();
      let newOrderId = convertToFormattedDateTime(currentTime);
      newOrderId = `${newOrderId}${(10000 + countResult[0].count).toString()}`;

      let Data = [
        userData.refStId,
        userData.refPaymentMode,
        userData.refPaymentFrom,
        refStId,
        CurrentTime(),
        userData.refExpiry,
        newOrderId,
        null,
        userData.refPaymentTo,
        userData.refToAmt,
        userData.refFeesPaid,
        userData.refGstPaid,
        userData.refCoupon,
        userData.refFeesAmtOf,
        userData.refOfferValue,
        userData.refOfferName,
      ];

      const storeFees = await client.query(setFeesStored, Data);

      if (feesCount[0].count == 0) {
        const branch = await executeQuery(getbranchId, [userData.refStId]);
        let bId = branch[0].refBranchId.toString().padStart(2, "0");

        const studentCountResult = await executeQuery(getStudentCount, [bId]);

        const userCount = parseInt(studentCountResult[0].count, 10);

        const newCustomerId = `UY${bId}${(userCount + 1)
          .toString()
          .padStart(4, "0")}`;

        const refUtIdUpdateResult = await client.query(refUtId_userId_Update, [
          userData.refStId,
          newCustomerId,
        ]);
      } else {
        const refUtIdUpdateResult = await client.query(refUtIdUpdate, [
          userData.refStId,
        ]);
      }

      const history = [
        7, //Trance Id
        "Payment Success", // Trans Data
        userData.refStId, // trans For
        CurrentTime(), // time
        "Front Office", //updated By
        decodedToken.id, // updater Id
      ];
      const updateHistory = await client.query(updateHistoryQuery, history);

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

      await client.query("COMMIT");

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
      await client.query("ROLLBACK");

      const history = [
        8, //Trance Id
        "Payment Success", // Trans Data
        userData.refStId, // trans For
        CurrentTime(), // time
        "Front Office", //updated By
        decodedToken.id, // updater Id
      ];
      const updateHistory = await executeQuery(updateHistoryQuery, history);

      const results = {
        success: false,
        message: "Error in passing Fees Data",
        token: token,
      };
      return encrypt(results, true);
    } finally {
      client.release();
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
    const token = generateToken(tokenData, true);
    const refOrderId = userData.refOrderId;

    try {
      let invoiceData = await executeQuery(passInvoiceData, [refOrderId]);
      // invoiceData[0].refDate = formatDate(invoiceData[0].refDate);
      // console.log("invoiceData[0].refDate", invoiceData[0].refDate);
      return encrypt(
        {
          success: true,
          message: "Invoice Data Is Passed Successfully",
          token: token,
          data: invoiceData,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Passing The Invoice Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async userPaymentAuditPgV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const id = userData.refStId;

    try {
      const auditData = await executeQuery(userPaymentAuditList, [id]);

      const filteredData = auditData.map((data) => ({
        refOrderId: data.refOrderId,
        refDate: formatDate(data.refDate),
        refExpiry: data.refExpiry,
      }));

      return encrypt(
        {
          success: true,
          message: "user Invoice Audit Data is Passed Successfully",
          token: token,
          data: filteredData,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Passing User Invoice Audit Data ",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
