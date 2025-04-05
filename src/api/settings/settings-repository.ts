import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { generateClassDurationString } from "../../helper/common";
import { createURL } from "../../helper/s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: "ap-south-1" });

import {
  getSectionPageData,
  getBranchData,
  getMemberList,
  setNewSection,
  getSessionDays,
  updateSection,
  deleteSection,
  customClass,
  addCustomClass,
  editCustomClass,
  deleteCustomClass,
  getHealthIssue,
  addNewHealthIssue,
  editHealthIssue,
  deleteHealthIssue,
  addPackageTimeQuery,
  editPackageTimeQuery,
  getTimingData,
  deleteCheck,
  deleteTimingQuery,
  addNewPackageQuery,
  getPackageData,
  PackageDataUpdate,
  deletePackage,
  getIntoVideoData,
  getBranch,
  browsherUpdated,
  browsherAdd,
  getBrowsherData,
  getBrowsherType,
  getBrowserType,
  addCategory,
  updateCategory,
  deleteCategory,
  getMeetingLinkQuery,
  getCustomPackageData,
  updateCustomPackageData,
} from "./query";

import { timeFormat } from "../../helper/common";

export class SettingsRepository {
  public async SectionDataV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const branchId = userData.branchId || 1;

    try {
      let getSectionData = await executeQuery(getSectionPageData, [branchId]);
      for (let i = 0; i < getSectionData.length; i++) {
        const { startTime, endTime } = timeFormat(getSectionData[i].refTime);

        getSectionData[i] = { ...getSectionData[i], startTime, endTime };
      }

      const results = {
        success: true,
        message: "Section Data Is Passed Successfully",
        token: token,
        SectionData: getSectionData,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in sending the Section Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async branchV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const getBranch = await executeQuery(getBranchData, []);

      const results = {
        success: true,
        message: "Sending The Branch Data",
        token: token,
        Branch: getBranch,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending the Branch Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addSectionPageV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    // const branchId = userData.branchId || 1;

    try {
      const memberList = await executeQuery(getMemberList, []);
      const SessionDays = await executeQuery(getSessionDays, []);
      const getBranch = await executeQuery(getBranchData, []);

      const results = {
        success: true,
        message: "Member List Data Is Passed Successfully",
        token: token,
        MemberList: memberList,
        SessionDays: SessionDays,
        Branch: getBranch,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error In Passing The Member List Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addNewSectionV1(userData: any, decodedToken: any): Promise<any> {
    const client: PoolClient = await getClient(); // Get the database client

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      await client.query("BEGIN");

      const refTime = userData.fromTime + " to " + userData.fromTo;
      const refTimeMode = userData.refTimeMode;

      const params = [
        refTime,
        refTimeMode,
        userData.refTimeDays,
        userData.refTimeMembersID,
        userData.refBranchId,
      ];

      for (let i = 0; i < userData.refBranchId.length; i++) {
        for (let j = 0; j < userData.refTimeMembersID.length; j++) {
          for (let k = 0; k < userData.refTimeDays.length; k++) {
            const params = [
              refTime,
              refTimeMode,
              userData.refTimeDays[k],
              userData.refTimeMembersID[j],
              userData.refBranchId[i],
            ];
            await client.query(setNewSection, params);
          }
        }
      }

      await client.query("COMMIT");

      const results = {
        success: true,
        message: "New Section Is Added Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error In Adding The New Section",
        token: token,
      };
      return encrypt(results, true);
    } finally {
      client.release();
    }
  }
  public async editSectionDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let refTime = userData.fromTime + " to " + userData.fromTo;
      const params = [
        refTime,
        userData.refTimeMode,
        userData.refTimeDays,
        userData.refTimeMembersID,
        userData.refTimeId,
      ];
      const updateSectionResult = await executeQuery(updateSection, params);
      const results = {
        success: true,
        message: "The Section Update Successfully",
        token: token,
        memberList: getMemberList,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in updating the section Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteSectionDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const deleteSectionResult = await executeQuery(deleteSection, [
        userData.refTimeId,
      ]);
      const results = {
        success: true,
        message: "The Section Update Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in updating the section Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async customClassDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const branchId = userData.branchId || 1;
      const customClassResult = await executeQuery(customClass, [branchId]);
      const results = {
        success: true,
        message: "Custom Class Data is Passed Successfully",
        token: token,
        customClass: customClassResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending the Custom Class Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }

  public async addCustomClassDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let refCustTimeData;
      if (userData.checkValue == false) {
        refCustTimeData = await generateClassDurationString(
          userData.refClassCount,
          userData.refMonthDuration
        );
      } else {
        refCustTimeData = userData.refClassValue;
      }

      const params = [
        userData.refBranchId,
        refCustTimeData,
        userData.refClassCount,
        userData.refMonthDuration,
        userData.refClassValue,
      ];
      const customClassResult = await executeQuery(addCustomClass, params);
      const results = {
        success: true,
        message: "Add Custom Class Data",
        token: token,
        customClass: customClassResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Adding The Custom Class Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async editCustomClassDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const params = [userData.refCustTimeData, userData.refCustTimeId];
      const customClassResult = await executeQuery(editCustomClass, params);
      const results = {
        success: true,
        message: "Edit  Custom Class Data is updated Successfully",
        token: token,
        customClass: customClassResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Editing The Custom Class Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteCustomClassDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const params = [userData.refCustTimeId];
      const customClassResult = await executeQuery(deleteCustomClass, params);
      const results = {
        success: true,
        message: "Deleting  Custom Class Data is updated Successfully",
        token: token,
        customClass: customClassResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Deleting The Custom Class Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async generalHealthOptionsV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const healthOptions = await executeQuery(getHealthIssue, []);
      const results = {
        success: true,
        message: "Health Options is Passed Successfully",
        token: token,
        healthOptions: healthOptions,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending the Health Options ",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async addGeneralHealthV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const healthOptions = await executeQuery(addNewHealthIssue, [
        userData.healthText,
      ]);

      const results = {
        success: true,
        message: "New Health Issue Is Added Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Adding new Health Issue",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async editGeneralHealthV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const healthOptions = await executeQuery(editHealthIssue, [
        userData.healthText,
        userData.refHId,
      ]);

      const results = {
        success: true,
        message: "The Health Issue is Content changed successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in updating the Health Issue",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteGeneralHealthV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const healthOptions = await executeQuery(deleteHealthIssue, [
        userData.refHealthId,
      ]);

      const results = {
        success: true,
        message: "Health Issue Is Deleted Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Deleting the Health Issue",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  // --------------------------------------------------------------------------
  // Package Timing Module
  public async addPackageTimingV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const refTime = userData.fromTime + " to " + userData.fromTo;
      console.log("refTime", refTime);
      const packageTimeResult = await executeQuery(addPackageTimeQuery, [
        refTime,
      ]);

      const results = {
        success: true,
        message: "Timing Added Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Adding the Package Timing ",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async EditPackageTimingV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const refTime = userData.fromTime + " to " + userData.fromTo;
      const packageTimeResult = await executeQuery(editPackageTimeQuery, [
        refTime,
        userData.refTimeId,
      ]);

      const results = {
        success: true,
        message: "Timing Added Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Adding the Package Timing ",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async timingDataV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const packageTimeResult = await executeQuery(getTimingData, []);

      const results = {
        success: true,
        message: "Package Timing is Passed Successfully",
        token: token,
        Data: packageTimeResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Getting the Package Timing ",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteTimingV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const deleteCheckResult = await executeQuery(deleteCheck, [
        userData.refTimeId,
      ]);
      let results;

      if (deleteCheckResult.length > 0) {
        results = {
          success: true,
          check: false,
          message: "Timing is Connected With a Package",
          token: token,
        };
      } else {
        const packageTimeResult = await executeQuery(deleteTimingQuery, [
          userData.refTimeId,
        ]);
        results = {
          success: true,
          message: "Package Timing Is Deleted Successfully",
          token: token,
        };
      }

      // console.log("packageTimeResult", packageTimeResult);
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Deleting the Package Timing",
        token: token,
      };
      return encrypt(results, true);
    }
  }

  // -------------------------------------------------------------------------------
  // Package Module
  public async packageDataV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const branch = userData.branchId || 1;
    console.log("branch line ------- 666", branch);
    try {
      const packageTimeResult = await executeQuery(getPackageData, [branch]);

      const results = {
        success: true,
        message: "Package Data is Passed Successfully",
        token: token,
        package: packageTimeResult,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Sending the Package Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async packageAddOptionsV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const Timing = await executeQuery(getTimingData, []);
      const memberList = await executeQuery(getMemberList, []);
      const SessionDays = await executeQuery(getSessionDays, []);
      const getBranch = await executeQuery(getBranchData, []);

      const results = {
        success: true,
        message: "Package Option Data is Passed Successfully",
        token: token,
        timing: Timing,
        memberList: memberList,
        sessionDays: SessionDays,
        branch: getBranch,
      };
      console.log("results line ----- 712", results);
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending the Package Options",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  // public async addNewPackageV1(userData: any, decodedToken: any): Promise<any> {
  //   const tokenData = {
  //     id: decodedToken.id,
  //     branch: decodedToken.branch,
  //   };
  //   const token = generateToken(tokenData, true);

  //   try {
  //     const Data = userData.newPackageData;
  //     for (let i = 0; i < Data.branch.length; i++) {
  //       const params = [
  //         Data.packageName,
  //         `{${Data.WTiming.join(",")}}`,
  //         `{${Data.WeTiming.join(",")}}`,
  //         Data.sessionmode,
  //         `{${Data.sessiondays.join(",")}}`,
  //         `{${Data.membertype.join(",")}}`,
  //         Data.branch[i],
  //         Data.feesType,
  //         Data.amount,
  //       ];

  //       const queryResult = await executeQuery(addNewPackageQuery, params);
  //     }

  //     const results = {
  //       success: true,
  //       message: "New Package Added Successfully",
  //       token: token,
  //     };
  //     return encrypt(results, true);
  //   } catch (error) {
  //     const results = {
  //       success: false,
  //       message: "Error in Adding New Package",
  //       token: token,
  //     };
  //     return encrypt(results, true);
  //   }
  // }
  public async getMeetingLinkV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      console.log("userData", userData);

      if (!userData.branchId) {
        throw new Error("branchId data is missing");
      }

      const params = [userData.branchId];

      console.log("params", params);

      const Meeting: any = await executeQuery(getMeetingLinkQuery, params);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned package and batch successfully",
          token: token,
          MeetingLink: Meeting,
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
  public async addNewPackageV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const Data = userData.newPackageData;
      console.log("Data line ------ 822", Data);
      for (let i = 0; i < Data.branch.length; i++) {
        console.log("Data line ---- 824", Data.meetingLink[Data.branch[i]]);
        const classduration = Data.feesType === 2 ? Data.packageDuration : 0;
        const classCount = Data.feesType === 2 ? Data.packageClassCount : 0;

        const params = [
          Data.packageName,
          `{${Data.WTiming.join(",")}}`,
          `{${Data.WeTiming.join(",")}}`,
          Data.sessionmode,
          `{${Data.sessiondays.join(",")}}`,
          `{${Data.membertype.join(",")}}`,
          Data.branch[i],
          Data.feesType,
          Data.amount,
          classduration,
          classCount,
          Data.meetingLink[Data.branch[i]].refMeetingId,
        ];

        console.log("packag line ---- 786", params);

        const queryResult = await executeQuery(addNewPackageQuery, params);
        // console.log('queryResult', queryResult.rows)
        console.log("queryResult", queryResult);
      }

      const results = {
        success: true,
        message: "New Package Added Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Adding New Package",
        token: token,
      };
      return encrypt(results, true);
    }
  }

  public async editPackageV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const Data = userData.newPackageData;
      console.log("Data line ----- 876", Data);
      const refPaId = userData.packageId;
      console.log("refPaId", refPaId);

      const params = [
        Data.packageName,
        `{${Data.WTiming.join(",")}}`,
        `{${Data.WeTiming.join(",")}}`,
        Data.sessionmode,
        `{${Data.sessiondays.join(",")}}`,
        `{${Data.membertype.join(",")}}`,
        Data.feesType,
        Data.amount,
        Data.packageDuration,
        Data.packageClassCount,
        Data.refMeetingId,
        refPaId,
      ];

      console.log("params", params);

      const queryResult = await executeQuery(PackageDataUpdate, params);
      console.log("queryResult", queryResult);

      const results = {
        success: true,
        message: "Package Updated Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Updating The Package",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async CustomClassPackageDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const CustomPackageData = await executeQuery(getCustomPackageData, [
        decodedToken.id,
      ]);

      const results = {
        success: true,
        message: "Custom Package Data Passed Successfully",
        token: token,
        data: CustomPackageData,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in getting Custom Package Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async CustomClassPackageUpdateV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const params = [
        userData.refCustomPaId,
        userData.refFeesAmt,
        userData.refMeetingLinkId,
      ];
      console.log("params", params);
      await executeQuery(updateCustomPackageData, params);

      const results = {
        success: true,
        message: "Custom Package Data Updated Successfully",
        token: token,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Updating Custom Package Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deletePackageV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const packageTimeResult = await executeQuery(deletePackage, [
        userData.refPaId,
      ]);
      const results = {
        success: true,
        message: "Package Is Deleted Successfully",
        token: token,
      };

      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in Deleting the Package",
        token: token,
      };
      return encrypt(results, true);
    }
  }

  // intro Video Repository
  public async introVideoDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      console.log(" -> Line Number ----------------------------------- 832");
      const intoVideoData = await executeQuery(getIntoVideoData, []);
      const results = {
        success: true,
        message: "Intro Video Data is Passed Successfully",
        token: token,
        data: intoVideoData,
      };

      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "Error in sending the Intro Video Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  // Browsher Upload
  public async getBranchDataV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const browherData = await executeQuery(getBrowsherData, []);

      const results = {
        success: true,
        message: "Browsher data passed Successfully",
        token: token,
        data: browherData,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending the Browsher data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async getBranchToAddV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const branch = await executeQuery(getBranch, []);

      const results = {
        success: true,
        message: "branch data passed Successfully",
        token: token,
        branch: branch,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Sending the branch data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async getBrowsherTypeV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      console.log(" -> Line Number ----------------------------------- 919");
      console.log("userData.branchId", userData.branchId);
      const browsherType = await executeQuery(getBrowsherType, [
        userData.branchId,
      ]);

      const results = {
        success: true,
        message: "browsher Type Data is Passed Successfully",
        token: token,
        browsherType: browsherType,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Passing The Browsher Type Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async generateUploadLinkV1(
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
      const bucket = "ublis-yoga-buckets";
      const folder = `browsher/${userData.fileName}`;

      const Expires = 300; // 5 minutes expiry
      const ContentType = userData.fileType;

      // Ensure that createURL generates a signed PUT URL
      const UrlResult = await createURL(bucket, folder, Expires, ContentType);

      const results = {
        success: true,
        message: "Browsher Image Upload URL generated successfully",
        token,
        UrlResult,
      };
      return encrypt(results, true);
    } catch (error) {
      console.error("Error generating signed URL:", error);

      const results = {
        success: false,
        message: "Failed to generate Browsher Image upload URL",
        token,
      };
      return encrypt(results, true);
    }
  }
  public async UploadLinkV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      if (userData.refBroId != "") {
        console.log("line ---------- 961");
        const update = await executeQuery(browsherUpdated, [
          userData.refBroId,
          userData.refBroLink,
          userData.refBranchId,
          userData.refBroTypeId,
        ]);

        if (userData.oldlink) {
          try {
            const bucketName = "ublis-yoga-buckets";
            const keyName = userData.oldlink.split(".com/")[1];

            if (!keyName) {
              throw new Error(
                "Invalid old link format. Key extraction failed."
              );
            }

            const command = new DeleteObjectCommand({
              Bucket: bucketName,
              Key: keyName,
            });

            await s3Client.send(command);
          } catch (error) {
            console.error("Error deleting the file from S3:", error);
          }
        } else {
          console.log("No old link provided. Skipping deletion.");
        }
      } else {
        const addBrowsher = await executeQuery(browsherAdd, [
          userData.refBranchId,
          userData.refBroLink,
          userData.refBroTypeId,
        ]);

        console.log("line ------- 1000");
      }

      const results = {
        success: true,
        message: "Browsher image uploaded Successfully",
        token,
      };

      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      console.error("Error uploading the Browsher Image:", error);

      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Failed to upload the Browsher Image",
        token,
      };

      return encrypt(results, true); // Encrypt and return the error response
    }
  }

  // Browsher Category Type
  public async getCategoryV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const browserType = await executeQuery(getBrowserType, []);
      const results = {
        success: true,
        message: "Browsher Category Type Passed Successfully",
        token,
        browserType: browserType,
      };

      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Failed in passing the Catageory type",
        token,
      };

      return encrypt(results, true); // Encrypt and return the error response
    }
  }
  public async addCategoryV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const browserType = await executeQuery(addCategory, [
        userData.refCatageoryName,
      ]);
      const results = {
        success: true,
        message: "new Category Type Added Successfully",
        token,
      };

      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      console.log("error", error);

      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Error IN Adding the New Category Type",
        token,
      };

      return encrypt(results, true); // Encrypt and return the error response
    }
  }
  public async updateCategoryV1(
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
      const params = [userData.refCatId, userData.refCatageoryName];
      console.log(" -> Line Number ----------------------------------- 1138");
      console.log("params", params);
      const browserType = await executeQuery(updateCategory, params);
      const results = {
        success: true,
        message: "Category Type Update Successfully",
        token,
      };

      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      console.log("error", error);

      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Error in updating the category type",
        token,
      };

      return encrypt(results, true); // Encrypt and return the error response
    }
  }
  public async deleteCategoryV1(
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
      const browserType = await executeQuery(deleteCategory, [
        userData.refCatId,
      ]);
      const results = {
        success: true,
        message: "Category Type deleted Successfully",
        token,
      };

      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      console.log("error", error);

      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Error in deleting the category type",
        token,
      };

      return encrypt(results, true); // Encrypt and return the error response
    }
  }
}
