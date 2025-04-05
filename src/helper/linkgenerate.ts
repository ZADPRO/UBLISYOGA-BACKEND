import dotenv from "dotenv";
import { sendEmail } from "./mail";
import { welcomeVideoMail } from "./mailcontent";
import { executeQuery } from "./db";
import { generateToken1 } from "./token";

dotenv.config();

export async function generateMailLink(id: number): Promise<number> {
  const query = `SELECT
  u."refStId",
  u."refStFName",
  u."refStLName",
  u."refBranchId",
  uc."refCtEmail",
  uc."refCtWhatsapp"
  FROM
  public.users u
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  WHERE
  u."refStId" = $1`;

  try {
    const data: any = await executeQuery(query, [id]);
    const baseUrl = process.env.SUB_DOMIN;
    if (!baseUrl) {
      throw new Error("SUB_DOMIN is not defined in the .env file.");
    }
    const tokens = {
      id: id,
      branch: data[0].refBranchId,
    };
    const shareToken = generateToken1(tokens, true);

    const encodedToken = encodeURIComponent(`Bearer ${shareToken}`);
    const link = `${baseUrl}?token=${encodedToken}`;

    const mailOptions = {
      to: data[0].refCtEmail,
      subject:
        "Your yoga class registration and the payment was completed successfully",
      html: welcomeVideoMail(data[0].refStFName, data[0].refStLName, link),
    };

    await sendEmail(mailOptions);
    return 0;
  } catch (error) {
    console.error("Error generating mail link:", error);
    return 1;
  }
}
