import { generateToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery } from "../../helper/db";
import { checkUser, newEntry, updateUrl, getVideoLink, getUser } from "./query";
import { CurrentTime } from "../../helper/common";
import { viewFile } from "../../helper/storage";
import { createURL } from "../../helper/s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { exit } from "process";
const s3Client = new S3Client({ region: "ap-south-1" });
export class TrailVideoRepository {
  public async uploadUrlV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      const bucket = "ublis-yoga-buckets";
      const folder = `trailVideo/${userData.fileName}`; // Template literal for better readability

      const Expires = 600; // 10 minutes expiry
      const ContentType = userData.fileType;

      // Ensure that createURL generates a signed PUT URL
      const UrlResult = await createURL(bucket, folder, Expires, ContentType);

      const results = {
        success: true,
        message: "Trail Video Upload URL generated successfully",
        token,
        UrlResult,
      };
      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      console.error("Error generating signed URL:", error);

      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Failed to generate trail video upload URL",
        token,
      };
      return encrypt(results, true); // Encrypt and return the error response
    }
  }
  public async UpdateUrlV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      // Update the database with the new video URL
      const update =await executeQuery(updateUrl, [userData.link, userData.id]);

      // Delete the old file from S3 if an old link exists
      if (userData.oldlink) {
        try {
          const bucketName = "ublis-yoga-buckets";
          const keyName = userData.oldlink.split(".com/")[1]; // Extract the S3 object key from the old link

          if (!keyName) {
            throw new Error("Invalid old link format. Key extraction failed.");
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

      const results = {
        success: true,
        message: "Trail Video URL is updated",
        token,
      };

      return encrypt(results, true); // Encrypt and return the response
    } catch (error) {
      console.error("Error updating trail video URL:", error);

      // Return error response if something goes wrong
      const results = {
        success: false,
        message: "Failed to update trail video URL",
        token,
      };

      return encrypt(results, true); // Encrypt and return the error response
    }
  }

  public async shareLinkV1(userData: any, decodedToken: any): Promise<any> {
    const refStId = decodedToken.id;

    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);

    try {
      let trailData = {};

      const data = await executeQuery(getUser, [
        decodedToken.id,
        CurrentTime(),
      ]);
      trailData = { ...trailData, ...data[0] };

      if (data[0].refEndTime == null) {
        const newEntryResult = await executeQuery(newEntry, [
          decodedToken.id,
          CurrentTime(),
        ]);
        trailData = {
          ...trailData,
          refStartTime: newEntryResult[0].refStartTime,
          refEndTime: newEntryResult[0].refEndTime,
        };
      } else {
        if (!data[0].status) {
          const results = {
            success: true,
            message: "Trail Video Time is Completed",
            token: token,
            data: trailData,
          };
          return encrypt(results, true);
        }
      }

      const video = await executeQuery(getVideoLink, []);
      trailData = { ...trailData, video };

      const results = {
        success: true,
        message: "Trail data passed successfully",
        token: token,
        data: trailData,
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      // Return error response
      const results = {
        success: false,
        message: "Error in passing the trail data",
        token: token,
      };
      return encrypt(results, true);
    }
  }
}
