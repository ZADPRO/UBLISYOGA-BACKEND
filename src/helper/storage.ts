// fileHandler.ts
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// Define the type for the file object that Hapi provides
interface HapiFile {
  hapi: {
    filename: string;
    headers: Record<string, string>;
  };
  pipe: (dest: NodeJS.WritableStream) => Readable; // Specify the pipe method
}

// Function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let uniqueName = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueName += characters[randomIndex];
  }

  const extension = path.extname(originalName); // Get the original file extension
  return uniqueName + extension; // Append the original extension to the unique name
};

// Function to store a file
export const storeFile = async (
  file: HapiFile,
  uploadType: number // Renamed from `path` to `uploadType` for clarity
): Promise<string> => {
  let uploadDir: string;

  // Determine the directory based on the uploadType value
  if (uploadType === 1) {
    uploadDir = path.join(process.cwd(), "./src/assets/Profile");
  } else if (uploadType === 2) {
    uploadDir = path.join(process.cwd(), "./src/assets/Notes");
  } else if (uploadType === 3) {
    uploadDir = path.join(process.cwd(), "./src/assets/Medical-reports");
  } else {
    uploadDir = path.join(
      process.cwd(),
      "./src/assets/Certification & Id Proofs"
    );
  }

  const uniqueFilename = generateUniqueFilename(file.hapi.filename);
  const uploadPath = path.join(uploadDir, uniqueFilename);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create a writable stream for the file
  const fileStream = fs.createWriteStream(uploadPath);

  return new Promise((resolve, reject) => {
    const readableFileStream: Readable = file as unknown as Readable;

    readableFileStream.pipe(fileStream);

    readableFileStream.on("end", () => {
      resolve(uploadPath); // Resolve the promise with the path of the uploaded file
    });

    readableFileStream.on("error", (err: Error) => {
      reject(err); // Reject the promise if there's an error
    });
  });
};

// Function to view a stored file
export const viewFile = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      (err: NodeJS.ErrnoException | null, data?: Buffer) => {
        if (err) {
          return reject(err);
        }
        resolve(data!); // Return the file buffer
      }
    );
  });
};

export const deleteFile = async (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting old file:", err);
        return reject(err);
      }
      console.log("Old file deleted successfully");
      resolve();
    });
  });
};

export const getFileType = (filePath: string): string => {
  const extname = path.extname(filePath).toLowerCase();
  
  switch (extname) {
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
      return 'image/jpeg';  // Can be adjusted for other image types
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';  // Default for unsupported types
  }
};
