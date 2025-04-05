import { executeQuery, getClient } from "../../helper/db";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { viewFile, deleteFile, storeFile } from "../../helper/storage";
import path from "path";
import { PoolClient } from "pg";
import { sendEmail } from "../../helper/mail";
import { getAdjustedTime } from "../../helper/common";
import {
  staffDetailSend,
  updateDataApproval,
  updateDataRejection,
  sendTrialApprovalMail,
} from "../../helper/mailcontent";
import { CurrentTime } from "../../helper/common";

import {
  queryStaffDetails,
  getUserStatusLabel,
  getDataForUserManagement,
  getUserTransaction,
  getUserTypeLabelDirector,
  getUserTypeLabelAdmin,
  insertUserQuery,
  insertUserDomainQuery,
  insertUserCommunicationQuery,
  updateHistoryQuery,
  fetchFormSubmitedData,
  updateUserType,
  updateUserProfile,
  getUserProfile,
  getUpDateList,
  userUpdateAuditData,
  userAuditDataRead,
  getTempData,
  updateTempData,
  userUpdateApprovalList,
  getMailId,
  getStaffUpdateList,
  fetchBranchList,
  getFeesStructure,
  getMemberList,
  getCustTimeData,
  checkFeesStructure,
  editFeesStructure,
  deleteFeesStructure,
  getOfferStructure,
  getOffersName,
  insertNewOffers,
  editOffers,
  deleteOffers,
  validateCouponCode,
  getEmployeeCount,
  getUserType,
  getTransaction,
  getPackageQuery,
  getBatchQuery,
  getPackageOptions,
  getBatchOption,
} from "./query";
import { encrypt } from "../../helper/encrypt";
import { generateToken, decodeToken } from "../../helper/token";
import { generateCouponCode, formatDate } from "../../helper/common";
import { classCount } from "../../helper/classCount";

export class DirectorRepository {
  public async directorStaffPgV1(
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
      const userTypeLabel = await executeQuery(getUserStatusLabel, []);
      let userType = [];
      const userTypeResult = await executeQuery(getUserType, [decodedToken.id]);
      if (userTypeResult[0].refUtId == 12) {
        userType = [4, 8, 10, 11];
      } else {
        userType = [4, 8, 10, 11, 12];
      }
      const StaffData = await executeQuery(queryStaffDetails, [userType]);
      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      StaffData.forEach((user) => {
        user.refUserTypeName = userTypeMap.get(user.refUtId) || "Unknown";
      });

      const personalTransaction = await executeQuery(getUserTransaction, [
        decodedToken.id,
      ]);
      const Transaction = await executeQuery(getTransaction, [decodedToken.id]);

      const results = {
        success: true,
        message: "staff Data Is Passed Successfully",
        token: token,
        data: StaffData,
        personalTransaction: personalTransaction,
        Transaction: Transaction,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "error in staff Data Is Passed Successfully",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async userDataV1(userData: any, decodedToken: any): Promise<any> {
    const staffId = decodedToken.id;
    const Id = userData.refStId;

    let tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const userTypeLabel = await executeQuery(getUserStatusLabel, []);

      const userData = await executeQuery(getDataForUserManagement, [Id]);

      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      userData.forEach((user) => {
        user.refUtIdLabel = userTypeMap.get(user.refUtId) || "Unknown";
      });

      const userTransaction = await executeQuery(getUserTransaction, [Id]);

      function formatDate(inputDate: any) {
        let [datePart] = inputDate.split(",");
        let [day, month, year] = datePart.trim().split("/");
        let formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        return String(formattedDate);
      }

      let formattedDate = formatDate(CurrentTime());
      const Count = await classCount(formattedDate, Id);
      const therapyCount = {
        totalSession: userData[0].refThreapyCount,
        attendSession: userData[0].refThreapyAttend,
        reSession: userData[0].refThreapyCount - userData[0].refThreapyAttend,
      };

      const data = {
        UserData: userData,
        userTransaction: userTransaction,
        classCount: Count,
        therapyCount: therapyCount,
      };

      return encrypt(
        {
          success: true,
          message: "Director User Data",
          data: data,
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      return encrypt(
        {
          success: false,
          message: "Error in Director User Data",
          token: token,
        },
        true
      );
    }
  }
  public async therapistApprovalDataV1(
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
      const getClientData = await executeQuery(fetchFormSubmitedData, []);

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
          message: "therapist Approval Data is Passed Successfully",
          data: getClientData,
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: true,
          message: "error in therapist Approval Data",
          token: token,
        },
        true
      );
    }
  }
  public async approvalButtonV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    console.log(" -> Line Number ----------------------------------- 214");
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const studentId = [
        userData.refStId,
        6,
        userData.isTherapy,
        userData.threapyCount,
      ];
      const updateUserTypeResult = await executeQuery(
        updateUserType,
        studentId
      );
      console.log("updateUserTypeResult line ------- \n", updateUserTypeResult);

