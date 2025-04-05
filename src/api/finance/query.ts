export const getStudentData = `SELECT * FROM public.users u
LEFT JOIN public."refUserCommunication" uc
ON CAST (u."refStId" AS INTEGER) = uc."refStId"
WHERE u."refBranchId"=$1 AND (u."refUtId"=5 OR u."refUtId"=6)`;

export const getStudentProfileData = `SELECT
  *
FROM
  (
    SELECT
      u."refStId",
      u."refSCustId",
      u."refStFName",
      u."refStLName",
      uc."refCtMobile",
      uc."refCtEmail",
      uc."refCtWhatsapp",
      ml."refTimeMembers",
      rpt."refTime" AS "refWeekDaysTiming",
      rpt1."refTime" AS "refWeekEndTiming",
      up."refClMode",
      rp."refPayId",
      rp."refOrderId",
      rp."refTransId",
      rp."refPagId",
      rp."refPayFrom",
      rp."refPayTo",
      rp."refPagExp",
      rp."refOffId",
      rp."refFeesType",
      rp."refPagFees",
      rp."refFeesPaid",
      rp."refCollectedBy",
      rp."refPayDate",
      rp."refPayStatus",
      rof."refOffer",
      rof."refOfferId",
      ron."refOfferName",
      rpa."refPackageName",
      ROW_NUMBER() OVER (
        PARTITION BY
          u."refStId"
        ORDER BY
          rp."refPagId" DESC
      ) AS row_num
    FROM
      public.users u
      LEFT JOIN public."refUserPackage" up ON CAST(up."refStId" AS INTEGER) = u."refStId"
      LEFT JOIN public."refPackage" rpa ON CAST(rpa."refPaId" AS INTEGER) = up."refPaId"
      LEFT JOIN public."refPaTiming" rpt ON CAST(rpt."refTimeId" AS INTEGER) = up."refWeekDaysTiming"
      LEFT JOIN public."refPaTiming" rpt1 ON CAST(rpt1."refTimeId" AS INTEGER) = up."refWeekTiming"
      LEFT JOIN public."refPayment" rp ON CAST(u."refStId" AS INTEGER) = rp."refStId"
      LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
      LEFT JOIN public."refMembers" ml ON CAST(up."refBatchId" AS INTEGER) = ml."refTimeMembersID"
      LEFT JOIN public."refOffers" rof ON CAST(rp."refOffId" AS INTEGER) = rof."refOfferId"
      LEFT JOIN public."refOfName" ron ON CAST(rp."refOffType" AS INTEGER) = ron."refOfferId"
    WHERE
      u."refStId" = $1
  ) subquery
WHERE
  row_num = 1;`;

export const feesEntry = `SELECT 
    u."refStId",
    u."refSCustId",
    INITCAP(u."refStFName") AS "FirstName",
    INITCAP(u."refStLName") AS "LastName",
    ml."refTimeMembers",
    ct."refCustTimeData",
    pt."refTime",
    pt."refTimeMode",
    sd."refDays" AS "refTimeDays",
    fs."refFees",
    fs."refGst",
    fs."refFeTotal",
    COALESCE(
        TO_CHAR(
            CASE 
                WHEN up."refPaymentTo" IS NOT NULL THEN
                    (CAST(up."refExpiry" || '-01' AS DATE) + INTERVAL '1 month')
                ELSE CURRENT_DATE
            END, 'YYYY-MM'
        ), TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    ) AS "refPaymentTo",
    COALESCE(
        TO_CHAR(
            CASE 
                WHEN up."refPaymentFrom" IS NOT NULL THEN
                    (CAST(up."refExpiry" || '-01' AS DATE) + INTERVAL '1 month')
                ELSE CURRENT_DATE
            END, 'YYYY-MM'
        ), TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    ) AS "refPaymentFrom",
    up."refDate" AS "PaymentDate"
FROM public.users u
LEFT JOIN public."refFeesStructure" fs
    ON CAST(u."refSessionMode" AS INTEGER) = fs."refSessionType" 
    AND CAST(u."refSessionType" AS INTEGER) = fs."refMemberList"
    AND CAST(u."refBranchId" AS INTEGER) = fs."refBranchId"
LEFT JOIN public."refMembers" ml
    ON CAST(u."refSessionType" AS INTEGER) = ml."refTimeMembersID"
LEFT JOIN (
    SELECT 
        up."refStId", 
        up."refPaymentTo", 
        up."refPaymentFrom", 
        up."refExpiry", 
        up."refDate"
    FROM public."refPayment" up
    INNER JOIN (
        SELECT "refStId", MAX("refPaId") AS latest_entry
        FROM public."refPayment"
        GROUP BY "refStId"
    ) latest_up
    ON up."refStId" = latest_up."refStId"
    AND up."refPaId" = latest_up.latest_entry
) up
    ON u."refStId" = up."refStId"
LEFT JOIN public."refCustTime" ct
    ON CAST(u."refSessionMode" AS INTEGER) = ct."refCustTimeId"
LEFT JOIN public."refTiming" pt
    ON CAST(u."refSPreferTimeId" AS INTEGER) = pt."refTimeId"
    INNER JOIN public."refSessionDays" sd ON CAST (pt."refTimeDays" AS INTEGER) = sd."refSDId"
WHERE u."refStId" = $1;`;

