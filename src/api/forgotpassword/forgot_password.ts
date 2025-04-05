import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery } from "../../helper/db";
import {
  ValidateEmailUserName,
  SetOtp,
  getOtp,
  changePassword,
  validateResendMail,
} from "./query";
import { generateTokenOtp, decodeTokenOtp } from "../../helper/token";
import { CurrentTime } from "../../helper/common";
import { sendOtpTemplate } from "../../helper/mailcontent";
import { sendEmail } from "../../helper/mail";
import { error } from "console";
import bcrypt from "bcryptjs";

export class ForgotPasswordRepository {
  public async verifyUserNameEmailV1(userData: any): Promise<any> {
    try {
      let ValidationTextResult = [];
      if (userData.validateText) {
        ValidationTextResult = await executeQuery(ValidateEmailUserName, [
          userData.validateText,
        ]);
      } else if (userData.id) {
        ValidationTextResult = await executeQuery(validateResendMail, [
          userData.id,
        ]);
      }

      let result;
      if (ValidationTextResult.length > 0) {
        function generateNumericOtp(length = 6) {
          let otp = "";
          for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
          }
          return otp;
        }

        const OTP = { otp: generateNumericOtp() };

        const main = async () => {
          const mailOptions = {
            to: ValidationTextResult[0].refCtEmail,
            subject: "Password Request OTP",
            html: sendOtpTemplate(
              ValidationTextResult[0].refStFName +
                " " +
                ValidationTextResult[0].refStLName,
              OTP.otp
            ),
          };

          try {
            await sendEmail(mailOptions);
          } catch (error) {
            console.error("Failed to send email:", error);

            const results = {
              success: false,
              message: "error in sending the resetpassword request",
            };
            return encrypt(results, true);
          }
        };

        await main();
        const tokenOtp = generateTokenOtp(OTP, true);

        const params = [
          ValidationTextResult[0].refStId,
          tokenOtp,
          CurrentTime(),
        ];

        result = await executeQuery(SetOtp, params);
        
      } else {
        const results = {
          success: true,
          validation: false,
          message: "MailId or Username Does not Match",
        };
        return encrypt(results, true);
      }
      const results = {
        success: true,
        validation: true,
        message: "Otp Mail Send Successfully",
        id: result[0].refFPaId,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      const results = {
        success: false,
        message: "error in sending the resetpassword request",
      };
      return encrypt(results, true);
    }
  }
  public async verifyOtpV1(userData: any): Promise<any> {
    type OtpValidation = {
      otp: string;
      iat: number;
      exp: number;
    };

    try {
      const otpResult = await executeQuery(getOtp, [userData.id]);

      if (!otpResult || otpResult.length === 0) {
        const results = {
          success: true,
          validation: false,
          message: "Invalid or Expire OTP",
        };
        return encrypt(results, true);
      }

      const otpValidation = decodeTokenOtp(
        otpResult[0].refOtp
      ) as OtpValidation;

      if (!otpValidation || !otpValidation.otp) {
        const results = {
          success: true,
          validation: false,
          message: "Invalid or Expire OTP",
        };
        return encrypt(results, true);
      }

      if (otpValidation.otp === userData.otp) {
        const results = {
          success: true,
          validation: true,
          message: "OTP Validation Successfully",
          refStId: otpResult[0].refStId,
        };
        return encrypt(results, true);
      } else {
        const results = {
          success: true,
          validation: false,
          message: "Invalid or Expire OTP",
        };
        return encrypt(results, true);
      }
    } catch (error) {
      const results = {
        success: false,
        message: "Error I Validating The Otp",
      };
      return encrypt(results, true);
    }
  }
  public async changePasswordV1(userData: any): Promise<any> {
    try {
      const refStId = userData.id;
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const passwordChangeResult = await executeQuery(changePassword, [
        hashedPassword,
        userData.newPassword,
        refStId,
      ]);

      const results = {
        success: true,
        message: "Password Changed Successfully",
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Changing the Password",
      };
      return encrypt(results, true);
    }
  }
}
