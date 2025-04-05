import { executeQuery, getClient } from "../../helper/db";
import {
  buildUpdateQuery,
  getChanges,
  buildInsertQuery,
  getChanges1,
} from "../../helper/buildquery";
import { PoolClient } from "pg";
import path from "path";
import { viewFile, getFileType } from "../../helper/storage";
import { reLabelText } from "../../helper/label";
import { getAdjustedTime, CurrentTime } from "../../helper/common";

import {
  checkQuery,
  getCustomerCount,
  insertUserQuery,
  insertUserDomainQuery,
  selectUserByUsername,
  selectUserByEmailQuery,
  insertUserCommunicationQuery,
  updateHistoryQuery,
  selectUserData,
  getSingInCount,
  getFollowUpCount,
  getRegisterResult,
  getUserType,
  getProfileData,
  fetchPresentHealthProblem,
  getCommunicationType,
  updateProfileAddressQuery,
  getPresentHealthLabel,
  updateNotification,
  selectUserByrefStId,
  changePassword,
  checkEmailQuery,
  fetMedDocData,
} from "./query";
import { getUserData as rawGetUserDataQuery } from "./query";
import { encrypt } from "../../helper/encrypt";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, generateToken1 } from "../../helper/token";

export class UserRepository {
  public async userLoginV1(user_data: any, domain_code?: any): Promise<any> {
    const params = [user_data.username];
    const users = await executeQuery(selectUserByUsername, params);

    if (users.length > 0) {
      const user = users[0];

      // Verify the password
      const validPassword = await bcrypt.compare(
        user_data.password,
        user.refCustHashedPassword
      );
      if (validPassword) {
        const history = [
          2,
          "Login",
          user.refStId,
          CurrentTime(),
          "User",
          user.refStId,
        ];

        const updateHistory = await executeQuery(updateHistoryQuery, history);

        const refStId = [user.refStId];
        console.log("refStId line ----- 72", refStId);
        const userData = await executeQuery(selectUserData, refStId);
        console.log("userData line ------ 74", userData);

        const signinCount = await executeQuery(getSingInCount, [
          CurrentTime(),
          user.refStId,
        ]);
        console.log("signinCount line ----- 80", signinCount);

        const followUpCount = await executeQuery(getFollowUpCount, refStId);
        console.log(" -> Line Number ----------------------------------- 83");
        const status2 =
          followUpCount.length > 0 ? followUpCount[0].status : null;
        console.log(" -> Line Number ----------------------------------- 86");
        const getRegisterCount = await executeQuery(getRegisterResult, refStId);
        console.log(" -> Line Number ----------------------------------- 88");
        const status3 =
          getRegisterCount.length > 0 ? getRegisterCount[0].status : null;
        console.log(" -> Line Number ----------------------------------- 91");
        let result: boolean = true;
        console.log(" -> Line Number ----------------------------------- 93");
        if (status2 == false || status3 == false) {
          result = false;
        }
        console.log(" -> Line Number ----------------------------------- 97");
        const registerBtn = {
          signUpCount: signinCount[0].result,
          followUpCount: result,
          refUtId: userData,
        };
        console.log("registerBtn", registerBtn);
        console.log(" -> Line Number ----------------------------------- 103");
        if (updateHistory && updateHistory.length > 0) {
          const tokenData = {
            id: user.refStId,
            branch: user.refBranchId,
          };
          console.log(
            " -> Line Number ----------------------------------- 109\n\n\n\n\n\n\n\n\n\n\n"
          );
          return encrypt(
            {
              success: true,
              message: "Login successful",
              token: generateToken(tokenData, true),
              data: registerBtn,
            },
            true
          );
        }
      }
    }

    // Return error if user not found or invalid password
    // return { success: false, message: "Invalid email or password" };
    return encrypt(
      {
        success: false,
        message: "Invalid email or password",
      },
      true
    );
  }
  public async changePasswordV1(
    user_data: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const users = await executeQuery(selectUserByrefStId, [refStId]);
    if (users.length > 0) {
      const user = users[0];

      const validPassword = await bcrypt.compare(
        user_data.oldPassword,
        user.refCustHashedPassword
      );

      if (validPassword) {
        const hashedPassword = await bcrypt.hash(user_data.newPassword, 10);
        const result = await executeQuery(changePassword, [
          hashedPassword,
          user_data.newPassword,
          refStId,
        ]);

        if (result.length > 0) {
        }

        // const history = [
        //   19,
        //   CurrentTime(),
        //   // getAdjustedTime(),
        //   user.refStId,
        //   "User",
        //   "Password Changed",
        // ];

        const history = [
          24,
          "Password Changed",
          user.refStId,
          CurrentTime(),
          "User",
          decodedToken.id,
        ];

        const updateHistory = await executeQuery(updateHistoryQuery, history);

        if (updateHistory && updateHistory.length > 0) {
          const tokenData = {
            id: decodedToken.id,
            branch: decodedToken.branch,
          };

          return encrypt(
            {
              success: true,
              message: "Password Changed Successfully",
              token: generateToken(tokenData, true),
            },
            true
          );
        }
      }
    }

    return encrypt(
      {
        success: false,
        message: "error in Changing the Password",
      },
      true
    );
  }
  public async userSignUpV1(userData: any, domain_code?: any): Promise<any> {
    const hashedPassword = await bcrypt.hash(userData.temp_su_password, 10);
    const userId = uuidv4();

    const check = [userData.temp_su_username];

    const userCheck = await executeQuery(checkQuery, check);
    const userFind = userCheck[0];

    if (userFind) {
      return encrypt(
        {
          success: false,
          message: "Username Already Exist",
        },
        true
      );
      // return { success: false, message: "Username Already Exist" };
    } else {
      const userCountResult = await executeQuery(getCustomerCount);
      const userCount = parseInt(userCountResult[0].count, 10); // Extract and convert count to a number

      let newCustomerId;
      if (userCount >= 0) {
        newCustomerId = `UBY${(10000 + userCount + 1).toString()}`; // Generate the ID
      }
      let userType = 1;

      const params = [
        userData.temp_su_fname, // refStFName
        userData.temp_su_lname, // refStLName
        userData.temp_su_dob, // refStDOB
        userData.temp_su_age, // refStAge
        newCustomerId,
        userType,
      ];

      const userResult = await executeQuery(insertUserQuery, params);
      const newUser = userResult[0];

      const domainParams = [
        newUser.refStId, // refStId from users table
        newUser.refSCustId, // refCustId from users table
        userData.temp_su_username, // refcust Username
        userData.temp_su_password, // refCustPassword
        hashedPassword, // refCustHashedPassword
        userData.temp_su_email,
      ];

      const domainResult = await executeQuery(
        insertUserDomainQuery,
        domainParams
      );

      const communicationParams = [
        newUser.refStId, // refStId from users table
        userData.temp_su_phone,
        userData.temp_su_email,
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
        // const history = [
        //   1,
        //   CurrentTime(),
        //   // getAdjustedTime(),
        //   newUser.refStId,
        //   "user",
        //   "User SignUp",
        // ];
        const history = [
          1,
          "SignUp",
          newUser.refStId,
          CurrentTime(),
          "User",
          newUser.refStId,
        ];

        const updateHistory = await executeQuery(updateHistoryQuery, history);

        // Check if the history update was successful
        if (updateHistory && updateHistory.length > 0) {
          const tokenData = {
            id: newUser.refStId, // refStId from users table
            email: userData.temp_su_email,
            custId: newUser.refSCustId,
            status: newUser.refSUserStatus,
          };
          return encrypt(
            {
              success: true,
              message: "User signup successful",
              user: newUser,
              token: generateToken(tokenData, true),
            },
            true
          );
        } else {
          return encrypt(
            {
              success: false,
              message: "Failed to update history",
            },
            true
          );
          // return { success: false, message: "Failed to update history" };
        }
      } else {
        return encrypt(
          {
            success: false,
            message: "Signup failed",
          },
          true
        );
        // return { success: false, message: "Signup failed" };
      }
    }
  }
  public async validateUserNameV1(
    userData: any,
    domain_code?: any
  ): Promise<any> {
    const check = [userData.temp_su_username];

    const userCheck = await executeQuery(checkQuery, check);
    const userFind = userCheck[0];

    if (userFind) {
      return encrypt(
        {
          success: false,
          message: "Username Already Exist",
        },
        true
      );
    } else {
      return encrypt(
        {
          success: true,
          message: "username is unique",
        },
        true
      );
    }
  }
  public async validateEmailV1(userData: any, domain_code?: any): Promise<any> {
    const check = [userData.temp_su_email];

    const userEmailCheck = await executeQuery(checkEmailQuery, check);
    const userFind = userEmailCheck[0];
    if (userFind) {
      return encrypt(
        {
          success: false,
          message: "Email Id Already Exist",
        },
        true
      );
    } else {
      return encrypt(
        {
          success: true,
          message: "Email Id is Unique",
        },
        true
      );
    }
  }
  public async validateUsers(
    userData: any,
    decodedToken: any,
    domain_code?: any
  ): Promise<any> {
    try {
      const refStId = decodedToken.id;
      const id = [refStId];
      const user = await executeQuery(selectUserData, id);

      const signinCount = await executeQuery(getSingInCount, [
        CurrentTime(),
        refStId,
      ]);
      const followUpCount = await executeQuery(getFollowUpCount, id);
      const status2 = followUpCount.length > 0 ? followUpCount[0].status : null;

      const getRegisterCount = await executeQuery(getRegisterResult, id);
      const status3 =
        getRegisterCount.length > 0 ? getRegisterCount[0].status : null;
      let result: boolean = true;
      if (status2 == false || status3 == false) {
        result = false;
      }
      const registerBtn = {
        signUpCount: signinCount[0].result,

        followUpCount: result,
        refUtId: userData,
      };

      const tokenData = {
        id: decodedToken.id,
        branch: decodedToken.branch,
        UserType: user,
      };

      const token = generateToken1(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "user Validate Token",
          token: token,
          data: user,
          registerBtn: registerBtn,
        },
        true
      );
    } catch (error) {
      throw error;
    }
  }
  public async validateTokenData(
    userData: any,
    decodedToken: any,
    domain_code?: any
  ): Promise<any> {
    try {
      const refStId = decodedToken.id;

      const id = [refStId];
      const user = await executeQuery(selectUserData, id);
      let profileFile;
      if (user[0].refProfilePath) {
        const profileFilePath = user[0].refProfilePath;
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

      const tokenData = {
        id: decodedToken.id,
        branch: decodedToken.branch,
        UserType: user[0].refUtId,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "user Validate Token",
          token: token,
          data: user,
          profileFile: profileFile,
        },
        true
      );
    } catch (error) {
      const tokenData = {
        id: decodedToken.id,
        branch: decodedToken.branch,
      };

      const token = generateToken(tokenData, true);
      return encrypt(
        {
          success: false,
          message: "user Token Validation Fails",
          token: token,
        },
        true
      );
    }
  }
  public async userDashBoardDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    try {
      // const refStId = decodedToken.id;
      const refStId = 78;
      const userType = await executeQuery(getUserType, [refStId]);
      let refDashBoardData = {};

      const tokenData = {
        id: decodedToken.id,
        branch: decodedToken.branch,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "DashBoard Data Passed Successfully",
          token: token,
          data: refDashBoardData,
        },
        true
      );
    } catch (error) {
      console.error("Error in Dashboard Data Passing:", error);
      throw error;
    }
  }
  public async userProfileDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    console.log(" -> Line Number ----------------------------------- 523");
    console.log("decodedToken", decodedToken);
    const id = decodedToken.id;
    console.log(" -> Line Number ----------------------------------- 523");
    console.log("id", id);
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };

    let refStId;
    const checkUser = await executeQuery(getUserType, [id]);
    if (
      checkUser[0].refUtId == 5 ||
      checkUser[0].refUtId == 6 ||
      checkUser[0].refUtId == 2 ||
      checkUser[0].refUtId == 3
    ) {
      refStId = id;
    } else {
      refStId = userData.refStId;
    }

    const token = generateToken(tokenData, true);

    try {
      let profileData = {};
      const Datas = await executeQuery(getProfileData, [refStId]);
      const Data = Datas[0];
      let addresstype = false;

      if (Data.refAdAdd1Type == 3) {
        addresstype = true;
      }

      function formatDate(isoDate: any) {
        const date = new Date(isoDate); // Create a new Date object
        const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (0-based) and pad with zero
        const year = date.getFullYear(); // Get the full year

        return `${year}-${month}-${day}`; // Return formatted date
      }

      const address = {
        addresstype: addresstype,
        refAdFlat1: Data.refAdFlat1,
        refAdAdd1: Data.refAdAdd1,
        refAdArea1: Data.refAdArea1,
        refAdCity1: Data.refAdCity1,
        refAdState1: Data.refAdState1,
        refAdPincode1: Data.refAdPincode1,
        refAdFlat2: Data.refAdFlat2,
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
        refStDOB: Data.refStDOB == null ? null : formatDate(Data.refStDOB),
        refStSex: Data.refStSex,
        refStAge: Data.refStAge,
        refQualification: Data.refQualification,
        refOccupation: Data.refOccupation,
        refProfilePath: Data.refProfilePath,
        refguardian: Data.refguardian,
        refUserName: Data.refUserName,
        refMaritalStatus: Data.refMaritalStatus,
        refWeddingDate:
          Data.refWeddingDate == null ? null : formatDate(Data.refWeddingDate),
        refBranchId: Data.refBranchId,
        refDeliveryType: Data.refDeliveryType,
        refKidsCount: Data.refKidsCount,
        refBranchName: Data.refBranchName,
        refTimeMembers: Data.refTimeMembers,
        refClMode: Data.refClMode,
        refClassMode: Data.refClMode,
        refPackageName: Data.refPackageName,
        weekEndTimingId: Data.weekEndTimingId,
        weekEndTiming: Data.weekEndTiming,
        weekDaysTimingId: Data.weekDaysTimingId,
        weekDaysTiming: Data.weekDaysTiming,
        refStId: Data.refStId,
        refTherapy: Data.refTherapy,
        refHealthIssue: Data.refHealthIssue,
      };

      profileData = { ...profileData, personalData };

      let profileFile = null;
      if (Data.refProfilePath) {
        const profileFilePath = Data.refProfilePath;
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64"); // Convert file to base64 to pass in response
          profileFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "image/jpeg", // Assume JPEG, adjust if necessary
          };
        } catch (err) {
          console.error("Error retrieving profile file:", err);
        }
      }

      profileData = { ...profileData, profileFile }; // Add file to profile data

      const generalhealth = {
        refHeight: Data.refHeight,
        refWeight: Data.refWeight,
        refBlood: Data.refBlood,
        refBMI: Data.refBMI,
        refIfBP: Data.refIfBP,
        refBpType: Data.refBpType,
        refBP: Data.refBP,
        refRecentInjuries: Data.refRecentInjuries,
        refRecentInjuriesReason: Data.refRecentInjuriesReason,
        refRecentFractures: Data.refRecentFractures,
        refRecentFracturesReason: Data.refRecentFracturesReason,
        refOthers: Data.refOthers,
        refElse: Data.refElse,
      };

      profileData = { ...profileData, generalhealth };

      const presentHealth = {
        refPresentHealth: Data.refPerHealthId,
        refOtherActivities: Data.refOtherActivities,
        refMedicalDetails: Data.refMedicalDetails,
        refUnderPhysicalCare: Data.refUnderPhysCare,
        refDoctor: Data.refDrName,
        refHospital: Data.refHospital,
        refBackPain: Data.refBackpain,
        refBackPainValue: Data.refBackPainValue,
        refProblem: Data.refProblem,
        refPastHistory: Data.refPastHistory,
        refFamilyHistory: Data.refFamilyHistory,
        refAnythingelse: Data.refAnythingelse,
      };

      profileData = { ...profileData, presentHealth };

      const communication = {
        refCtMobile: Data.refCtMobile,
        refCtEmail: Data.refCtEmail,
        refCtWhatsapp: Data.refCtWhatsapp,
        refUcPreference: Data.refUcPreference,
        refEmerContact: Data.refEmerContact,
      };

      profileData = { ...profileData, communication };

      const healthResult = await executeQuery(fetchPresentHealthProblem, []);

      const presentHealthProblem = healthResult.reduce((acc: any, row: any) => {
        acc[row.refHealthId] = row.refHealth;
        return acc;
      }, {});

      profileData = { ...profileData, presentHealthProblem };

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

      const refSessionData = {
        refTimeMembersId: Data.refTimeMembersId,
        refTimeMembers: Data.refTimeMembers,
        refCustTimeId: Data.refCustTimeId,
        refCustTimeData: Data.refCustTimeData,
        refTime:
          Data.refTime + "  |  " + Data.refTimeMode + "  |  " + Data.refDays,
        refTimeId: Data.refTimeId,
        refClassMode: Data.refClassMode,
      };

      profileData = { ...profileData, refSessionData };

      let getMedDocument = await executeQuery(fetMedDocData, [refStId]);

      if (getMedDocument.length > 0) {
        for (let i = 0; i < getMedDocument.length; i++) {
          if (getMedDocument[i].refMedDocPath.length > 0) {
            const filePath = getMedDocument[i].refMedDocPath;
            const fileBuffer = await viewFile(filePath);
            const fileBase64 = fileBuffer.toString("base64");

            const profileFile = {
              filename: path.basename(filePath),
              content: fileBase64,
              contentType: getFileType(filePath),
            };

            getMedDocument[i].refMedDocFile = profileFile;
          }
        }
      }

      return encrypt(
        {
          success: true,
          message: "profile Data Is Passed Successfully",
          token: token,
          data: profileData,
          Documents: getMedDocument,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
      return encrypt(
        {
          success: false,
          message: "error in sending Profile Data",
          token: token,
        },
        true
      );
    }
  }
  public async userProfileUpdateV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    let refStId;
    if (!userData.refStId) {
      refStId = decodedToken.id;
    } else {
      refStId = userData.refStId;
    }
    console.log("userData line ------- 773", userData);
    console.log("refStId", refStId);

    const tokenData = { id: decodedToken.id, branch: decodedToken.branch };
    const token = generateToken(tokenData, true);

    let refUtId: string;

    const checkUser = await executeQuery(getUserType, [refStId]);

    if (checkUser[0].refUtId == 5 || checkUser[0].refUtId == 6) {
      refUtId = "user";
    } else {
      refUtId = "staff";
    }

    try {
      await client.query("BEGIN");
      for (const section in userData) {
        if (userData.hasOwnProperty(section)) {
          let tableName: string;
          let updatedData, transTypeId, newData, olddata, getUserData;
          let oldData;
          switch (section) {
            case "address":
              console.log(
                " -> Line Number ----------------------------------- 797"
              );
              tableName = "refUserAddress";

              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              console.log("getUserData line ----- 806 \n", getUserData);
              newData = await executeQuery(getUserData, [refStId]);
              console.log("newData line ----- 806", newData);

              olddata = newData[0];
              console.log("olddata line ----- 808", olddata);

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
              newData = await executeQuery(getUserData, [refStId]);

              function formatDate(isoDate: any) {
                const date = new Date(isoDate);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();

                return `${year}-${month}-${day}`;
              }

              olddata = newData[0];
              olddata.refStDOB = formatDate(olddata.refStDOB);
              userData = { ...userData, olddata };
              userData.personalData.refStDOB = formatDate(
                userData.personalData.refStDOB
              );
              updatedData = userData.personalData;
              oldData = userData.olddata;
              break;

            case "medicalIssue":
              transTypeId = 12;
              tableName = "users";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];

              userData = { ...userData, olddata };

              updatedData = userData.medicalIssue;
              oldData = userData.olddata;
              break;

            case "generalhealth":
              transTypeId = 14;
              tableName = "refGeneralHealth";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.generalhealth;
              oldData = userData.olddata;
              break;

            case "employeedata":
              transTypeId = 20;
              tableName = "refEmployeeData";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );

              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.generalhealth;
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
              newData = await executeQuery(getUserData, [refStId]);

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
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.communication;
              oldData = userData.olddata;
              break;

            case "medicalDocuments":
              transTypeId = 18;
              tableName = "refMedicalDocuments";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData;
              userData = { ...userData, olddata };
              updatedData = userData.medicalDocuments;
              oldData = userData.olddata;
              break;

            default:
              continue;
          }
          const identifier = { column: "refStId", value: refStId };
          let userResult;

          if (userData.medicalDocuments) {
            for (let i = 0; i < userData.medicalDocuments.length; i++) {
              if (userData.medicalDocuments[i].refMedDocId) {
                const identifier = {
                  column: "refMedDocId",
                  value: userData.medicalDocuments[i].refMedDocId,
                };
                const { updateQuery, values } = buildUpdateQuery(
                  tableName,
                  updatedData[i],
                  identifier
                );

                userResult = await client.query(updateQuery, values);
              } else {
                updatedData[i] = { ...updatedData[i], refStId: refStId };

                const { insertQuery, values } = buildInsertQuery(
                  tableName,
                  updatedData[i]
                );

                userResult = await client.query(insertQuery, values);
              }
            }
            getUserData = rawGetUserDataQuery.replace(
              "{{tableName}}",
              tableName
            );
            newData = await executeQuery(getUserData, [refStId]);

            olddata = newData;
            oldData = olddata;
          } else {
            const { updateQuery, values } = buildUpdateQuery(
              tableName,
              updatedData,
              identifier
            );

            userResult = await client.query(updateQuery, values);
          }

          if (oldData.refPerHealthId && updatedData.refPerHealthId) {
            const getLabel = await executeQuery(getPresentHealthLabel, []);

            const userTypeMap = new Map<number, string>(
              getLabel.map((item) => [item.refHealthId, item.refHealth])
            );

            const parsedArray1: number[] = JSON.parse(oldData.refPerHealthId);
            const parsedArray2: number[] = JSON.parse(
              updatedData.refPerHealthId
            );

            const labelsOldData = parsedArray1.map(
              (userId: number) => userTypeMap.get(userId) || "Unknown"
            );
            const labelsUpdatedData = parsedArray2.map(
              (userId: number) => userTypeMap.get(userId) || "Unknown"
            );

            oldData.refPerHealthId = JSON.stringify(labelsOldData);
            updatedData.refPerHealthId = JSON.stringify(labelsUpdatedData);
          }

          let changes: any;
          if (userData.medicalDocuments) {
            changes = getChanges1(updatedData, oldData);
          } else {
            changes = getChanges(updatedData, oldData);
          }

          console.log("changes", changes);
          for (const key in changes) {
            if (changes.hasOwnProperty(key)) {
              const tempChange = {
                data: changes[key],
                label: reLabelText(key),
              };

              const parasHistory = [
                transTypeId,
                tempChange,
                refStId,
                CurrentTime(),
                "User",
                decodedToken.id,
              ];

              const queryResult = await client.query(
                updateHistoryQuery,
                parasHistory
              );
              if (!queryResult.rowCount) {
                throw new Error("Failed to update the History.");
              }
              const paramsNotification = [queryResult.rows[0].transId, false];
              const notificationResult = await client.query(
                updateNotification,
                paramsNotification
              );
              if (!notificationResult.rowCount) {
                throw new Error("Failed to update The Notification Table.");
              }

              await client.query("COMMIT");
            }
          }
        }
      }

      return encrypt(
        {
          success: true,
          message: "Profile data updated  successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      console.log("error", error);
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
}