export const verifyCoupon = `SELECT 
ofn."refOfferName",
    o.*, 
    CASE 
        WHEN CURRENT_DATE BETWEEN o."refStartAt" AND o."refEndAt" AND
        ((o."refOfferId" IN (1,2) AND o."refMin"<=$2) OR (o."refOfferId"=3 AND o."refMin"<=$3) )
        THEN true
        ELSE false
    END AS "isValid"
FROM public."refOffers" o 
LEFT JOIN public."refOfName" ofn
ON CAST (o."refOfferId" AS INTEGER) = ofn."refOfferId"
WHERE o."refCoupon" = $1;`;

export const paymentCount = `SELECT COUNT(*) FROM public."refPayment"`;

export const setFeesStored = `INSERT INTO public."refPayment" (
  "refStId", 
  "refPaymentMode", 
  "refPaymentFrom", 
  "refCollectedBy", 
  "refDate", 
  "refExpiry", 
  "refOrderId", 
  "refTransactionId", 
  "refPaymentTo", 
  "refToAmt", 
  "refFeesPaid", 
  "refGstPaid", 
  "refCoupon",
  "refFeesAmtOf",
  "refOfferValue",
  "refOfferType"
) 
VALUES (
  $1,  -- refStId
  $2,  -- refPaymentMode
  $3,  -- refPaymentFrom
  $4,  -- refCollectedBy
  $5,  -- refDate
  $6,  -- refExpiry
  $7,  -- refOrderId
  $8,  -- refTransactionId
  $9,  -- refPaymentTo
  $10, -- refToAmt
  $11, -- refFeesPaid
  $12, -- refGstPaid
  $13, -- refCoupon
  $14, -- refFeesAmtOf
  $15, -- refOfferValue
  $16  -- refOfferType
);
`;

export const passInvoiceData = `SELECT 
  up."refOrderId",
  up."refPaymentFrom",
  up."refPaymentTo",
  up."refFeesPaid",
  up."refGstPaid",
  up."refToAmt",
  up."refOfferType",
  up."refOfferValue",
  up."refFeesAmtOf",
  up."refDate",
  up."refExpiry",
  INITCAP(b."refBranchName") AS "refBranchName",
  u."refSCustId",
  u."refStFName",
  u."refStLName",
  uc."refCtMobile",
  ml."refTimeMembers",
  ct."refCustTimeData"
FROM 
  public."refPayment" up
LEFT JOIN 
  public.users u
ON 
  up."refStId" = u."refStId"
LEFT JOIN 
  public.branch b
ON 
  u."refBranchId" = b."refbranchId"
LEFT JOIN 
  public."refUserCommunication" uc
ON 
  u."refStId" = uc."refStId"
LEFT JOIN 
  public."refMembers" ml
ON 
  u."refSessionType" = ml."refTimeMembersID"
LEFT JOIN 
  public."refCustTime" ct
ON 
  u."refSessionMode" = ct."refCustTimeId"
WHERE 
  up."refOrderId" = $1;`;

export const userPaymentAuditList = `SELECT "refOrderId", "refDate", "refExpiry" 
FROM public."refPayment" 
WHERE "refStId" = $1 
ORDER BY "refPaId" DESC;`;

export const pastFessCount = `SELECT COUNT(*) FROM public."refPayment" WHERE "refStId"=$1`;

export const getbranchId = `SELECT "refBranchId" FROM public.users WHERE "refStId"=$1`;

export const getStudentCount = `SELECT COUNT(*)
FROM public.users
WHERE "refSCustId" NOT LIKE '%S%' 
  AND "refSCustId" LIKE 'UY' || $1 || '%';`;

export const refUtIdUpdate = `Update public.users SET "refUtId"=5 WHERE "refStId"=$1;`;
export const refUtId_userId_Update = `Update public.users SET "refUtId"=5,"refSCustId"=$2 WHERE "refStId"=$1;`;

export const updateHistoryQuery = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy", "refActionBy"
  ) VALUES ($1, $2, $3, $4, $5,$6)
  RETURNING *;
`;
