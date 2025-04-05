import * as Hapi from "@hapi/hapi";

import IRoute from "../helper/routes";
import validate from "./validate";
import {
  UserController,
  UserProfileController,
  FrontDesk,
  Director,
  userDashBoard,
  batchPrograms,
  financeController,
  TrailVideoController,
  NotesController,
  SettingsController,
  FutureClientsController,
  StudentFeesController,
  ForgotPasswordController,
  AttendanceController,
  UserPaymentController,
  TestingController,
  ClassInfoController,
  GoogleWorkSpaceController,
} from "./controller";
import { Logger } from "winston";
import { decodeToken, validateToken } from "../helper/token";

export class UserRouters implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new UserController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/users/login",
          config: {
            handler: controller.userLogin,
            description: "Login Checking",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/users/signup",
          config: {
            handler: controller.userSignUp,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/users/validateUserName",
          config: {
            handler: controller.validateUserName,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/users/validateEmail",
          config: {
            handler: controller.validateEmail,
            description: "Signup Checking",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/validatetoken",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.validateUserV1,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/validateTokenData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.validateUserTokenV1,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/changePassword",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.changePasswordV1,
            description: "Change Password",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class UserProfile implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new UserProfileController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/profile/address",
          config: {
            handler: controller.userAddress,
            description: "Store Address Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/personalData",
          config: {
            handler: controller.personalData,
            description: "Store Personal Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/generalHealth",
          config: {
            handler: controller.userGeneralHealth,
            description: "Store General Health",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/RegisterData",
          config: {
            pre: [{ method: validateToken, assign: "token" }], // Use the validateToken function here
            handler: controller.userRegisterData,
            description: "Store Register Form Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },

        {
          method: "GET",
          path: "/api/v1/profile/passRegisterData",
          config: {
            pre: [{ method: validateToken, assign: "token" }], // Use the validateToken function here
            handler: controller.userRegisterPageData,
            description: "Passing the register Data to the Register Page",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/MemberList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userMemberList,
            description: "Passing the register Data to the Register Page",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/sectionTime",
          config: {
            pre: [{ method: validateToken, assign: "token" }], // Use the validateToken function here
            handler: controller.sectionTime,
            description: "Passing the Member type and class mode",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/PackageTime",
          config: {
            pre: [{ method: validateToken, assign: "token" }], // Use the validateToken function here
            handler: controller.PackageTime,
            description: "Passing the Package Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/userHealthReportUpload",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userHealthReportUpload,
            description: "Uploading the User Health Report",
            tags: ["api", "Users"],
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/deleteMedicalDocument",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deleteMedicalDocument,
            description: "Deleting the Medical Documents",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/SessionUpdate",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.sessionUpdate,
            description: "Updating The Session Detail",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/ThreapyUpdate",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.ThreapyUpdate,
            description: "Updating The User Threapy Count",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class StaffRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new FrontDesk();
      server.route([
        {
          method: "GET",
          path: "/api/v1/staff/dashBoard",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffDashBoard,
            description: "Front Office Dashboard",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/staff/studentApproval",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffStudentApproval,
            description: "Staff Student Approval Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/passToThreapist",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.passToThreapist,
            description: "Pass The Form To Threapist",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/Approvalbtn",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffApprovalBtn,
            description: "Staff Student Approval Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/rejectionbtn",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffRejectionBtn,
            description: "Staff Student Rejection Request",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/staff/userSignedUp",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userSignedUp,
            description: "Staff Student Approval Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/userFollowUp",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userFollowUp,
            description: "Signup User FollowUp Details",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/staff/userManagementPage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userManagementPage,
            description: "Signup User FollowUp Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/userDataUpdate",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataUpdate,
            description: "Staff To Update Student Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/ProfileData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.ProfileData,
            description: "Staff To Update Student Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/addEmployeeDocument",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addEmployeeDocument,
            description: "Add New Staff Or Employee Documents",
            tags: ["api", "Users"],
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class DirectorRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new Director();
      server.route([
        {
          method: "GET",
          path: "/api/v1/director/staff",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.directorStaffPg,
            description: "director Page Staff Module",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userData,
            description: "director Page Staff Module",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/therapist/approvalButton",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.approvalButton,
            description: "therapist Student Approval Button",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/therapist/approvalData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.therapistApprovalData,
            description: "therapist Student Approval Data ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/addEmployee",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addEmployee,
            description: "Add New Staff Or Employee Documents",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/director/userTypeLabel",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userTypeLabel,
            description: "Add New Staff Or Employee Documents",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/addProfileImage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addEmployeeData,
            description: "Add Profile Image ",
            tags: ["api", "Users"],
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
        {
          method: "GET",
          path: "/api/v1/director/userAuditList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userAuditList,
            description: "sending user Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/director/staffAuditList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffAuditList,
            description: "sending Staff Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userUpdateAuditList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userUpdateAuditList,
            description: "sending user Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userUpdateAuditListRead",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userUpdateAuditListRead,
            description: "sending user Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userDataListApproval",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataListApproval,
            description: "sending the list of data to approve ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userDataUpdateApprovalBtn",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataUpdateApprovalBtn,
            description: "Approve User Data Update Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userDataUpdateRejectBtn",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataUpdateRejectBtn,
            description: "Rejecting User Data Update Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/feesStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.feesStructure,
            description: "Sending Fees Structure",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/director/addFeesStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addFeesStructure,
            description: "Sending labels values to add new Fees Structure",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/addNewFeesStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addNewFeesStructure,
            description: "Adding new fees Structure in a table",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/editFeesStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.editFeesStructure,
            description: "Editing the fees Structure in the table",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/deleteFeesStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deleteFeesStructure,
            description: "delete a fees Structure in a table",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/offerStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.offerStructure,
            description: "Sending offer Structure",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/offerOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.offerOptions,
            description: "Get Offer Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/addNewOffersStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addNewOffersStructure,
            description: "add New Offers Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/validateCouponCode",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.validateCouponCode,
            description: "Validate Coupon Code for Offers",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/editOfferStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.editOfferStructure,
            description: "Editing the Offer Structure in the table",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/deleteOfferStructure",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deleteOfferStructure,
            description: "deleting the Offer Structure in the table",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class UserPageRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new userDashBoard();
      server.route([
        {
          method: "GET",
          path: "/api/v1/user/dashBoard",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userDashBoardData,
            description: "User Dash Board Tail Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/user/profileData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userProfileData,
            description: "User Profile Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/user/updateProfile",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userProfileUpdate,
            description: "User Profile Update Process",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class BatchProgram implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new batchPrograms();
      server.route([
        {
          method: "GET",
          path: "/api/v1/batch/birthday",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userBirthdayBatch,
            description: "User BirthDay Wish",
            auth: false,
          },
        },
      ]);
      server.route([
        {
          method: "GET",
          path: "/api/v1/batch/googleMeetAttendance",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.googleMeetAttendance,
            description: "Google Meet Attendance in batch Program",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class Finance implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new financeController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/finance/studentDetails",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.studentDetails,
            description: "send student details for the finance",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/finance/studentProfile",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.studentProfile,
            description: "send student Profile details for the finance",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/finance/studentFeesDetails",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.studentFeesDetails,
            description: "send student Fees details for the finance",
            auth: false,
          },
        },
        // {
        //   method: "POST",
        //   path: "/api/v1/finance/verifyCoupon",
        //   config: {
        //     pre: [{ method: validateToken, assign: "token" }],
        //     handler: UserPage.verifyCoupon,
        //     description: "Verify coupon data",
        //     auth: false,
        //   },
        // },
        {
          method: "POST",
          path: "/api/v1/finance/FeesPaid",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.FeesPaid,
            description: "Store The Fees Paid Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/finance/invoiceDownload",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.invoiceDownload,
            description: "Request invoice Data to Download",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/finance/userPaymentAuditPg",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userPaymentAuditPg,
            description: "Request User Payment Audit Page",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class Settings implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const settingsPage = new SettingsController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/settings/Section",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.SectionData,
            description: "Sending Section Data",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/Section/branch",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.branch,
            description: "sending Branch Data",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/Section/addSectionPage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addSectionPage,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/addNewSection",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addNewSection,
            description: "Adding New Section",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/editSectionData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.editSectionData,
            description: "Section Edit Page Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/deleteSectionData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.deleteSectionData,
            description: "Deleting The Section Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/customClassData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.customClassData,
            description: "Custom Class Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/addCustomClassData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addCustomClassData,
            description: "Custom Class Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/editCustomClassData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.editCustomClassData,
            description: "Editing the Custom Class Name ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/Section/deleteCustomClassData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.deleteCustomClassData,
            description: "Editing the Custom Class Name ",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/generalHealth/Options",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.generalHealthOptions,
            description: "Get the General Health Option List",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/generalHealth/addOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addGeneralHealth,
            description: "Add new Health Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/generalHealth/editOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.editGeneralHealth,
            description: "Updating Health Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/generalHealth/deleteOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.deleteGeneralHealth,
            description: "Delete Health Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/addTiming",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addPackageTiming,
            description: "Adding the Timing for the Package",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/editTiming",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.EditPackageTiming,
            description: "Editing the Timing for the Package",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/package/timingData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.timingData,
            description: "Getting the Timing Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/deleteTiming",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.deleteTiming,
            description: "Delete the Timing Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/Data",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.packageData,
            description: "Get the Package Data",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/package/addOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.packageAddOptions,
            description: "Get the Package Add Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/addPackage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addNewPackage,
            description: "Adding New Package",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/editPackage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.editPackage,
            description: "Editing Package",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/package/CustomClass",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.CustomClassPackageData,
            description: "Get Custom Class Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/CustomClassUpdate",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.CustomClassPackageUpdate,
            description: "Update Custom Class Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/deletePackage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.deletePackage,
            description: "Delete Package",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/introVideo/getData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.introVideoData,
            description: "Get the intro video Data",
            auth: false,
          },
        },
        // Upload the Branch Wise Class Timing Image
        {
          method: "GET",
          path: "/api/v1/settings/browsher/getData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.getBranchData,
            description: "Get the browsher Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/browsher/getBrowsherType",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.getBrowsherType,
            description: "Get the browsher Type",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/browsher/getBranch",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.getBranchToAdd,
            description: "Get the branch",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/browsher/generateUploadLink",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.generateUploadLink,
            description: "Generate The Upload Link",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/browsher/UploadLink",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.UploadLink,
            description: "Upload Browsher Link",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/browsher/getCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.getCategory,
            description: "Get Browsher Category Type",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/browsher/addCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.addCategory,
            description: "add new Browsher Category Type",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/browsher/deleteCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.deleteCategory,
            description: "delete Browsher Category Type",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/browsher/updateCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.updateCategory,
            description: "update Browsher Category Type",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/package/getMeetingLink",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: settingsPage.getMeetingLink,
            description: "get Meeting Link",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class Notes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new NotesController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/Notes/addNotes",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.addNotes,
            description: "Adding New Notes",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/notes/storeNotes",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.notesPdf,
            description: "store Notes Pdf",
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
        {
          method: "POST",
          path: "/api/v1/Notes/deleteNotes",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.deleteNotes,
            description: "Adding New Notes",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class FutureClients implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new FutureClientsController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/futureClients/data",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.futureClientsData,
            description: "Future Client Table Data",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/futureClients/actionBtn",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.futureClientsActionBtn,
            description: "Future Clients Action Button",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/futureClients/auditPage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.futureClientsAuditPage,
            description: "Future Clients Audit Page Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/futureClients/FollowUpAction",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.futureClientsAuditFollowUp,
            description: "Future Clients Followup Action",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class StudentFees implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const studentFessPage = new StudentFeesController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/studentFees/Data",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: studentFessPage.studentFeesData,
            description: "Getting the Student Fees Data",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class ForgotPassword implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const ForgotPasswordPage = new ForgotPasswordController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/forgotPassword/idCheck",
          config: {
            handler: ForgotPasswordPage.verifyUserNameEmail,
            description: "To Validate the User Name or Email ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/forgotPassword/otpValidate",
          config: {
            handler: ForgotPasswordPage.verifyOtp,
            description: "To Validate the  OTP",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/forgotPassword/changePassword",
          config: {
            handler: ForgotPasswordPage.changePassword,
            description: "Changing Password",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class Attendance implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const AttendancePage = new AttendanceController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/attendance/overView",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.attendanceOverView,
            description: "To get the Attendance Over View",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/attendance/session",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.sessionAttendance,
            description: "To get the Session Attendance",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/attendance/userSearch",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.userSearch,
            description: "Search User Deatils",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/attendance/user",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.userAttendance,
            description: "To get the User Attendance",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/attendance/userData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.userData,
            description: "gry userdata",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/attendance/reportOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.attendanceReportOption,
            description: "To get the Attendance Report Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/attendance/report",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: AttendancePage.attendanceReport,
            description: "To get the Attendance Report",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class UserPayment implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new UserPaymentController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/users/payment",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.payment,
            description: "Payment Paylload",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/users/otherPackage",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.otherPackages,
            description: "Payment Paylload",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/verifyCoupon",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.verifyCoupon,
            description: "Verify coupon data",
            auth: false,
          },
        },

        {
          method: "POST",
          path: "/api/v1/userPayment/addPayment",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addPayment,
            description: "Verify coupon data",
            auth: false,
          },
        },

        // {
        //   method: "POST",
        //   path: "/api/v1/userPayment/downloadUserInvoice",
        //   config: {
        //     pre: [{ method: validateToken, assign: "token" }],
        //     handler: controller.downloadInvoice,
        //     description: "Downloading the User Invoice",
        //     auth: false,
        //   },
        // },
        {
          method: "GET",
          path: "/api/v1/userPayment/paymentPageData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.paymentPageData,
            description: "payment Page Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/PayFromDate",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userPaymentPayFromDate,
            description: "Get Payment Start From Month Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/GetTherapyAndOffer",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userPaymentGetTherapyAndOffer,
            description: "Get Therapy amount and 1 month offer Validation ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/offerPointsValidation",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.offerPointsValidation,
            description: "Get offer points validation data ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/newPayment",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userNewPayment,
            description: "Store New Fees Payment",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/invoiceAudit",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.invoiceAudit,
            description: "get the user invoice Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userPayment/invoiceDownload",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.invoiceDownload,
            description: "get the user invoice Data",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class trailVideo implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const TrailVideo = new TrailVideoController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/trailVideo/uploadUrl",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: TrailVideo.uploadUrl,
            description: "Generate Url to Upload Video",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/trailVideo/UpdateUrl",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: TrailVideo.UpdateUrl,
            description: "Update the link in the DB",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/trailVideo/linkGeneration",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: TrailVideo.shareLink,
            description: "Generate and share trail video link",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}

export class ClassInfo implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const ClassInfoPage = new ClassInfoController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/classInfo/overView",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: ClassInfoPage.overView,
            description: "Getting OverView Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/classInfo/overView/chart",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: ClassInfoPage.overViewChart,
            description: "Getting Count for Chart",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/classInfo/currentStudentData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: ClassInfoPage.currentStudentData,
            description: "Getting Current Student Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/classInfo/addUserTherapyCount",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: ClassInfoPage.addUserTherapyCount,
            description: "Adding the student Therapy Count",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/classInfo/monthWiseReport",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: ClassInfoPage.studentMonthWiseReport,
            description: "Getting Student Month Wise Report",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class GoogleWorkSpace implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const GoogleWorkspacePage = new GoogleWorkSpaceController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/googleWorkspace/MeetingLinkType",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.MeetingLinkType,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/CreateMeeting",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.CreateMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/googleWorkspace/MeetingList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.MeetingList,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/DeleteMeeting",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.DeleteMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/DeleteAllMeeting",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.DeleteAllMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/googleWorkspace/GetMeeting",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.GetMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/GetMembersInMeeting",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.GetMembersInMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/AddMembersInMeeting",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.AddMembersInMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/RemoveMemberFromMeeting",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.RemoveMemberFromMeeting,
            description: "For testing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/googleWorkspace/GetMeetingAttendance",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: GoogleWorkspacePage.GetMeetingAttendance,
            description: "For testing",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class Testing implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new TestingController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/test",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.testing,
            description: "For testing",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
