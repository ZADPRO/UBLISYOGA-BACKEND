import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFile = async (
  bucketName: string,
  keyName: string,
  fileContent: Buffer | string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: keyName,
    Body: fileContent,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${keyName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const createURL = async (
  bucketName: string,
  keyName: string,
  Expires: number,
  ContentType: string
): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: keyName,
    ContentType,
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: Expires });
    return url;
  } catch (error) {
    console.error("Error generating URL:", error);
    throw new Error("Failed to generate signed URL");
  }
};

export default s3Client;
