import { executeQuery, getClient } from "../../helper/db";
import { getUserData as rawGetUserDataQuery } from "./query";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { PoolClient } from "pg";
import { reLabelText } from "../../helper/label";
import { getAdjustedTime } from "../../helper/common";

import {
  fetchClientData,
  getPresentHealthLabel,
  updateUserType,
  updateUserStatus,
  updateHistoryQuery,
  getStatusLabel,
  getFollowUpLabel,
  getDataForUserManagement,
  getSignUpCount,
  getSignUpData,
  getRegisterCount,
  getUserStatusLabel,
  getStaffRestriction,
  getUserType,
  getUserCount,
  getStaffCount,
  getRecentFormData,
  registerData,
  getPaymentBendingData,
  fetchClientData1,
  userTempData,
  updateNotification,
  getProfileData,
  getCommunicationType,
  updateStaffPan,
  updateStaffAadhar,
  updateStaffCertification,
  getDocuments,
  getTrailPaymentCount,
  getEmployeeChangesCount,
  getStudentChangesCount,
  getFeesDetails,
  passToThreapist,
  rejectUser,
} from "./query";
import { encrypt, formatDate } from "../../helper/encrypt";
import { generateToken, decodeToken } from "../../helper/token";
import { viewFile } from "../../helper/storage";
import path from "path";
import { CurrentTime } from "../../helper/common";

