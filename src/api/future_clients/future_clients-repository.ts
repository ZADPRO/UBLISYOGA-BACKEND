import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { PoolClient } from "pg";
import {
  fetchClientData,
  getStatusLabel,
  getFollowUpLabel,
  getFutureClientAuditData,
  updateHistoryQuery,
  updateUserStatus,
  maxFollowUp,
} from "./query";
import { executeQuery, getClient } from "../../helper/db";
import { CurrentTime } from "../../helper/common";

export class FutureClientsRepository {
  public async futureClientsDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const registeredId = [1, 1];
      const getClientData = await executeQuery(fetchClientData, registeredId);
      // const StatusLabel = await executeQuery(getStatusLabel, []);
      // const refStatusLabel = StatusLabel.reduce((acc: any, row: any) => {
      //   acc[row.refUserStatusId] = row.refStatusType;
      //   return acc;
      // }, {});
      // const FollowUpLabel = await executeQuery(getFollowUpLabel, []);
      // const refFollowUpLabel = FollowUpLabel.reduce((acc: any, row: any) => {
      //   acc[row.refUserFollowUpId] = row.refFollowUpType;
      //   return acc;
      // }, {});

      // const Data = {
      //   refStatusLabel: refStatusLabel,
      //   refFollowUpLabel: refFollowUpLabel,
      // };

      return encrypt(
        {
          success: true,
          message: "Client SignUp Data Passed Successfully",
          data: getClientData,
          token: token,
          // label: Data,
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
  public async futureClientsActionBtnV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const StatusLabel = await executeQuery(getStatusLabel, []);
      const refStatusLabel = StatusLabel.reduce((acc: any, row: any) => {
        acc[row.refUserStatusId] = row.refStatusType;
        return acc;
      }, {});
      const FollowUpLabel = await executeQuery(getFollowUpLabel, []);
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
          message: "Future Client Action Page Data Is Passed Successfully",
          token: token,
          label: Data,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Sending The Action Page Data",
          token: token,
        },
        true
      );
    }
  }
  public async futureClientsAuditPageV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const FutureClientPageData = await executeQuery(
        getFutureClientAuditData,
        [userData.refStId]
      );

      return encrypt(
        {
          success: true,
          message: "Future Client Action Page Data Is Passed Successfully",
          token: token,
          FutureClientAuditData: FutureClientPageData,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Sending The Action Page Data",
          token: token,
        },
        true
      );
    }
  }
  public async futureClientsAuditFollowUpV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = decodedToken.id;
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const transId = 28,
        transData = "Future Client FollowUp Data Updated",
        refUpdatedBy = refStId;

      if (userData.refFollowUpId == 6) {
        await executeQuery(maxFollowUp, [userData.refStId]);
      }


      const historyData = [
        transId, //Trance Id
        transData, // Trans Data
        userData.refStId, // trans For
        CurrentTime(), // time
        "Front Office", //updated By
        decodedToken.id, // updater Id
      ];

      const updateHistoryQueryResult = await client.query(
        updateHistoryQuery,
        historyData
      );
      

      const userStatus = [
        userData.refStId,
        userData.refStatusId,
        userData.refFollowUpId,
        userData.refComments,
        updateHistoryQueryResult.rows[0].transId,
      ];
      const updateUserStatusResult = await client.query(
        updateUserStatus,
        userStatus
      );

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Future Client Follow Up Status Us Added Successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: "Error in Adding The Future Client Follow Up Data",
          token: token,
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
