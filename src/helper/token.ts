import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { request } from "http";
import { ResponseToolkit } from "@hapi/hapi";
import { encrypt } from "./encrypt";

dotenv.config();

// Validate environment variables
if (!process.env.ACCESS_TOKEN) {
  throw new Error("ACCESS_TOKEN environment variable is not defined.");
}

// Constants
const TOKEN_EXPIRATION = "20m"; // Define token expiration as a constant

// Function to generate a token
function generateToken(tokenData: object, action: boolean): string | object {
  if (action) {
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN as string, {
      expiresIn: TOKEN_EXPIRATION,
    });
    return token;
  } else {
    return tokenData;
  }
}

function generateToken1(tokenData: object, action: boolean): string | object {
  console.log(' -> Line Number ----------------------------------- 30', );
  console.log('action', action)
  console.log(' -> Line Number ----------------------------------- 30', );
  console.log('tokenData', tokenData)
  
  if (action) {
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN as string, {
      // Do not set `expiresIn` for an infinite token lifespan
    });
    return token;
  } else {
    return tokenData;
  }
}

// Function to decode a token
function decodeToken(token: string): JwtPayload | { error: string } {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string);
    if (typeof decoded === "string") {
      return { error: "Invalid token format" };
    }
    return decoded;
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
}

function validateToken(request: any, h: ResponseToolkit) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return h.response({ error: "Token missing" }).code(401).takeover();
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = decodeToken(token);
  console.log(' -> Line Number ----------------------------------- 62', );
  console.log("decodedToken", decodedToken);

  if ("error" in decodedToken) {
    return h
      .response(
        encrypt(
          {
            token: false,
            message: decodedToken.error,
          },
          true
        )
      )
      .code(200)
      .takeover();
  }

  // Attach the decoded token to the request plugins for use in the handler
  request.plugins.token = decodedToken;
  // console.log("request.plugins.token", request.plugins.token);

  // Continue to the next step if no errors
  return h.continue;
}

export { decodeToken, generateToken, validateToken, generateToken1 };

// ___________________________________________________________________________________________________________

//OTP Validation

const TOKEN_EXPIRATION_OTP = "20m";

function generateTokenOtp(tokenData: object, action: boolean): string | object {
  if (action) {
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN as string, {
      expiresIn: TOKEN_EXPIRATION_OTP,
    });
    return token;
  } else {
    return tokenData;
  }
}

function decodeTokenOtp(token: string): JwtPayload | { error: string } {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string);
    if (typeof decoded === "string") {
      return { error: "Invalid token format" };
    }
    return decoded;
  } catch (error) {
    return { error: "Invalid or expired OTP" };
  }
}

export { generateTokenOtp, decodeTokenOtp };
