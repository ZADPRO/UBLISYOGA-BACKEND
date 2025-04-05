import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery } from "../../helper/db";
import { getFeesStructure } from "./query";
import { formatDate } from "../../helper/common";

export class StudentFeesRepository {
  public async studentFeesDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
        branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let feeDataResult = await executeQuery(getFeesStructure, [
        userData.refUtId,
      ]);
      for (let i = 0; i < feeDataResult.length; i++) {
        feeDataResult[i].refDate = formatDate(feeDataResult[i].refDate);
      }
      const results = {
        success: true,
        message: "Fees Data is Passed Successfully",
        token: token,
        feeData: feeDataResult,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Passing The Fees Data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
