import { executeQuery, getClient } from "../../helper/db";
import {
  insertProfileAddressQuery,
  insertProfileGeneralHealth,
  insertProfilePersonalData,
  fetchProfileData,
  fetchPresentHealthProblem,
  insertCommunicationData,
  updateHistoryQuery,
  fetchBranchList,
  BranchMemberList,
  getSectionTimeData,
  getCustTime,
  fetchCommunicationRef,
  getStudentCount,
  storeMedicalDoc,
  deleteMedDoc,
  getMedDoc,
  PackageTiming,
  updateSessionData,
  insertPackageData,
  updateBranch,
  insertSession,
  checkUser,
  fetchBrowsher,
  updateThreapyCount,
  getOldData,
  updateNotification,
  getUpdatedData,
  oldThearpyData,
  paymentCount,
  addNewPayment,
} from "./query";
import path from "path";

import { encrypt } from "../../helper/encrypt";
import { generateToken, generateToken1 } from "../../helper/token";
import { PoolClient } from "pg";
import { CurrentTime, convertToFormattedDateTime } from "../../helper/common";
import { getSessionPackageChanges } from "../../helper/buildquery";
import { reLabelText } from "../../helper/label";
import {
  storeFile,
  viewFile,
  deleteFile,
  getFileType,
} from "../../helper/storage";
import { sendRegistrationConfirmation } from "../../helper/mailcontent";
import { sendEmail } from "../../helper/mail";
import { Session } from "inspector/promises";

