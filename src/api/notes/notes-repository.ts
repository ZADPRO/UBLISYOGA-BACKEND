import { generateToken, decodeToken } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { addNewNotes } from "./query";
import { viewFile, deleteFile, storeFile } from "../../helper/storage";
import path from "path";

import { executeQuery } from "../../helper/db";

export class NotesRepository {
  public async addNotesV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const params = [
        userData.refNotesName,
        userData.refNotesCatId,
        userData.refNotesType,
        userData.refNotesPath,
        userData.refDescription,
      ];
      const addNewNotesResult = await executeQuery(addNewNotes, params);

      const results = {
        success: true,
        message: "New Notes Created Successfully",
        token: token,
      };
      return encrypt(results, false);
    } catch (error) {
      const results = {
        success: false,
        message: "Erroring In creating New Notes",
        token: token,
      };
      return encrypt(results, false);
    }
  }
  public async addNotesPdfV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      let notesFile;
      if (userData.filePath) {
        const profileFilePath = userData.filePath;
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64"); // Convert file to base64 to pass in response
          notesFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "application/pdf",
          };
        } catch (err) {
          console.error("Error in retrieving The Notes PDF");
        }
      }

      const results = {
        success: true,
        message: "Notes Pdf Stored Successfully",
        token: token,
        filePath: userData.filePath,
        notesPdf: notesFile,
      };
      return encrypt(results, true);
    } catch (error) {
      const results = {
        success: false,
        message: "Error in Storing the Notes Pdf",
        token: token,
      };
      return encrypt(results, true);
    }
  }
  public async deleteNotesV1(userData: any, decodedToken: any): Promise<any> {
    const tokenData = {
      id: decodedToken.id,
      branch: decodedToken.branch,
    };
    const token = generateToken(tokenData, true);
    try {
      const filePath = userData.filePath;

      const deleteFileResult = await deleteFile(filePath);

      const results = {
        success: true,
        message: "Notes Deleted Successfully",
        token: token,
      };
      return encrypt(results, false);
    } catch (error) {
      const results = {
        success: false,
        message: "error in deleting the notes",
        token: token,
      };
      return encrypt(results, false);
    }
  }
}