      const mailIdResult = await executeQuery(getMailId, [userData.refStId]);

      const main = async () => {
        const mailOptions = {
          to: mailIdResult[0].refCtEmail,
          subject: "Your Application Is Completed Successfully",
          html: sendTrialApprovalMail(
            updateUserTypeResult[0].refStFName,
            updateUserTypeResult[0].refStLName
          ),
        };

        try {
          await sendEmail(mailOptions);
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      };

      main().catch(console.error);

      const transId = 5,
        transData = "Therapist Approve The User",
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

      if (!updateUserTypeResult.length && !updateHistoryQueryResult.length) {
        return encrypt(
          {
            success: false,
            message: "Error in Therapist Approval",
            token: token,
          },
          true
        );
      }

      return encrypt(
        {
          success: true,
          message: "Client is Approved By Therapist",
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      return encrypt(
        {
          success: false,
          message: "Error in Therapist Approval Button",
          token: token,
        },
        true
      );
    }
  }
  public async userTypeLabelV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const users = await executeQuery(getUserType, [decodedToken.id]);
      let label;
      if (users[0].refUtId == 7) {
        label = await executeQuery(getUserTypeLabelDirector, []);
      } else {
        label = await executeQuery(getUserTypeLabelAdmin, []);
      }
      const branch = await executeQuery(fetchBranchList, []);

      return encrypt(
        {
          success: true,
          message: "successfully pass the User Type Label",
          token: token,
          userTypeLabel: label,
          branch: branch,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "error in passing the User Type Label Passing",
          token: token,
        },
        true
      );
    }
  }
  public async addEmployeeV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let bId = userData.refbranchId.toString().padStart(2, "0");

      const employeeCountResult = await executeQuery(getEmployeeCount, [bId]);

      const userCount = parseInt(employeeCountResult[0].count, 10);

      let newEmployeeId = `UY${bId}S${(userCount + 1)
        .toString()
        .padStart(3, "0")}`;

      const params = [
        userData.refFName,
        userData.refLName,
        userData.refDob,
        newEmployeeId,
        userData.refUserType,
        userData.refPanCard,
        userData.refAadharCard,
        userData.refbranchId,
      ];

      const userResult = await executeQuery(insertUserQuery, params);

      function formatDate(isoDate: any) {
        const date = new Date(isoDate); // Create a new Date object
        const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (0-based) and pad with zero
        const year = date.getFullYear(); // Get the full year

        return `${year}`; // Return formatted date
      }

      const newUser = userResult[0];

      const dobYear = formatDate(userData.refDob);

      const password = `${userData.refFName.toUpperCase()}$${dobYear}`;

      const hashedPassword = await bcrypt.hash(password, 10);

      const domainParams = [
        newUser.refStId,
        newEmployeeId,
        newEmployeeId,
        password,
        hashedPassword,
        userData.refEmail,
      ];

      const domainResult = await executeQuery(
        insertUserDomainQuery,
        domainParams
      );
      const communicationParams = [
        newUser.refStId,
        userData.refPhone,
        userData.refEmail,
      ];

      const communicationResult = await executeQuery(
        insertUserCommunicationQuery,
        communicationParams
      );

      if (
        userResult.length > 0 &&
        domainResult.length > 0 &&
        communicationResult.length > 0
      ) {
        const main = async () => {
          const mailOptions = {
            to: userData.refEmail, // Replace with the recipient's email
            subject: "The Director has added you to Ublis Yoga Private Limited", // Subject of the email
            html: staffDetailSend(domainResult[0].refCustId, password),
          };

          // Call the sendEmail function
          try {
            await sendEmail(mailOptions);
          } catch (error) {
            console.error("Failed to send email:", error);
          }
        };

        main().catch(console.error);

        const history = [
          19,
          "New Employee Added",
          newUser.refStId,
          CurrentTime(),
          "Director",
          decodedToken.id,
        ];
        const updateHistory = await executeQuery(updateHistoryQuery, history);

        if (updateHistory && updateHistory.length > 0) {
          const tokenData = {
            id: decodedToken.id,
            branch: decodedToken.branch,
          };
          const encryptedResponse = encrypt(
            {
              success: true,
              message: "New Employee Data Is Stored Successfully",
              token: generateToken(tokenData, true),
            },
            false
          );
        }
      }
      return encrypt(
        {
          success: true,
          message: "New Employee Added Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "error in Adding New Employee",
          token: token,
        },
        true
      );
    }
  }
  public async addEmployeeDataV1(
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
      const params = [userData.filePath, refStId];
      const getProfileUrl = await executeQuery(getUserProfile, [refStId]); // Get old file path from DB

      // Remove the old file if a profile URL exists
      if (getProfileUrl.length > 0 && getProfileUrl[0].refProfilePath) {
        const oldFilePath = getProfileUrl[0].refProfilePath;
        try {
          await deleteFile(oldFilePath);
        } catch (err) {
          return encrypt(
            {
              success: false,
              message: "Failed to Change or Upload the Profile Image",
              token: token,
            },
            true
          );
        }
      }

      // Store the new file as usual
      const profileUrl = await executeQuery(updateUserProfile, params);
      let profileFile;

      if (profileUrl.length > 0) {
        const profileFilePath = userData.filePath; // New file path
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64"); // Convert file to base64 for response
          profileFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "image/jpeg", // Assuming JPEG, modify if necessary
          };
        } catch (err) {
          console.error("Error retrieving profile file:");
          profileFile = null;
        }
      }

      return encrypt(
        {
          success: true,
          message: "File Stored Successfully",
          token: token,
          filePath: profileFile || "No profile file available",
        },
        true
      );
    } catch (error) {
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
  public async userAuditListV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const getList = await executeQuery(getUpDateList, []);
      for (let i = 0; i < getList.length; i++) {
        getList[i].refDate = formatDate(getList[i].refDate);
      }

      return encrypt(
        {
          success: true,
          message: "User Update Audit list Data is Send Successfully",
          token: token,
          data: getList,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in User Update Audit list Data Sending",
          token: token,
        },
        true
      );
    }
  }
  public async staffAuditListV1(
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
      const getList = await executeQuery(getStaffUpdateList, []);
      for (let i = 0; i < getList.length; i++) {
        getList[i].refDate = formatDate(getList[i].refDate);
      }

      return encrypt(
        {
          success: true,
          message: "Staff Update Audit list Data is Send Successfully",
          token: token,
          data: getList,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Staff Update Audit list Data Sending",
          token: token,
        },
        true
      );
    }
  }
  public async userUpdateAuditListV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const id = userData.refStId;
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const getList = await executeQuery(userUpdateAuditData, [id]);
      return encrypt(
        {
          success: true,
          message: "User Update Audit Page Data is Send Successfully",
          token: token,
          data: getList,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in User Update Audit Data Sending",
          token: token,
        },
        true
      );
    }
  }
  public async userDataListApprovalV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const id = userData.refStId;
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let getList = await executeQuery(userUpdateApprovalList, [id]);
      for (let i = 0; i < getList.length; i++) {
        if (
          getList[i] &&
          getList[i].refChanges &&
          (getList[i].refChanges.label === "Aadhar Card " ||
            getList[i].refChanges.label === "Pan Card" ||
            getList[i].refChanges.label === "Certification")
        ) {
          const filePath = getList[i].refChanges.data?.newValue;
          if (filePath) {
            const fileBuffer = await viewFile(filePath);
            const fileBase64 = fileBuffer.toString("base64");

            const documentData = {
              filename: path.basename(filePath),
              content: fileBase64,
              contentType: "application/pdf",
              label: getList[i].refChanges.label,
            };

            getList[i].refChanges.data.newValue = documentData;
          }
        }
      }

      return encrypt(
        {
          success: true,
          message: "post User Update Approval List",
          token: token,
          data: getList,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Sending User Approval List",
          token: token,
        },
        true
      );
    }
  }
  public async userUpdateAuditListReadV1(
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
      for (let i = 0; i < userData.transId.length; i++) {
        const getList = await executeQuery(userAuditDataRead, [
          true,
          refStId,
          userData.transId[i],
        ]);
        if (!getList) {
          console.log(
            "the mark as read for notification is failed to update for",
            userData.transId[i]
          );
        }
      }

      return encrypt(
        {
          success: true,
          message: "User Audit Notification Is Marked as Read Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in updating the notification as read",
          token: token,
        },
        true
      );
    }
  }
  public async userDataUpdateApprovalBtnV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const staffId = decodedToken.id;
    const id = userData.refStId;
    const userAppId = userData.userAppId;
    let tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let mailId = await executeQuery(getMailId, [id]);
      let changeData: any[] = [];
      mailId = mailId[0].refCtEmail;
      for (let i = 0; i < userAppId.length; i++) {
        const tempData = await executeQuery(getTempData, [userAppId[i]]);
        const transTypeId = tempData[0].transTypeId;
        await client.query("BEGIN");
        for (const section in userData) {
          if (userData.hasOwnProperty(section)) {
            const tableName: string = tempData[0].refTable;

            const updatedData = tempData[0].refData;

            const changes = tempData[0].refChanges;

            const identifier = { column: "refStId", value: id };

            const { updateQuery, values } = buildUpdateQuery(
              tableName,
              updatedData,
              identifier
            );

            const userResult = await client.query(updateQuery, values);

            if (!userResult.rowCount) {
              throw new Error(
                "Failed to update the profile data from Front Desk"
              );
            }

            const userResult1 = await client.query(updateTempData, [
              "approve",
              userAppId[i],
            ]);

            if (!userResult1.rowCount) {
              throw new Error("Failed to Delete the Tem Data");
            }

            for (const key in changes) {
              if (changes.hasOwnProperty(key)) {
                const parasHistory = [
                  21,
                  changes,
                  id,
                  CurrentTime(),
                  "Admin / Director",
                  decodedToken.id,
                ];

                const queryResult = await client.query(
                  updateHistoryQuery,
                  parasHistory
                );

                const { data, label } = changes;
                const Data = {
                  oldValue: data.oldValue,
                  newValue: data.newValue,
                  label: label,
                };
                const isDuplicate = changeData.some(
                  (item) =>
                    item.label === Data.label &&
                    item.oldValue === Data.oldValue &&
                    item.newValue === Data.newValue
                );

                if (!isDuplicate) {
                  changeData.push(Data);
                }

                if (!queryResult) {
                  throw new Error("Failed to update the History.");
                }

                if (!queryResult) {
                  throw new Error("Failed to update the History.");
                }

                const getList = await client.query(userAuditDataRead, [
                  true,
                  staffId,
                  tempData[0].refTransId,
                ]);

                if (!getList) {
                  throw new Error("Failed to update Audit Page.");
                }
                await client.query("COMMIT");
              }
            }
          }
        }
      }

      const main = async () => {
        const tableRows = Object.values(changeData)
          .map(
            (data: any) => `
          <tr>
          <td>${data.label}</td>
          <td>${data.oldValue}</td>
          <td>${data.newValue}</td>
          </tr>`
          )
          .join("");
        const mailOptions = {
          to: Array.isArray(mailId) ? mailId.join(",") : mailId,
          subject:
            "Director Approved Your Profile Changes Submitted by Front Office",
          html: updateDataApproval(tableRows),
        };

        // Call the sendEmail function
        try {
          await sendEmail(mailOptions);
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      };

      main().catch(console.error);

      return encrypt(
        {
          success: true,
          message: "user Profile Data Update is Approved",
          token: token,
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error in updating the profile data",
        token: token,
      };
      return encrypt(results, true);
    } finally {
      client.release();
    }
  }
  public async userDataUpdateRejectBtnV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const staffId = decodedToken.id;
    const id = userData.refStId;
    const userAppId = userData.userAppId;
    let tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let mailId = await executeQuery(getMailId, [id]);
      let changeData: any[] = [];
      mailId = mailId[0].refCtEmail;
      for (let i = 0; i < userAppId.length; i++) {
        const tempData = await executeQuery(getTempData, [userAppId[i]]);
        const transTypeId = 22;

        await client.query("BEGIN");
        for (const section in userData) {
          if (userData.hasOwnProperty(section)) {
            const changes = tempData[0].refChanges;

            const userResult1 = await client.query(updateTempData, [
              "reject",
              userAppId[i],
            ]);

            if (!userResult1.rowCount) {
              throw new Error("Failed to Reject the Tem Data");
            }

            for (const key in changes) {
              if (changes.hasOwnProperty(key)) {
                const parasHistory = [
                  transTypeId,
                  changes,
                  id,
                  CurrentTime(),
                  "Admin / Director",
                  decodedToken.id,
                ];

                const queryResult = await client.query(
                  updateHistoryQuery,
                  parasHistory
                );

                const { data, label } = changes;
                const Data = {
                  oldValue: data.oldValue,
                  newValue: data.newValue,
                  label: label,
                };
                const isDuplicate = changeData.some(
                  (item) =>
                    item.label === Data.label &&
                    item.oldValue === Data.oldValue &&
                    item.newValue === Data.newValue
                );

                if (!isDuplicate) {
                  changeData.push(Data); // Push only if not a duplicate
                }

                if (!queryResult) {
                  throw new Error("Failed to update the History.");
                }

                if (!queryResult) {
                  throw new Error("Failed to update the History.");
                }

                const getList = await client.query(userAuditDataRead, [
                  true,
                  staffId,
                  tempData[0].refTransId,
                ]);

                if (!getList) {
                  throw new Error("Failed to update Audit Page.");
                }
                await client.query("COMMIT");
              }
            }
          }
        }
      }
      const main = async () => {
        const tableRows = Object.values(changeData)
          .map(
            (data: any) => `
          <tr>
          <td>${data.label}</td>
          <td>${data.oldValue}</td>
          <td>${data.newValue}</td>
          </tr>`
          )
          .join("");
        const mailOptions = {
          to: Array.isArray(mailId) ? mailId.join(",") : mailId,
          subject:
            "Director Rejected Your Profile Changes Submitted by Front Office",
          html: updateDataRejection(tableRows),
        };

        // Call the sendEmail function
        try {
          await sendEmail(mailOptions);
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      };

      main().catch(console.error);
      return encrypt(
        {
          success: true,
          message: "user update Profile Data is Rejected ",
          token: token,
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error in Rejecting the profile data",
        token: token,
      };
      return encrypt(results, true);
    } finally {
      client.release();
    }
  }
  public async feesStructureV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      userData.refBranchId = userData.refBranchId || 1;
      const feesStructure = await executeQuery(getFeesStructure, [
        userData.refBranchId,
      ]);
      const BranchList = await executeQuery(fetchBranchList, []);

      return encrypt(
        {
          success: true,
          message: "Fess Structure Data Is Passed Successfully",
          token: token,
          FessData: feesStructure,
          Branch: BranchList,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending Fees Structure Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addFeesStructureV1(
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
      const timeData = await executeQuery(getCustTimeData, []);
      const memberList = await executeQuery(getMemberList, []);

      return encrypt(
        {
          success: true,
          message: "Fess Structure Data Is Passed Successfully",
          token: token,
          timeData: timeData,
          memberList: memberList,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending Select fees Option Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addNewFeesStructureV1(
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
      let checkFeesResult;
      for (let i = 0; i < userData.refMemberType.length; i++) {
        for (let j = 0; j < userData.refSessionType.length; j++) {
          const params = [
            userData.refBranchId,
            userData.refMemberType[i],
            userData.refSessionType[j],
            userData.refFees,
            userData.refGst,
            userData.refTotal,
            userData.refAmtPerDay,
          ];
          checkFeesResult = await executeQuery(checkFeesStructure, params);
        }
      }

      // if (checkFeesResult[0].ResultStatus == false) {
      //   return encrypt(
      //     {
      //       success: false,
      //       message: "The Fees is Already Exit",
      //       token: token,
      //       data: checkFeesResult,
      //     },
      //     true
      //   );
      // } else {
      //   return encrypt(
      //     {
      //       success: true,
      //       message: "New Fees Is Added Successfully",
      //       token: token,
      //       data: checkFeesResult,
      //     },
      //     true
      //   );
      // }
      return encrypt(
        {
          success: true,
          message: "New Fees Is Added Successfully",
          token: token,
          data: checkFeesResult,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Adding New Fees",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async editFeesStructureV1(
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
      const params = [
        userData.refFeId,
        userData.refFees,
        userData.refGst,
        userData.refTotal,
        userData.refAmtPerDay,
      ];
      const updateFeesResult = await executeQuery(editFeesStructure, params);

      return encrypt(
        {
          success: true,
          message: "Fees Structure is Updated Successfully",
          token: token,
          data: updateFeesResult,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Updating Fees Structure",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteFeesStructureV1(
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
      const params = [userData.refFeId];
      const updateFeesResult = await executeQuery(deleteFeesStructure, params);

      return encrypt(
        {
          success: true,
          message: "Fees Structure is Deleted Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Deleting Fees Structure",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async offerStructureV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    function formatDate(isoDate: any) {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }
    try {
      userData.refOfferId = userData.refOfferId || 1;
      let branchId = userData.refBranchId || 1;
      const params = [userData.refOfferId, branchId];
      console.log("params", params);

      const offersStructure = await executeQuery(getOfferStructure, params);
      const BranchList = await executeQuery(fetchBranchList, []);
      console.log("BranchList", BranchList);

      for (let i = 0; i < offersStructure.length; i++) {
        console.log(
          " -> Line Number ----------------------------------- 1312",
          i
        );
        offersStructure[i].refStartAt = formatDate(
          offersStructure[i].refStartAt
        );
        offersStructure[i].refEndAt = formatDate(offersStructure[i].refEndAt);
      }
      console.log(" -> Line Number ----------------------------------- 1318");
      const offerName = await executeQuery(getOffersName, []);
      console.log("offerName", offerName);
      console.log(" -> Line Number ----------------------------------- 1320");
      return encrypt(
        {
          success: true,
          message: "Offers Structure Data Is Passed Successfully",
          token: token,
          offersStructure: offersStructure,
          offerName: offerName,
          BranchList: BranchList,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Sending Offers Structure Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async getPackageAndBatchV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      if (!userData.branchId) {
        throw new Error("branchId data is missing");
      }

      const params = [userData.branchId];
      console.log("params", params);

      const Package: any = await executeQuery(getPackageQuery, params);
      console.log("Package", Package);
      const batch: any = await executeQuery(getBatchQuery);
      console.log("batch", batch);
      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned package and batch successfully",
          token: token,
          Package: Package,
          batch: batch,
        },
        true
      );
    } catch (error) {
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

  public async offerOptionsV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };

    const token = generateToken(tokenData, true);
    try {
      const packageOption = await executeQuery(getPackageOptions, [
        userData.branchId,
      ]);
      const batchOption = await executeQuery(getBatchOption);
      return encrypt(
        {
          success: true,
          message: "Offers Option Data",
          token: token,
          packageOption: packageOption,
          batchOption: batchOption,
        },
        true
      );
    } catch (error) {
      console.error("Error in Adding New Offer:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Adding New Offer",
          token: token,
        },
        true
      );
    }
  }
  public async addNewOffersStructureV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };

    console.log("userData line ---- 1432", userData);
    const token = generateToken(tokenData, true);
    try {
      console.log(" -> Line Number ----------------------------------- 1435");
      const params = [
        userData.refOfferId,
        userData.refMin,
        userData.refOffer,
        userData.refStartAt,
        userData.refEndAt,
        userData.refCouponCode,
        userData.refContent,
        userData.refBranchId || 1,
        userData.refPackage,
        userData.refBatch,
      ];
      console.log("params line ----- 1446", params);

      const newOffersResult = await executeQuery(insertNewOffers, params);
      console.log("newOffersResult", newOffersResult);

      return encrypt(
        {
          success: true,
          message: "New Offer Is Added Successfully",
          token: token,
          data: newOffersResult,
        },
        true
      );
    } catch (error) {
      console.error("Error in Adding New Offer: line ---- 1462", error);
      return encrypt(
        {
          success: false,
          message: "Error in Adding New Offer",
          token: token,
        },
        true
      );
    }
  }

  public async validateCouponCodeV1(
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
      const params = [userData.CouponCode];
      const couponCodeValidateResult = await executeQuery(
        validateCouponCode,
        params
      );

      if (couponCodeValidateResult[0]) {
        return encrypt(
          {
            success: false,
            message: "Coupon Code Already Exit",
            token: token,
          },
          true
        );
      } else {
        return encrypt(
          {
            success: true,
            message: "Coupon Code is Unique",
            token: token,
          },
          true
        );
      }
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Validating Coupon Code",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async editOfferStructureV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    console.log("userData line ------ 1528", userData);
    const token = generateToken(tokenData, true);
    function formatDate(isoDate: any) {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    }
    try {
      userData.refStartAt = formatDate(userData.refStartAt);
      userData.refEndAt = formatDate(userData.refEndAt);

      const params = [
        userData.refOfId,
        userData.refMin,
        userData.refOffer,
        userData.refStartAt,
        userData.refEndAt,
        userData.refContent,
        userData.refPackage,
        userData.refBatch,
      ];
      console.log("params", params);
      const updateFeesResult = await executeQuery(editOffers, params);

      return encrypt(
        {
          success: true,
          message: "Offers Structure is Updated Successfully",
          token: token,
          data: updateFeesResult,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Updating Offers Structure",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteOfferStructureV1(
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
      const params = [userData.refOfId];
      const updateFeesResult = await executeQuery(deleteOffers, params);

      return encrypt(
        {
          success: true,
          message: "Offers Structure is Deleted Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Deleting Offers Structure",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
