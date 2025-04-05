export const ValidateEmailUserName = `SELECT
  ud."refStId",
  u."refStFName",
  u."refStLName",
  uc."refCtEmail"
FROM
  public."refUsersDomain" ud
  INNER JOIN public."refUserCommunication" uc ON CAST(ud."refStId" AS INTEGER) = uc."refStId"
  INNER JOIN public.users u ON CAST(ud."refStId" AS INTEGER) = u."refStId"
WHERE
  (
    ud."refUserName" = $1
    OR ud."refCustPrimEmail" = $1
  )`;

export const SetOtp = `insert into
  "public"."refForgotPassword"  ("refStId", "refOtp", "refCurrnetTime")
values
  ($1, $2, $3) RETURNING *;`;

export const getOtp =
  'SELECT * FROM public."refForgotPassword"  WHERE "refFPaId"=$1; ';

export const changePassword = `UPDATE public."refUsersDomain"
SET "refCustHashedPassword"=$1,"refCustPassword"=$2 
WHERE "refStId"=$3;`;

export const validateResendMail = `SELECT
  rf."refStId",
  u."refStFName",
  u."refStLName",
  uc."refCtEmail"
FROM
  public."refForgotPassword" rf
  INNER JOIN public."refUserCommunication" uc ON CAST(rf."refStId" AS INTEGER) = uc."refStId"
  INNER JOIN public.users u ON CAST(rf."refStId" AS INTEGER) = u."refStId"
WHERE
  rf."refFPaId"=$1`;