export class StaffRepository {
  public async staffDashBoardV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    try {
      const refStId = decodedToken.id;
      console.log("refStId line ----- 57", refStId);
      const userType = await executeQuery(getUserType, [refStId]);
      console.log("userType line ----- 59", userType);
      const refUserType = userType[0];
      console.log("refUserType line ---- 61", refUserType);
      let refDashBoardData = {};
      const staffRestriction = await executeQuery(getStaffRestriction, [
        refUserType.refUtId,
      ]);
      console.log(" -> Line Number ----------------------------------- 66");
      const restrictionLabel = staffRestriction.reduce((acc, item, index) => {
        acc[index + 1] = item.columnName; // Use index + 1 for 1-based keys
        return acc;
      }, {});
      console.log(" -> Line Number ----------------------------------- 71");
      refDashBoardData = { ...refDashBoardData, restrictionLabel };
      console.log(" -> Line Number ----------------------------------- 73");
      for (let i = 0; i < staffRestriction.length; i++) {
        console.log(" -> Line Number ----------------------------------- 75");
        const userTypeName = staffRestriction[i].columnName;
        console.log(" -> Line Number ----------------------------------- 77");
        switch (userTypeName) {
          case "Users":
            console.log(
              " -> Line Number ----------------------------------- 80"
            );
            const userTypeCount = await executeQuery(getUserCount, []);
            refDashBoardData = { ...refDashBoardData, userTypeCount };

            break;
          case "Registered":
            console.log(
              " -> Line Number ----------------------------------- 86"
            );
            const registerCount = await executeQuery(getRegisterCount, [
              CurrentTime(),
            ]);
            console.log(
              " -> Line Number ----------------------------------- 90"
            );
            refDashBoardData = { ...refDashBoardData, registerCount };
            console.log(
              " -> Line Number ----------------------------------- 92"
            );
            const registerSampleData = await executeQuery(registerData, [
              2,
              CurrentTime(),
              [true],
            ]);

            refDashBoardData = { ...refDashBoardData, registerSampleData };
          case "Signedup":
            console.log(
              " -> Line Number ----------------------------------- 101"
            );
            const signUpCount = await executeQuery(getSignUpCount, [
              CurrentTime(),
            ]);
            console.log(
              " -> Line Number ----------------------------------- 105"
            );
            refDashBoardData = { ...refDashBoardData, signUpCount };
            console.log(
              " -> Line Number ----------------------------------- 107"
            );
            const signUpData = await executeQuery(getSignUpData, [
              CurrentTime(),
            ]);
            refDashBoardData = { ...refDashBoardData, signUpData };
          case "Feedback":
            console.log(
              " -> Line Number ----------------------------------- 113"
            );
            // console.log("This For Feedback");
            break;
          case "Trail":
            console.log(
              " -> Line Number ----------------------------------- 117"
            );
            const trailCount = await executeQuery(getTrailPaymentCount, []);
            console.log(
              " -> Line Number ----------------------------------- 119"
            );
            refDashBoardData = { ...refDashBoardData, trailCount };
            console.log(
              " -> Line Number ----------------------------------- 121"
            );
            const fessCount = await executeQuery(getFeesDetails, []);
            console.log(
              " -> Line Number ----------------------------------- 123"
            );
            refDashBoardData = { ...refDashBoardData, fessCount };
            console.log(
              " -> Line Number ----------------------------------- 125"
            );
            let trailSampleData = await executeQuery(registerData, [
              2,
              CurrentTime(),
              [false, null],
            ]);
            // trailSampleData.push({ label: "Trail Data" });
            console.log(
              " -> Line Number ----------------------------------- 132"
            );
            refDashBoardData = { ...refDashBoardData, trailSampleData };
            console.log(
              " -> Line Number ----------------------------------- 134"
            );
            let paymentPendingSampleData = await executeQuery(
              getPaymentBendingData,
              [6, CurrentTime(), [false, null, true], [5, 6]]
            );
            console.log(
              " -> Line Number ----------------------------------- 139"
            );
            // paymentPendingSampleData.push({ label: "Payment Pending" });

            refDashBoardData = {
              ...refDashBoardData,
              paymentPendingSampleData,
            };
            console.log("refDashBoardData line ------- 146", refDashBoardData);
            break;
          case "Settings":
            break;
          case "Transaction":
            // console.log("This for Transaction");
            break;
          case "Payroll":
            // console.log("This For payRoll");
            break;
          case "Staff":
            console.log(
              " -> Line Number ----------------------------------- 157"
            );
            const staffCount = await executeQuery(getStaffCount, []);
            console.log(
              " -> Line Number ----------------------------------- 159"
            );
            refDashBoardData = { ...refDashBoardData, staffCount };
            console.log(
              " -> Line Number ----------------------------------- 161"
            );
            break;
          case "Audit":
            console.log(
              " -> Line Number ----------------------------------- 202"
            );
            const getStudentChangesCountResult = await executeQuery(
              getStudentChangesCount,
              []
            );
            console.log(
              " -> Line Number ----------------------------------- 207"
            );
            refDashBoardData = {
              ...refDashBoardData,
              getStudentChangesCountResult,
            };
            console.log(
              " -> Line Number ----------------------------------- 212"
            );
            let userType = [];

            const userTypeResult = await executeQuery(getUserType, [
              decodedToken.id,
            ]);
            console.log(
              " -> Line Number ----------------------------------- 218"
            );
            if (userTypeResult[0].refUtId == 12) {
              userType = [4, 8, 10, 11];
            } else {
              userType = [4, 8, 10, 11, 12];
            }
            const getEmployeeChangesCountResult = await executeQuery(
              getEmployeeChangesCount,
              [userType]
            );
            console.log(
              " -> Line Number ----------------------------------- 228"
            );
            refDashBoardData = {
              ...refDashBoardData,
              getEmployeeChangesCountResult,
            };
            console.log("refDashBoardData line ----- 233", refDashBoardData);
            break;
          case "Report":
            // console.log("this For report");
            break;
          case "Blogs":
            // console.log("This For Blog");
            break;
          case "Notes":
            // console.log("This For Notes");
            break;
          case "Restrictions":
            // console.log("This for therapist user data");
            break;
          case "Therapistuserdata":
            const therapistUserDataCount = await executeQuery(
              getRegisterCount,
              [CurrentTime()]
            );
            refDashBoardData = { ...refDashBoardData, therapistUserDataCount };
            console.log("refDashBoardData line ----- 263", refDashBoardData);

            break;
          default:
            break;
        }
      }

      let notificationData = {};

      switch (refUserType.refUtId) {
        case 5: {
          // console.log("This Notification For Student");
          break;
        }
        case 7: {
          // Director
          // console.log("This Notification For Director");
          break;
        }
        case 8: {
          // console.log("This Notification For Finance");
          break;
        }
        case 10: {
          // console.log("This Notification For Instructor");
          break;
        }
        case 11: {
          // console.log("This Notification For Therapist");
          break;
        }
      }
      refDashBoardData = { ...refDashBoardData, notificationData };
      console.log("refDashBoardData line ------- 297", refDashBoardData);

      const tokenData = {
        id: decodedToken.id,
        branch: decodedToken.branch,
      };

      const token = generateToken(tokenData, true);
      // console.log("refDashBoardData", refDashBoardData);

      return encrypt(
        {
          success: true,
          message: "DashBoard Data Passed Successfully",
          data: refDashBoardData,
          token: token,
        },
        true
      );
    } catch (error) {
      console.error("Error in Dashboard Data Passing:", error);
      throw error;
    }
  }
  public async staffStudentApprovalV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const getClientData = await executeQuery(fetchClientData1, []);

      const userTypeLabel = await executeQuery(getUserStatusLabel, []);

      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      // Iterate over the array and replace refUtId with the corresponding label
      getClientData.forEach((user) => {
        user.refUtIdLabel = userTypeMap.get(user.refUtId) || "Unknown";
      });

      return encrypt(
        {
          success: true,
          message: "Form Registered Data Passed Successfully",
          data: getClientData,
          token: token,
        },
        true
      );
    } catch (error) {
      // console.error("Error in userRegisterPageDataV1:", error);
      return encrypt(
        {
          success: false,
          message: "Error in userRegisterPageDataV1",
          token: token,
        },
        true
      );
    }
  }
  public async passToThreapistV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const studentId = [userData.refStId];
      const updateUserTypeResult = await executeQuery(
        passToThreapist,
        studentId
      );
      const transId = 4,
        transData = "Pass the Form To Threapist",
        refUpdatedBy = "Front Desk";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        CurrentTime(),
        refUpdatedBy,
        decodedToken.id, //completed
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      if (!updateUserTypeResult.length && !updateHistoryQueryResult.length) {
        return encrypt(
          {
            success: false,
            message: "Error in passing the Form to threapist",
            token: token,
          },
          true
        );
      }

      return encrypt(
        {
          success: true,
          message: "the Form is passed to threapist Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in passing the Form to threapist",
          token: token,
        },
        true
      );
    }
  }
  public async staffApprovalBtnV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const studentId = [userData.refStId, 6, false];
      const updateUserTypeResult = await executeQuery(
        updateUserType,
        studentId
      );
      const transId = 6,
        transData = "Front Office Approve The User",
        refUpdatedBy = "Front Desk";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        CurrentTime(),
        refUpdatedBy,
        decodedToken.id, //completed
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      if (!updateUserTypeResult.length && !updateHistoryQueryResult.length) {
        return encrypt(
          {
            success: false,
            message: "Error in Approval",
            token: token,
          },
          true
        );
      }

      return encrypt(
        {
          success: true,
          message: "Client Approval Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Approval",
          token: token,
        },
        true
      );
    }
  }
  public async staffRejectionBtnV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const studentId = [userData.refStId, 9];
      console.log("userData", userData);
      console.log("studentId", studentId);

      const updateUserTypeResult = await executeQuery(rejectUser, studentId);
      console.log("updateUserTypeResult", updateUserTypeResult);

      const transId = 35,
        transData = userData.comment,
        refUpdatedBy = "Front Desk";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        CurrentTime(),
        refUpdatedBy,
        decodedToken.id, //completed
      ];
      console.log(" -> Line Number ----------------------------------- 441");
      console.log("historyData", historyData);

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      if (!updateUserTypeResult.length && updateHistoryQueryResult) {
        return encrypt(
          {
            success: false,
            message: "Error in Rejection",
            token: token,
          },
          true
        );
      }

      return encrypt(
        {
          success: true,
          message: "User is changed as client",
          token: token,
        },
        true
      );
    } catch (error) {
      console.error("Error in userRegisterPageDataV1:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Rejection",
          token: token,
        },
        true
      );
    }
  }
  public async userSignedUpV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      // const refStId = parseInt(userData.refStId, 10);
      const registeredId = [1, 1];
      const getClientData = await executeQuery(fetchClientData, registeredId);
      const StatusLabel = await executeQuery(getStatusLabel);
      const refStatusLabel = StatusLabel.reduce((acc: any, row: any) => {
        acc[row.refUserStatusId] = row.refStatusType;
        return acc;
      }, {});
      const FollowUpLabel = await executeQuery(getFollowUpLabel);
      const refFollowUpLabel = FollowUpLabel.reduce((acc: any, row: any) => {
        acc[row.refUserFollowUpId] = row.refFollowUpType;
        return acc;
      }, {});

      const Data = {
        refStatusLabel: refStatusLabel,
        refFollowUpLabel: refFollowUpLabel,
      };

      return encrypt(
        {
          success: true,
          message: "Client SignUp Data Passed Successfully",
          data: getClientData,
          token: token,
          label: Data,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Passing Signed Up Data",
          token: token,
        },
        true
      );
    }
  }
  public async userFollowUpV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const userStatus = [
        userData.refStId,
        userData.refStatusId,
        userData.refFollowUpId,
        userData.refComments,
      ];
      const updateUserStatusResult = await executeQuery(
        updateUserStatus,
        userStatus
      );
      const transId = 28,
        transData = "User FollowUp Data Updated",
        refUpdatedBy = "Front Office";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        CurrentTime(),
        refUpdatedBy,
        decodedToken.id, //completed
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      if (!updateHistoryQueryResult.length && !updateUserStatusResult) {
        return encrypt(
          {
            success: false,
            message: "Error in Update FollowUp Details",
            token: token,
          },
          true
        );
      }

      return encrypt(
        {
          success: true,
          message: "Client FollowUp Data is Updated Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in FollowUp Data Updated",
          token: token,
        },
        true
      );
    }
  }
  public async userManagementPageV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    let tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const userTypeLabel = await executeQuery(getUserStatusLabel, []);

      const userData = await executeQuery(getDataForUserManagement, []);
      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      // Iterate over the array and replace refUtId with the corresponding label
      userData.forEach((user) => {
        user.refUtIdLabel = userTypeMap.get(user.refUtId) || "Unknown";
      });

      return encrypt(
        {
          success: true,
          message: "User Management Data Is Passed Successfully",
          data: userData,
          token: token,
        },
        true
      );
    } catch (error) {
      console.error("Error in Passing User Management Page Data:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Passing User Management Page Data",
          token: token,
        },
        true
      );
    }
  }
  public async userDataUpdateV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    let id;
    console.log("decodedToken", decodedToken);
    const staffId = decodedToken.id;
    console.log("staffId  line ------------------- 622", staffId);
    if (userData.refStId == undefined || userData.refStId == null) {
      id = staffId;
    } else {
      id = userData.refStId;
    }
    let tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };

    const token = generateToken(tokenData, true);

    try {
      await client.query("BEGIN");
      for (const section in userData) {
        if (userData.hasOwnProperty(section)) {
          let tableName: string;
          let updatedData, transTypeId, newData, olddata, getUserData, oldData;
          switch (section) {
            case "address":
              tableName = "refUserAddress";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);

              olddata = newData[0];

              userData = { ...userData, olddata };

              transTypeId = 11;
              let refAdAdd1Type: number = 3;
              let refAdAdd2Type: number = 0;

              if (userData.address.addresstype === false) {
                refAdAdd1Type = 1;
                refAdAdd2Type = 2;
              }

              if (userData.olddata.addresstype === false) {
                refAdAdd1Type = 1;
                refAdAdd2Type = 2;
              }

              updatedData = userData.address;
              updatedData = { ...updatedData, refAdAdd1Type, refAdAdd2Type };
              oldData = userData.olddata;
              oldData = { ...oldData, refAdAdd1Type, refAdAdd2Type };

              delete updatedData.addresstype;

              break;
            case "personalData":
              transTypeId = 12;
              tableName = "users";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );

              const date = (newData = await executeQuery(getUserData, [id]));

              function formatDate(isoDate: any) {
                const date = new Date(isoDate);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();

                return `${year}-${month}-${day}`;
              }

              olddata = newData[0];
              olddata.refStDOB = formatDate(olddata.refStDOB);
              userData.personalData.refStDOB = formatDate(
                userData.personalData.refStDOB
              );

              if (userData.personalData.refWeddingDate == "") {
                userData.personalData.refWeddingDate = "null";
              } else {
                userData.personalData.refWeddingDate = formatDate(
                  userData.personalData.refWeddingDate
                );
              }

              if (
                olddata.refWeddingDate == null ||
                olddata.refWeddingDate == ""
              ) {
                olddata.refWeddingDate = "null";
              } else {
                olddata.refWeddingDate = formatDate(olddata.refWeddingDate);
              }

              userData = { ...userData, olddata };
              updatedData = userData.personalData;
              oldData = userData.olddata;
              break;

            case "generalhealth":
              transTypeId = 14;
              tableName = "refGeneralHealth";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.generalhealth;
              oldData = userData.olddata;
              break;

            case "medicalIssue":
              transTypeId = 12;
              tableName = "users";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);
              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.medicalIssue;
              oldData = userData.olddata;
              break;

            case "presentHealth":
              updatedData = userData.presentHealth;
              const refPerHealthId = JSON.stringify(
                updatedData.refPresentHealth
              );
              transTypeId = 16;
              tableName = "refGeneralHealth";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);

              olddata = newData[0];

              olddata.refPerHealthId = JSON.stringify(olddata.refPerHealthId);

              userData = { ...userData, olddata };
              updatedData = { ...updatedData, refPerHealthId };
              delete updatedData.refPresentHealth;

              oldData = userData.olddata;
              break;

            case "communication":
              transTypeId = 15;
              tableName = "refUserCommunication";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.communication;
              oldData = userData.olddata;
              break;

            case "employeeData":
              transTypeId = 20;
              tableName = "refEmployeeData";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.employeeData;
              oldData = userData.olddata;
              break;

            case "DocumentsPath":
              transTypeId = 20;
              tableName = "refEmployeeData";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);
              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.DocumentsPath;
              oldData = userData.olddata;
              break;

            default:
              continue;
          }

          let temp1, temp2;

          temp1 = updatedData;
          temp2 = oldData;
          if (oldData.refPerHealthId && updatedData.refPerHealthId) {
            (temp1 = updatedData), (temp2 = oldData);
            const getLabel = await executeQuery(getPresentHealthLabel, []);

            const userTypeMap = new Map<number, string>(
              getLabel.map((item) => [item.refHealthId, item.refHealth])
            );

            const parsedArray1: number[] = JSON.parse(temp2.refPerHealthId);
            const parsedArray2: number[] = JSON.parse(temp1.refPerHealthId);

            const labelsOldData = parsedArray1.map(
              (userId: number) => userTypeMap.get(userId) || "Unknown"
            );
            const labelsUpdatedData = parsedArray2.map(
              (userId: number) => userTypeMap.get(userId) || "Unknown"
            );

            temp2.refPerHealthId = JSON.stringify(labelsOldData);
            temp1.refPerHealthId = JSON.stringify(labelsUpdatedData);
          }
          const changes = getChanges(temp1, temp2);
          console.log(
            " -> Line Number ----------------------------------- 873"
          );
          console.log("changes", changes);
          for (const key in changes) {
            if (changes.hasOwnProperty(key)) {
              const tempChange = {
                data: changes[key],
                label: reLabelText(key),
              };
              const tempData = {
                [key]: changes[key].newValue,
              };

              const parasHistory = [
                37, //Trance Id
                tempChange, // Trans Data
                id, // trans For
                CurrentTime(), // time
                "Front Office", //updated By
                decodedToken.id, // updater Id
              ];
              const queryResult = await client.query(
                updateHistoryQuery,
                parasHistory
              );

              if (!queryResult) {
                throw new Error("Failed to update the History.");
              }

              const params = [
                id,
                transTypeId,
                tempChange,
                tempData,
                tableName,
                CurrentTime(),
                queryResult.rows[0].transId,
              ];

              const userResult = await client.query(userTempData, params);

              if (!userResult) {
                throw new Error(
                  "Failed to update the profile data from Front Desk"
                );
              }

              const paramsNotification = [queryResult.rows[0].transId, false];
              const notificationResult = await client.query(
                updateNotification,
                paramsNotification
              );
              if (!notificationResult.rowCount) {
                throw new Error("Failed to update The Notification Table.");
              }
            }
          }
          console.log(
            " -> Line Number ----------------------------------- 931"
          );
          console.log("changes", changes);
          await client.query("COMMIT");
        }
      }

      return encrypt(
        {
          success: true,
          message: "user Profile Data is Send for Approval To Update",
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: "Error in updating the profile data",
          token: token,
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async ProfileDataV1(userData: any, decodedToken: any): Promise<any> {
    const client: PoolClient = await getClient();
    let refStId;
    if (userData.refStId == null) {
      refStId = decodedToken.id;
    } else {
      refStId = userData.refStId;
    }

    let tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let profileData = {};
      const Datas = await executeQuery(getProfileData, [refStId]);
      const Data = Datas[0];
      let addresstype = false;
      if (Data.refAdAdd1Type == 3) {
        addresstype = true;
      }

      const address = {
        addresstype: addresstype,
        refAdAdd1: Data.refAdAdd1,
        refAdArea1: Data.refAdArea1,
        refAdCity1: Data.refAdCity1,
        refAdState1: Data.refAdState1,
        refAdPincode1: Data.refAdPincode1,
        refAdAdd2: Data.refAdAdd2,
        refAdArea2: Data.refAdArea2,
        refAdCity2: Data.refAdCity2,
        refAdState2: Data.refAdState2,
        refAdPincode2: Data.refAdPincode2,
      };

      profileData = { ...profileData, address };

      const personalData = {
        refSCustId: Data.refSCustId,
        refStFName: Data.refStFName,
        refStLName: Data.refStLName,
        refStMName: Data.refStMName,
        refStDOB: formatDate(Data.refStDOB),
        refStSex: Data.refStSex,
        refStAge: Data.refStAge,
        refQualification: Data.refQualification,
        refProfilePath: Data.refProfilePath,
        refguardian: Data.refguardian,
        refMaritalStatus: Data.refMaritalStatus,
        refWeddingDate: formatDate(Data.refWeddingDate),
      };

      profileData = { ...profileData, personalData };

      let profileFile = null;
      if (Data.refProfilePath) {
        const profileFilePath = Data.refProfilePath;
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64");
          profileFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "image/jpeg",
          };
        } catch (err) {
          console.error("Error retrieving profile file:", err);
        }
      }
      profileData = { ...profileData, profileFile };

      const EmployeeData = {
        refExperence: Data.refExperence,
        refSpecialization: Data.refSpecialization,
        // refPanPath: Data.refPanPath,
        // refAadharPath: Data.refAadharPath,
        // refCertificationPath: Data.refCertificationPath,
        // refWorkingTime: Data.refWorkingCurrentTime(),
      };

      profileData = { ...profileData, EmployeeData };

      let employeeDocuments: {
        [key: string]: {
          filename: string;
          content: string;
          contentType: string;
          label: string;
        };
      } = {};

      const documentsFile = await executeQuery(getDocuments, [refStId]);
      if (documentsFile.length > 0) {
        for (let i = 0; i < 3; i++) {
          let labelName: string | undefined;
          let Result: string | undefined;

          switch (i) {
            case 0:
              Result = documentsFile[0].refPanPath;
              labelName = "panCard";
              break;
            case 1:
              Result = documentsFile[0].refAadharPath;
              labelName = "AadharCard";
              break;
            case 2:
              Result = documentsFile[0].refCertificationPath;
              labelName = "Certification";
              break;
          }

          if (labelName && Result) {
            // Ensure labelName and Result are defined
            try {
              const fileBuffer = await viewFile(Result);
              const fileBase64 = fileBuffer.toString("base64");
              const data = {
                filename: path.basename(Result),
                content: fileBase64,
                contentType: "application/pdf",
                label: labelName,
              };
              employeeDocuments[labelName] = data;
            } catch (err) {
              console.error("Error retrieving profile file:", err);
            }
          }
        }
      }

      profileData = { ...profileData, employeeDocuments };

      const communication = {
        refCtMobile: Data.refCtMobile,
        refCtEmail: Data.refCtEmail,
        refCtWhatsapp: Data.refCtWhatsapp,
        refUcPreference: Data.refUcPreference,
      };

      profileData = { ...profileData, communication };

      const modeOfCommunicationResult = await executeQuery(
        getCommunicationType,
        []
      );
      const modeOfCommunication = modeOfCommunicationResult.reduce(
        (acc: any, row: any) => {
          acc[row.refCtId] = row.refCtText;
          return acc;
        },
        {}
      );

      profileData = { ...profileData, modeOfCommunication };

      return encrypt(
        {
          success: true,
          message: "Staff profile Data Is Passed Successfully",
          token: token,
          data: profileData,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in passing The Staff Profile Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addEmployeeDocumentV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = userData.decodedToken.id;
    const tokenData = {
      id: userData.decodedToken.id,
      branch: userData.decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let employeeDocuments: {
        [key: string]: {
          filename: string;
          content: string;
          contentType: string;
          label: string;
        };
      } = {};

      for (let i = 0; i < userData.DocumentsPath.length; i++) {
        const params = [userData.DocumentsPath[i].filePath, refStId];
        let labelName: string = userData.DocumentsPath[i].fileName;
        let Result;

        switch (labelName) {
          case "panCard":
            Result = await executeQuery(updateStaffPan, params);
            break;
          case "aadharCard":
            Result = await executeQuery(updateStaffAadhar, params);
            break;
          case "certification":
            Result = await executeQuery(updateStaffCertification, params);
            break;
          default:
            Result = [];
        }
      }

      const documentsFile = await executeQuery(getDocuments, [refStId]);
      if (documentsFile.length > 0) {
        for (let i = 0; i < 3; i++) {
          let labelName: string | undefined;
          let Result: string | undefined;

          switch (i) {
            case 0:
              Result = documentsFile[0].refPanPath;
              labelName = "panCard";
              break;
            case 1:
              Result = documentsFile[0].refAadharPath;
              labelName = "aadharCard";
              break;
            case 2:
              Result = documentsFile[0].refCertificationPath;
              labelName = "certification";
              break;
          }

          if (labelName && Result) {
            try {
              const fileBuffer = await viewFile(Result);
              const fileBase64 = fileBuffer.toString("base64");
              const data = {
                filename: path.basename(Result),
                content: fileBase64,
                contentType: "application/pdf",
                label: labelName,
              };
              employeeDocuments[labelName] = data;
            } catch (err) {
              console.error("Error retrieving profile file:", err);
            }
          }
        }
      }

      const profileFile = { employeeDocuments };

      return encrypt(
        {
          success: true,
          message: "File Stored Successfully",
          token: token,
          profileFile,
        },
        true
      );
    } catch (error) {
      console.error("Error in Storing The Staff Documents:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Storing The Staff Documents",
          token: token,
        },
        true
      );
    }
  }
}