export class ProfileRepository {
  public async userAddressV1(userData: any): Promise<any> {
    let refAdAdd1Type: number = 3;
    let refAdAdd2Type: number = 0;

    if (userData.address.addresstype == false) {
      refAdAdd1Type = 1;
      refAdAdd2Type = 2;
    }

    const params = [
      userData.refStId,
      refAdAdd1Type,
      userData.address.refAdAdd1,
      userData.address.refAdArea1,
      userData.address.refAdCity1,
      userData.address.refAdState1,
      userData.address.refAdPincode1,
      refAdAdd2Type,
      userData.address.refAdAdd2,
      userData.address.refAdArea2,
      userData.address.refAdCity2,
      userData.address.refAdState2,
      userData.address.refAdPincode2,
    ];

    const userResult = await executeQuery(insertProfileAddressQuery, params);
    const results = {
      success: true,
      message: "Address Stored Successfully",
    };
    return encrypt(results, true);
  }
  public async userPersonalDataV1(userData: any): Promise<any> {
    const params = [
      userData.personalData.ref_su_gender,
      userData.personalData.ref_su_qulify,
      userData.personalData.ref_su_occu,
      userData.personalData.ref_su_guardian,
      userData.refStId,
    ];
    const userResult = await executeQuery(insertProfilePersonalData, params);

    const results = {
      message: "Personal Data Stored Successfully",
      updatedData: userResult,
    };
    return encrypt(results, true);
  }
  public async userGeneralHealthV1(userData: any): Promise<any> {
    const refPresentHealthJson = JSON.stringify(
      userData.generalhealth.refPresentHealth
    );

    const params = [
      userData.refStId,
      userData.generalhealth.refHeight,
      userData.generalhealth.refWeight,
      userData.generalhealth.refBlood,
      userData.generalhealth.refBMI,
      userData.generalhealth.refBP,
      userData.generalhealth.refRecentInjuries,
      userData.generalhealth.refRecentInjuriesReason,
      userData.generalhealth.refRecentFractures,
      userData.generalhealth.refRecentFracturesReason,
      userData.generalhealth.refOthers,
      userData.generalhealth.refElse,
      userData.generalhealth.refOtherActivities,
      refPresentHealthJson,
      userData.generalhealth.refMedicalDetails,
      userData.generalhealth.refUnderPhysicalCare,
      userData.generalhealth.refDoctor,
      userData.generalhealth.refHospital,
      userData.generalhealth.refBackPain,
      userData.generalhealth.refProblem,
      userData.generalhealth.refPastHistory,
      userData.generalhealth.refFamilyHistory,
      userData.generalhealth.refAnythingelse,
    ];

    const userResult = await executeQuery(insertProfileGeneralHealth, params);
    const results = {
      success: true,
      message: "Health Data Stored Successfully",
    };
    return encrypt(results, true);
  }
  public async userRegisterDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: decodedToken.id, branch: decodedToken.branch };
    const TokenData = generateToken1(token, true);
    try {
      await client.query("BEGIN");

      userData.refStId = decodedToken.id;
      const refUtId = 2;

      // Step 1: Update personal data in users table
      const paramsProfile = [
        userData.personalData.ref_su_gender, //1
        userData.personalData.ref_su_qulify, //2
        userData.personalData.ref_su_occu, //3
        userData.personalData.ref_su_guardian, //4
        refUtId, //5
        userData.personalData.ref_su_fname, //6
        userData.personalData.ref_su_lname, //7
        userData.personalData.ref_su_dob, //8
        userData.personalData.ref_su_age, //9
        userData.personalData.ref_su_branchId, //10
        userData.personalData.ref_su_MaritalStatus, //11
        userData.personalData.ref_su_WeddingDate, //12
        userData.refStId, //13
        userData.personalData.ref_su_kidsCount, //14
        userData.personalData.ref_su_deliveryType, // 15
        userData.personalData.ref_HealthIssue,
      ];
      const userResult1 = await client.query(
        insertProfilePersonalData,
        paramsProfile
      );

      if (!userResult1.rowCount) {
        throw new Error("Failed to update personal data in the users table.");
      }

      const paramsPackage = [
        userData.refStId, //1
        userData.personalData.ref_Package_Id, //2
        userData.personalData.ref_Class_Mode, //3
        userData.personalData.ref_Batch_Id, //4
        userData.personalData.ref_Weekend_Timing, //5
        userData.personalData.ref_Weekdays_Timing, //6
        // userData.personalData.ref_Threapy, //7
        false,
        userData.personalData.ref_Session_From, //8
        userData.personalData.ref_Session_To, //9
      ];

      const userPackage = await client.query(insertPackageData, paramsPackage);

      if (!userPackage.rowCount) {
        throw new Error("Failed to Insert User Package Data.");
      }

      const communicationType = 3;
      //step2: Insert Communication Data into the refCommunication table
      const parasCommunication = [
        userData.refStId, //1
        userData.personalData.ref_su_Whatsapp, //2
        userData.personalData.ref_su_phoneno, //3
        userData.personalData.ref_su_mailid, //4
        communicationType, //5
        userData.personalData.ref_su_emgContaxt, //6
      ];

      const userResult2 = await client.query(
        insertCommunicationData,
        parasCommunication
      );

      if (!userResult2.rowCount) {
        throw new Error(
          "Failed to insert Communication  data into the refUserCommunication table."
        );
      }

      let refAdAdd1Type: number = 1;
      let refAdAdd2Type: number = 2;
      if (userData.address.addresstype === true) {
        refAdAdd1Type = 3;
        refAdAdd2Type = 0;
      }

      const paramsAddress = [
        userData.refStId,
        refAdAdd1Type,
        userData.address.refAdFlat1,
        userData.address.refAdAdd1,
        userData.address.refAdArea1,
        userData.address.refAdCity1,
        userData.address.refAdState1,
        userData.address.refAdPincode1,
        refAdAdd2Type,
        userData.address.refAdFlat2,
        userData.address.refAdAdd2,
        userData.address.refAdArea2,
        userData.address.refAdCity2,
        userData.address.refAdState2,
        userData.address.refAdPincode2,
      ];

      const userResult3 = await client.query(
        insertProfileAddressQuery,
        paramsAddress
      );

      if (!userResult3.rowCount) {
        throw new Error(
          "Failed to insert address data into the refUserAddress table."
        );
      }

      // Step 3: Insert health-related data into the refGeneralHealth table
      const refPresentHealthJson = JSON.stringify(
        userData.generalhealth.refPresentHealth
      );

      const paramsHealth = [
        userData.refStId, //1
        userData.generalhealth.refHeight, //2
        userData.generalhealth.refWeight, //3
        userData.generalhealth.refBlood, //4
        userData.generalhealth.refBMI, //5
        userData.generalhealth.refRecentInjuries, //6
        userData.generalhealth.refRecentInjuriesReason, //7
        userData.generalhealth.refRecentFractures, //8
        userData.generalhealth.refRecentFracturesReason, //9
        userData.generalhealth.refOthers, //10
        userData.generalhealth.refElse, //11
        userData.generalhealth.refOtherActivities, //12
        refPresentHealthJson, //13
        userData.generalhealth.refMedicalDetails, //14
        userData.generalhealth.refUnderPhysicalCare, //15
        userData.generalhealth.refDoctor, //16
        userData.generalhealth.refHospital, //17
        userData.generalhealth.refBackPain, //18
        userData.generalhealth.refProblem, //19
        userData.generalhealth.refPastHistory, //20
        userData.generalhealth.refFamilyHistory, //21
        userData.generalhealth.refAnythingelse, //22
        userData.generalhealth.refBackPainValue, //23
        userData.generalhealth.refIfBp, //24
        userData.generalhealth.refBpType, //25
        userData.generalhealth.refBP, //26
      ];

      const userResult4 = await client.query(
        insertProfileGeneralHealth,
        paramsHealth
      );

      if (!userResult4.rowCount) {
        throw new Error(
          "Failed to insert health data into the refGeneralHealth table."
        );
      }

      for (
        let i = 0;
        i < userData.MedicalDocuments.uploadDocuments.length;
        i++
      ) {
        const paramsMedicalDocuments = [
          userData.MedicalDocuments.uploadDocuments[i].refMedDocName,
          userData.MedicalDocuments.uploadDocuments[i].refMedDocPath,
          userData.refStId,
        ];
        const userResult6 = client.query(
          storeMedicalDoc,
          paramsMedicalDocuments
        );
      }

      const transTypeId = 3,
        transData = "Registered Form Data",
        refUpdatedBy = "user";

      const parasHistory = [
        transTypeId, //Trance Id
        transData, // Trans Data
        userData.refStId, // trans For
        CurrentTime(), // time
        refUpdatedBy, //updated By
        decodedToken.id, // updater Id
      ];

      const userResult5 = await client.query(updateHistoryQuery, parasHistory);

      if (!userResult5.rowCount) {
        throw new Error("Failed to insert The History In refUserTxnHistory.");
      }

      const countResult = await executeQuery(paymentCount, [CurrentTime()]);
      let newOrderId = convertToFormattedDateTime(CurrentTime());
      newOrderId = `${newOrderId}${(100 + countResult[0].count).toString()}`;
      const transId = userData.Payment.refTransId ? userData.Payment.refTransId : "Offline";

      const PaymentParams = [
        userData.refStId, //1
        newOrderId, //2
        transId, //3
        userData.Payment.refFeesType, //4
        userData.Payment.refFeesPaid, //5
        decodedToken.id, //6
        CurrentTime(), //7
        userData.Payment.refPayStatus, //8
        userData.Payment.refPaymentCharge, //9
        userData.Payment.refPackage, //10
        userData.Payment.refPayFrom, //11
        userData.Payment.refPayTo, //12
        userData.Payment.refPagExp, //13
        userData.Payment.refOffId, //14
        userData.Payment.refOffType, //15
        userData.Payment.refPagFees, //16
        userData.Payment.refTotalClassCount, //17
        userData.Payment.refPayTyId, //18
        userData.Payment.refCustomClass, //19
        userData.Payment.refClimedFreeCourse, //20
        0, //21
      ];
      console.log("params", PaymentParams);
      await client.query(addNewPayment, PaymentParams);

      const history = [
        7,
        "Registration Fess Payed Success",
        userData.refStId,
        CurrentTime(),
        decodedToken.id,
        decodedToken.id,
      ];
      await client.query(updateHistoryQuery, history);

      await client.query("COMMIT");

      const main = async () => {
        const mailOptions = {
          to: userData.personalData.ref_su_mailid,
          subject: "Your application is submited With us successfully",
          html: sendRegistrationConfirmation(
            userData.personalData.ref_su_fname,
            userData.personalData.ref_su_lname
          ),
        };

        try {
          await sendEmail(mailOptions);
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      };

      main().catch(console.error);

      const results = {
        success: true,
        message: "All data stored successfully",
        token: TokenData,
        orderId: newOrderId,
      };
      return encrypt(results, true);
    } catch (error) {
      await client.query("ROLLBACK");

      console.log("error", error);
      const results = {
        success: false,
        message: error,
      };
      return encrypt(results, true);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }
  public async userRegisterPageDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    console.log("refStId", refStId);

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };

    const token = generateToken1(tokenData, true);
    try {
      if (isNaN(refStId)) {
        throw new Error("Invalid refStId. Must be a number. repository");
      }

      const params = [refStId];
      const profileResult = await executeQuery(fetchProfileData, params);
      const refCommunicationResult = await executeQuery(
        fetchCommunicationRef,
        []
      );

      if (!profileResult.length || !refCommunicationResult.length) {
        throw new Error("Profile data not found for refStId: " + refStId);
      }

      function formatDate(isoDate: any) {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
      }

      const profileData = {
        fname: profileResult[0].refStFName,
        lname: profileResult[0].refStLName,
        dob: formatDate(profileResult[0].refStDOB),
        username: profileResult[0].refUserName,
        email: profileResult[0].refCtEmail,
        phone: profileResult[0].refCtMobile,
        age: profileResult[0].refStAge,
      };

      const healthResult = await executeQuery(fetchPresentHealthProblem, []);
      const presentHealthProblem = healthResult.reduce((acc: any, row: any) => {
        acc[row.refHealthId] = row.refHealth;
        return acc;
      }, {});

      const branchResult = await executeQuery(fetchBranchList, []);
      const branchList = branchResult.reduce((acc: any, row: any) => {
        acc[row.refbranchId] = row.refBranchName;
        return acc;
      }, {});

      const registerData = {
        ProfileData: profileData,
        presentHealthProblem: presentHealthProblem,
        branchList: branchList,
        CommunicationLabel: refCommunicationResult,
      };

      return encrypt(
        {
          success: true,
          message: "user Register Page Data is passing successfully",
          data: registerData,
          token: token,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "error in user Register Page Data passing",
          token: token,
        },
        true
      );
    }
  }
  public async userMemberListV1(userData: any): Promise<any> {
    try {
      const refStId = userData.refStId;
      const branchId = userData.branchId;
      const refAge = userData.refAge;

      const MemberList = await executeQuery(BranchMemberList, [refAge]);

      const formattedMemberList = MemberList.reduce((acc, member) => {
        acc[member.refTimeMembersID] = member.refTimeMembers;
        return acc;
      }, {});
      const browsher = await executeQuery(fetchBrowsher, [branchId]);

      const tokenData = {
        id: refStId,
      };

      const token = generateToken1(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "Section Member List",
          token: token,
          data: formattedMemberList,
          browsher: browsher,
        },
        true
      );
    } catch (error) {
      console.error("Error in Section Member List", error);
      throw error;
    }
  }
  public async sectionTimeV1(userData: any): Promise<any> {
    try {
      const refStId = userData.refStId;

      const sectionId = userData.sectionId;
      const branchId = userData.branch;
      const classType = userData.classType === 1 ? "Online" : "Offline";
      const sectionTimeList = await executeQuery(getSectionTimeData, [
        classType,
        branchId,
        sectionId,
      ]);
      const formattedCustTime = sectionTimeList.reduce((acc, member) => {
        acc[member.refPaId] = member.refPackageName;
        return acc;
      }, {});

      const tokenData = {
        id: refStId,
      };

      const token = generateToken1(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "Section Package Data",
          token: token,
          SectionTime: formattedCustTime,
        },
        true
      );
    } catch (error) {
      console.error("Error in Section Package Data", error);
      throw error;
    }
  }
  public async PackageTimeV1(userData: any): Promise<any> {
    try {
      function arrangeTime(custTime: any) {
        const formattedCustTime = custTime.reduce((acc: any, member: any) => {
          acc[member.refTimeId] = member.refTime;
          return acc;
        }, {});

        return formattedCustTime;
      }
      const refStId = userData.refStId;
      const packageId = userData.packageId;
      const packageTimingData = await executeQuery(PackageTiming, [packageId]);
      const custWeekDayTime = await executeQuery(getCustTime, [
        packageTimingData[0].refWTimingId,
      ]);
      const custWeekEndTime = await executeQuery(getCustTime, [
        packageTimingData[0].refWeTimingId,
      ]);

      const tokenData = {
        id: refStId,
      };
      const browsher = await executeQuery(fetchBrowsher, [userData.branchId]);
      const token = generateToken1(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "Section Package Data",
          token: token,
          packageWTiming: arrangeTime(custWeekDayTime),
          packageWeTiming: arrangeTime(custWeekEndTime),
          browsher: browsher,
        },
        true
      );
    } catch (error) {
      console.error("Error in Section Package Data", error);
      throw error;
    }
  }
  public async userHealthReportUploadV1(userData: any): Promise<any> {
    try {
      const file = userData.file;
      let filePath: string | any;
      let profileFile;

      if (file) {
        filePath = await storeFile(file, 3);
      }
      const fileBuffer = await viewFile(filePath);
      const fileBase64 = fileBuffer.toString("base64");
      profileFile = {
        filename: path.basename(filePath),
        content: fileBase64,
        contentType: getFileType(filePath), // Dynamically set content type
      };
      return encrypt(
        {
          success: true,
          message: "File Stored Successfully",
          filePath: filePath,
          file: profileFile,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: true,
          message: "Error In Storing the Medical Documents",
        },
        true
      );
    }
  }
  public async deleteMedicalDocumentV1(userData: any): Promise<any> {
    try {
      let filepath;

      if (userData.refMedDocId) {
        const medDoc = await executeQuery(getMedDoc, [userData.refMedDocId]);
        filepath = medDoc[0].refMedDocPath;
        await executeQuery(deleteMedDoc, [userData.refMedDocId]);
      } else {
        filepath = userData.filePath;
      }

      if (filepath) {
        await deleteFile(filepath);
      }

      return encrypt(
        {
          success: true,
          message: "The Medical File Deleted Successfully",
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: true,
          message: "Error In Deleting the Medical Documents",
        },
        true
      );
    }
  }
  public async sessionUpdateV1(userData: any, decodedToken: any): Promise<any> {
    const client: PoolClient = await getClient();
    const refStId = decodedToken.id;
    const tokenData = { id: decodedToken.id, branch: decodedToken.branch };
    const token = generateToken(tokenData, true);

    try {
      await client.query("BEGIN");

      await client.query(updateBranch, [
        userData.personalData.refBranchId,
        userData.refStId,
      ]);
      const oldData = await executeQuery(getOldData, [userData.refStId]);

      const user = await executeQuery(checkUser, [userData.refStId]);
      const params = [
        userData.refStId,
        userData.personalData.refPaId,
        userData.personalData.refClMode,
        userData.personalData.refBatchId,
        userData.personalData.refWeekTiming,
        userData.personalData.refWeekDaysTiming,
      ];
      if (user.length > 0) {
        await client.query(updateSessionData, params);
      } else {
        await client.query(insertSession, params);
      }
      const getDataParams = [
        userData.personalData.refBranchId,
        userData.personalData.refPaId,
        userData.personalData.refBatchId,
        userData.personalData.refClMode,
        userData.personalData.refWeekDaysTiming,
        userData.personalData.refWeekTiming,
      ];
      const updatedData = await executeQuery(getUpdatedData, getDataParams);

      const changes = getSessionPackageChanges(updatedData[0], oldData);
      console.log(" -> Line Number ----------------------------------- 678");
      console.log("changes", changes);

      for (const key in changes) {
        if (changes.hasOwnProperty(key)) {
          const tempChange = {
            data: changes[key],
            label: reLabelText(key),
          };

          const parasHistory = [
            36,
            tempChange,
            userData.refStId,
            CurrentTime(),
            "therapist/Admin",
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

      await client.query("COMMIT");

      const results = {
        success: true,
        message: "Session Data Is Updated Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error in updating the Session Data",
        token: token,
      };
      return encrypt(results, true);
    } finally {
      client.release();
    }
  }
  public async ThreapyUpdateV1(userData: any, decodedToken: any): Promise<any> {
    const client: PoolClient = await getClient();
    const refStId = decodedToken.id;
    const tokenData = { id: decodedToken.id, branch: decodedToken.branch };
    const token = generateToken(tokenData, true);

    try {
      await client.query("BEGIN");
      const olddata = await executeQuery(oldThearpyData, [userData.id]);
      const result: any = await client.query(updateThreapyCount, [
        userData.id,
        userData.threapyCount,
      ]);
      console.log("result", result);

      const changes: any = {
        refThreapyCount: {
          oldValue: olddata[0].refThreapyCount,
          newValue: result.rows[0].refThreapyCount,
        },
      };
      console.log(" -> Line Number ----------------------------------- 765");
      console.log("changes", changes);

      for (const key in changes) {
        if (changes.hasOwnProperty(key)) {
          const tempChange = {
            data: changes[key],
            label: reLabelText(key),
          };

          const parasHistory = [
            40,
            tempChange,
            userData.id,
            CurrentTime(),
            "therapist/Admin",
            decodedToken.id,
          ];
          console.log("parasHistory", parasHistory);

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
      await client.query("COMMIT");

      const results = {
        success: true,
        message: "User threapy Count Is Update Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      await client.query("ROLLBACK");
      const results = {
        success: false,
        message: "Error in updatig the user threapy count",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
