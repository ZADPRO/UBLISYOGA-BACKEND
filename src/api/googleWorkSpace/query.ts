export const getMeetingLinkType = `SELECT * FROM public."refMeetLinkType"`;
export const branch = `SELECT * FROM public.branch`;
export const insertMeetingData = `INSERT INTO
  public."refMeetLink" (
    "refGoogleMeetId",
    "refMeetLinkType",
    "refBranchId",
    "refMeetingLink",
    "refCreatedDate",
    "refMeetStartFrom",
    "refMeetEnd",
    "refStartTime",
    "refEndTime",
    "refMeetingTitle",
    "refMeetingDescription",
    "refMeetingCode"
  )
values
  ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12);`;
export const deleteMeeting = `UPDATE
  public."refMeetLink"
SET
  "refDelete" = true
WHERE
  "refGoogleMeetId" = $1`;
export const getMeetingDetails = `SELECT
  ml."refMeetingTitle",
  ml."refMeetingDescription",
  ml."refGoogleMeetId",
  ml."refMeetingLink",
  ml."refCreatedDate",
  ml."refMeetStartFrom",
  ml."refMeetEnd",
  ml."refStartTime",
  ml."refEndTime",
  b."refBranchName",
  mlt."refMLTypeName"
FROM
  public."refMeetLink" ml
  INNER JOIN public.branch b ON CAST(b."refbranchId" AS INTEGER) = ml."refBranchId"
  INNER JOIN public."refMeetLinkType" mlt ON CAST(mlt."refMLinkId" AS INTEGER) = ml."refMeetLinkType"
WHERE
 ml."refBranchId" = $1
  AND (ml."refDelete" IS NULL OR ml."refDelete" is FALSE)`;
export const getStudentList = `WITH email_status_mapping AS (
  SELECT 
    jsonb_array_elements($1::jsonb)->>'email' AS "refCtEmail",
    jsonb_array_elements($1::jsonb)->>'responseStatus' AS "status"
)

SELECT 
  u."refSCustId",
  u."refStId",
  u."refStFName",
  u."refStLName",
  u."refBranchId",
  uc."refCtMobile",
  uc."refCtEmail",
  es."status"
FROM public.users u
INNER JOIN public."refUserCommunication" uc 
  ON CAST(uc."refStId" AS INTEGER) = u."refStId"
INNER JOIN email_status_mapping es 
  ON uc."refCtEmail" = es."refCtEmail";
`;
