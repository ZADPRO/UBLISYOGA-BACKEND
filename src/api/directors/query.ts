export const queryStaffDetails = `SELECT DISTINCT ON (u."refSCustId") 
    u."refStId", 
    u."refSCustId", 
    u."refStFName", 
    u."refStLName", 
    uc."refCtEmail", 
    uc."refCtMobile", 
    u."refUtId"
FROM public.users u
FULL JOIN public."refUserCommunication" uc
  ON CAST(u."refStId" AS INTEGER) = uc."refStId"
FULL JOIN public."refUserAddress" ad
  ON CAST(u."refStId" AS INTEGER) = ad."refStId"
WHERE u."refUtId" = ANY ($1::INTEGER[])
`;

export const getUserType = `SELECT * FROM public.users u WHERE u."refStId"=$1`;

export const getUserStatusLabel = `SELECT * FROM public."refUserType"`;

export const getUserData = ``;

// export const getDataForUserManagement = `
// SELECT DISTINCT ON (u."refSCustId") *
// FROM public.users u
// LEFT JOIN public."refUserCommunication" uc
//   ON CAST(u."refStId" AS INTEGER) = uc."refStId"
// LEFT JOIN public."refUserAddress" ad
//   ON CAST(u."refStId" AS INTEGER) = ad."refStId"
// LEFT JOIN public."refGeneralHealth" gh
//   ON CAST(u."refStId" AS INTEGER) = gh."refStId"
// WHERE u."refStId" = $1;`;
export const getDataForUserManagement = `
SELECT DISTINCT
  ON (u."refSCustId") u.*,
  up."refUPaId",
  up."refPaId",
  up."refClMode",
  up."refBatchId",
  up."refWeekTiming",
  up."refWeekDaysTiming",
  up."refClFrom",
  up."refClTo",
  up."refTherapy",
  up."refThreapyCount",
  up."refThreapyAttend",
  uc."refUcId",
  uc."refCtId",
  uc."refCtValue",
  uc."refCtMobile",
  uc."refCtEmail",
  uc."refCtWhatsapp",
  uc."refUcPreference",
  uc."refEmerContact",
  ad."refAdId",
  ad."refAdAdd1Type",
  ad."refAdAdd1",
  ad."refAdArea1",
  ad."refAdCity1",
  ad."refAdState1",
  ad."refAdPincode1",
  ad."refAdAdd2Type",
  ad."refAdAdd2",
  ad."refAdArea2",
  ad."refAdCity2",
  ad."refAdState2",
  ad."refAdPincode2",
  ad."refAdFlat1",
  ad."refAdFlat2",
  gh."refGenId",
  gh."refHeight",
  gh."refWeight",
  gh."refBlood",
  gh."refBMI",
  gh."refIfBP",
  gh."refBpType",
  gh."refBP",
  gh."refRecentInjuries",
  gh."refRecentInjuriesReason",
  gh."refRecentFractures",
  gh."refRecentFracturesReason",
  gh."refOthers",
  gh."refElse",
  gh."refPerHealthId",
  gh."refMedicalDetails",
  gh."refUnderPhysCare",
  gh."refDrName",
  gh."refHospital",
  gh."refBackpain",
  gh."refProblem",
  gh."refPastHistory",
  gh."refFamilyHistory",
  gh."refAnythingelse",
  gh."refOtherActivities",
  gh."refBackPainValue",
  br.*,
  rm.*,
  rp.*,
  pt."refTimeId" AS "weekEndTimingId",
  pt."refTime" AS "weekEndTiming",
  pt2."refTimeId" AS "weekDaysTimingId",
  pt2."refTime" AS "weekDaysTiming"
FROM
  public.users u
  LEFT JOIN public."refUserPackage" up ON CAST(u."refStId" AS INTEGER) = up."refStId"
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public."refUserAddress" ad ON CAST(u."refStId" AS INTEGER) = ad."refStId"
  LEFT JOIN public."refGeneralHealth" gh ON CAST(u."refStId" AS INTEGER) = gh."refStId"
  LEFT JOIN public.branch br ON CAST(u."refBranchId" AS INTEGER) = br."refbranchId"
  LEFT JOIN public."refMembers" rm ON CAST(up."refBatchId" AS INTEGER) = rm."refTimeMembersID"
  LEFT JOIN public."refPackage" rp ON CAST(up."refPaId" AS INTEGER) = rp."refPaId"
  LEFT JOIN public."refPaTiming" pt ON CAST(up."refWeekTiming" AS INTEGER) = pt."refTimeId"
  LEFT JOIN public."refPaTiming" pt2 ON CAST(up."refWeekDaysTiming" AS INTEGER) = pt2."refTimeId"
WHERE
  u."refStId" = $1;`;

export const getUserTransaction = `
SELECT
  txn.*, u."refStFName", u."refStLName", Ut."refUserType", tt."transTypeText"
FROM
  public."refUserTxnHistory" txn
  LEFT JOIN public.users u ON CAST (u."refStId" AS INTEGER) = txn."refActionBy"
  LEFT JOIN public."refUserType" ut ON CAST (u."refUtId" AS INTEGER) = ut."refUtId"
  LEFT JOIN public."transType" tt ON CAST (txn."transTypeId" AS INTEGER) = tt."transTypeId"
WHERE
  txn."refStId" = $1
ORDER BY
  txn."transTime" DESC;
`;

export const getTransaction = `SELECT
  txn.*, u."refStFName", u."refStLName", Ut."refUserType", tt."transTypeText"
FROM
  public."refUserTxnHistory" txn
  LEFT JOIN public.users u ON CAST (u."refStId" AS INTEGER) = txn."refStId"
  LEFT JOIN public."refUserType" ut ON CAST (u."refUtId" AS INTEGER) = ut."refUtId"
  LEFT JOIN public."transType" tt ON CAST (txn."transTypeId" AS INTEGER) = tt."transTypeId"
WHERE
  txn."refActionBy" = $1
  AND 
  txn."refStId" != $1
ORDER BY
  txn."transTime" DESC`;

export const getUserTypeLabelDirector = `SELECT * FROM public."refUserType" WHERE "refUtId" IN (12,4,7,8,10,11)`;
export const getUserTypeLabelAdmin = `SELECT * FROM public."refUserType" WHERE "refUtId" IN (4,8,10,11)`;

// export const getCustomerCount = `SELECT COUNT(*)
// FROM public.users
// WHERE "refSCustId" LIKE 'UBYS%';`;

export const getEmployeeCount = `SELECT COUNT(*)
FROM public.users u
WHERE u."refSCustId" LIKE '%S%' 
  AND u."refSCustId" LIKE 'UY' || $1 || '%';`;

export const insertUserQuery = `
 WITH inserted_user AS (
    INSERT INTO public.users (
        "refStFName", "refStLName", "refStDOB", 
        "refSCustId", "refUtId", "refPan", "refAadhar","refBranchId"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
    RETURNING "refStId"
)
INSERT INTO public."refEmployeeData" ("refStId") 
SELECT "refStId" FROM inserted_user
RETURNING "refStId";
`;

// export const insertUserDomainQuery = `
//   INSERT INTO public."refUsersDomain" (
//     "refStId", "refCustId","refUserName", "refCustPassword","refCustHashedPassword"
//   ) VALUES ($1, $2, $3, $4,$5)
//   RETURNING *;
// `;

export const insertUserDomainQuery = `
  INSERT INTO public."refUsersDomain" (
    "refStId", "refCustId","refUserName", "refCustPassword", 
    "refCustHashedPassword","refCustPrimEmail"
  ) VALUES ($1, $2, $3, $4, $5,$6)
  RETURNING *;
`;

export const insertUserCommunicationQuery = `
  INSERT INTO public."refUserCommunication" (
    "refStId", "refCtMobile", "refCtEmail"
  ) VALUES ($1, $2, $3)
  RETURNING *;
`;

// export const updateHistoryQuery = `
//   INSERT INTO public."refUserTxnHistory" (
//     "transTypeId", "transTime", "refStId","refUpdatedBy"
//   ) VALUES ($1, $2, $3, $4)
//   RETURNING *;
// `;

export const updateHistoryQuery = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy", "refActionBy"
  ) VALUES ($1, $2, $3, $4, $5,$6)
  RETURNING *;
`;

export const fetchFormSubmitedData = `SELECT DISTINCT
ON (u."refSCustId") 
	u."refStId",u."refSCustId",u."refStFName",u."refStLName",uc."refCtMobile",uc."refCtEmail",th."transTime",up."refTherapy"

FROM public.users u
LEFT JOIN public."refUserPackage" up ON CAST (u."refStId" AS INTEGER) = up."refStId"
FULL JOIN public."refUserCommunication" uc
  ON CAST(u."refStId" AS INTEGER) = uc."refStId"
FULL JOIN public."refUserAddress" ad
  ON CAST(u."refStId" AS INTEGER) = ad."refStId"
FULL JOIN public."refUserTxnHistory" th
  ON CAST(u."refStId" AS INTEGER) = th."refStId"
WHERE u."refUtId" = 2  
  AND u."refHealthIssue" IS true
  AND (up."refTherapy" IS NOT true OR up."refTherapy" IS NULL)
ORDER BY "refSCustId";`;

// export const updateUserType = `
//  UPDATE public."users"
// SET
//   "refUtId" = $2,"reftherapist" =$3
// WHERE "refStId" = $1
// RETURNING *;
// `;
export const updateUserType = `
WITH update_users AS (
  UPDATE public."users"
  SET "refUtId" = $2
  WHERE "refStId" = $1
  RETURNING "refStId"
)
UPDATE public."refUserPackage"
SET 
  "refTherapy" = $3,
  "refThreapyCount" = $4
WHERE "refStId" IN (SELECT "refStId" FROM update_users)
RETURNING *;

`;

export const updateUserProfile = `UPDATE public."users" SET "refProfilePath"=$1 WHERE "refStId"=$2
RETURNING *;`;

export const getUserProfile = `SELECT "refProfilePath" FROM public.users WHERE "refStId"=$1;`;

// export const getUpDateNotification = `SELECT th."transId",th."transTypeId",th."transData",th."transTime",th."refStId",th."refUpdatedBy",u."refSCustId"
// FROM public."refUserTxnHistory" th
// LEFT JOIN public."refNotification" rn
// ON CAST(th."transId" AS INTEGER) = rn."transId"
// JOIN public."users" u
// ON CAST(th."refStId" AS INTEGER) = u."refStId"
// WHERE th."transTypeId" IN (9, 10, 11, 12, 13, 14, 15)
//   AND (rn."refRead" IS NULL OR rn."refRead" != true);`;

export const getUpDateList = `SELECT
    u."refStId",
    u."refSCustId",
    u."refStFName",
    u."refStLName",
    b."refBranchName" AS "branchId",
    TO_DATE(split_part(MIN(txn."transTime"), ',', 1), 'DD/MM/YYYY') AS "refDate",
    TO_CHAR(TO_TIMESTAMP(MIN(txn."transTime"), 'DD/MM/YYYY, HH12:MI:SS am'), 'HH24:MI:SS') AS "refTime",
    COUNT(CASE WHEN notif."refRead" = false THEN 1 END) AS "unreadCount",
    CASE
        WHEN txn."transTypeId" BETWEEN 11 AND 18 OR txn."transTypeId" = 36 THEN 'Notification'
        WHEN txn."transTypeId" = 37 THEN 'Approval'
        ELSE 'other'
    END AS "groupType"
FROM
    public."refNotification" notif
JOIN
    public."refUserTxnHistory" txn ON notif."transId" = txn."transId"
JOIN
    public.users u ON u."refStId" = txn."refStId"
LEFT JOIN
    public.branch b ON u."refBranchId" = b."refbranchId"
WHERE
    notif."refRead" = false AND u."refUtId" IN (1,2,3,5,6)
GROUP BY
    u."refStId", u."refSCustId", u."refStFName", u."refStLName", b."refBranchName",
    CASE
        WHEN txn."transTypeId" BETWEEN 11 AND 18 OR txn."transTypeId" = 36 THEN 'Notification'
        WHEN txn."transTypeId" = 37 THEN 'Approval'
        ELSE 'other'
    END
ORDER BY
    u."refStId";;
`;
export const getStaffUpdateList = `SELECT
    u."refStId",
    u."refSCustId",
    u."refStFName",
    u."refStLName",
    b."refBranchName" AS "branchId",
    TO_DATE(split_part(MIN(txn."transTime"), ',', 1), 'DD/MM/YYYY') AS "refDate",
    TO_CHAR(TO_TIMESTAMP(MIN(txn."transTime"), 'DD/MM/YYYY, HH12:MI:SS am'), 'HH24:MI:SS') AS "refTime",
    COUNT(CASE WHEN notif."refRead" = false THEN 1 END) AS "unreadCount",
    CASE
        WHEN txn."transTypeId" IN (11,12,15) THEN 'Notification'
        WHEN txn."transTypeId" = 37 THEN 'Approval'
        ELSE 'other'
    END AS "groupType"
FROM
    public."refNotification" notif
JOIN
    public."refUserTxnHistory" txn ON notif."transId" = txn."transId"
JOIN
    public.users u ON u."refStId" = txn."refStId"
LEFT JOIN
    public.branch b ON u."refBranchId" = b."refbranchId"
WHERE
    notif."refRead" = false 
    AND u."refUtId" NOT IN (1, 2, 3, 5, 6)
GROUP BY
    u."refStId", u."refSCustId", u."refStFName", u."refStLName", b."refBranchName",
    CASE
        WHEN txn."transTypeId" IN (11,12,15) THEN 'Notification'
        WHEN txn."transTypeId" = 37 THEN 'Approval'
        ELSE 'other'
    END
ORDER BY
    u."refStId";
`;

// export const userUpdateAuditData = `SELECT
//     th."transId", th."transTypeId", tt."transTypeText",th."transData", th."transTime", th."refStId", th."refUpdatedBy", u."refSCustId"
// FROM
//     public."refUserTxnHistory" th
// LEFT JOIN
//     public."refNotification" rn ON CAST(th."transId" AS INTEGER) = rn."transId"
// JOIN
//     public."users" u ON CAST(th."refStId" AS INTEGER) = u."refStId"
// JOIN
//     public."transType" tt ON th."transTypeId" = tt."transTypeId"
// WHERE
//     th."transTypeId" IN (9, 10, 11, 12, 13, 14, 15) AND (rn."refRead" IS NULL OR rn."refRead" != true)AND u."refStId" = $1
// ORDER BY
//     th."transId" ASC;`;

export const userUpdateAuditData = `SELECT
th."transId", th."transTypeId", tt."transTypeText",th."transData", th."transTime", th."refStId", th."refUpdatedBy", u."refSCustId"
FROM 
public."refNotification" rn
LEFT JOIN public."refUserTxnHistory" th
ON CAST (rn."transId" AS INTEGER) = th."transId"
LEFT JOIN public.users u
ON CAST (th."refStId" AS INTEGER) = u."refStId"
LEFT JOIN public."transType" tt 
ON CAST (th."transTypeId" AS INTEGER) = tt."transTypeId"
WHERE u."refStId"=$1 AND rn."refRead" is not true AND th."transTypeId" IN (11,12,13,14,15,16,17,18,36,40)
ORDER BY 
    th."transId" ASC;`;

export const userUpdateApprovalList = `SELECT * 
FROM public."refTempUserData" td
JOIN 
    public."transType" tt ON td."transTypeId" = tt."transTypeId"
WHERE td."refStId" = $1 AND td."refStatus" IS NULL;`;

export const userAuditDataRead = `UPDATE public."refNotification" SET "refRead" = $1, "refReadBy" = $2 WHERE "transId" = $3;`;

export const getTempData = `SELECT * FROM public."refTempUserData" WHERE "refTeId"=$1`;

export const updateTempData = `UPDATE public."refTempUserData" SET "refStatus"=$1 WHERE "refTeId"=$2;
`;

export const getMailId = `SELECT "refCtEmail" FROM public."refUserCommunication" WHERE "refStId"=$1`;

export const fetchBranchList = `SELECT * FROM public.branch;`;

export const getFeesStructure = `SELECT 
    fs.*,
    b."refBranchName" AS "BranchName",
    m."refTimeMembers" AS "MemberListName",
    ct."refCustTimeData" AS "SessionTypeName"
FROM 
    public."refFeesStructure" fs
LEFT JOIN 
    public."refMembers" m ON fs."refMemberList" = m."refTimeMembersID"
LEFT JOIN 
    public."refCustTime" ct ON fs."refSessionType" = ct."refCustTimeId"
LEFT JOIN 
    public."branch" b ON fs."refBranchId" = b."refbranchId"
WHERE fs."refBranchId"=$1`;

export const getMemberList = `SELECT * FROM public."refMembers"`;

export const getCustTimeData = `SELECT * FROM public."refCustTime"`;

// export const checkFeesStructure = `WITH existing_row AS (
//     SELECT *, FALSE AS "ResultStatus"
//     FROM public."refFeesStructure"
//     WHERE "refBranchId" = $1
//       AND "refMemberList" = $2
//       AND "refSessionType" = $3
// ),
// inserted_row AS (
//     INSERT INTO public."refFeesStructure" ("refBranchId", "refMemberList", "refSessionType", "refFees", "refGst", "refFeTotal")
//     SELECT $1, $2, $3, $4, $5, $6
//     WHERE NOT EXISTS (SELECT 1 FROM existing_row)
//     RETURNING *, TRUE AS "ResultStatus"
// )
// SELECT * FROM existing_row
// UNION ALL
// SELECT * FROM inserted_row;`;
export const checkFeesStructure = `WITH existing_row AS (
    SELECT *, FALSE AS "ResultStatus" 
    FROM public."refFeesStructure"
    WHERE "refBranchId" = $1
      AND "refMemberList" = $2
      AND "refSessionType" = $3
),
inserted_row AS (
    INSERT INTO public."refFeesStructure" ("refBranchId", "refMemberList", "refSessionType", "refFees", "refGst", "refFeTotal","refAmtPerDay")
    SELECT $1, $2, $3, $4, $5, $6 , $7
    WHERE NOT EXISTS (SELECT 1 FROM existing_row)
    RETURNING *, TRUE AS "ResultStatus"
)
SELECT * FROM existing_row
UNION ALL
SELECT * FROM inserted_row;`;

// export const editFeesStructure = `UPDATE public."refFeesStructure"
// SET "refFees" = $2, "refGst" = $3, "refFeTotal" = $4
// WHERE "refFeId" = $1
// RETURNING *;`;
export const editFeesStructure = `UPDATE public."refFeesStructure"
SET "refFees" = $2, "refGst" = $3, "refFeTotal" = $4, "refAmtPerDay"=$5
WHERE "refFeId" = $1
RETURNING *;`;

export const deleteFeesStructure = `DELETE FROM public."refFeesStructure" WHERE "refFeId"=$1;`;

// export const getOfferStructure = `SELECT
//     o.*,
//     ofn."refOfferName" AS "Offer Type",
//     CASE
//         WHEN CURRENT_DATE < o."refStartAt" THEN 'yet to start'
//         WHEN CURRENT_DATE BETWEEN o."refStartAt" AND o."refEndAt" THEN 'live'
//         ELSE 'expire'
//     END AS "status"
// FROM
//     public."refOffers" o
// JOIN
//     public."refOfName" ofn
// ON
//     CAST(o."refOfferId" AS INTEGER) = ofn."refOfferId"
// WHERE
//     o."refOfferId" = $1;

// `;
export const getOfferStructure = `SELECT 
    o."refOfId",o."refOfferId",o."refMin",o."refOffer",o."refStartAt",o."refEndAt",o."refCoupon",o."refContent",o."refBranchId",
    string_to_array(
      regexp_replace(o."refPackage", '[{}]', '', 'g'),
      ','
    )::INTEGER[] AS "refPackage",
    string_to_array(
      regexp_replace(o."refBatch", '[{}]', '', 'g'),
      ','
    )::INTEGER[] AS "refBatch",
    ofn."refOfferName" AS "Offer Type",
    CASE 
        WHEN CURRENT_DATE < o."refStartAt" THEN 'yet to start'
        WHEN CURRENT_DATE BETWEEN o."refStartAt" AND o."refEndAt" THEN 'live'
        ELSE 'expire'
    END AS "status"
FROM 
    public."refOffers" o 
JOIN 
    public."refOfName" ofn
ON 
    CAST(o."refOfferId" AS INTEGER) = ofn."refOfferId"
WHERE 
    o."refOfferId" = $1 AND "refBranchId"=$2;

`;

export const getOffersName = `SELECT "refOfferId","refOfferName" FROM public."refOfName"`;

export const validateCouponCode = `SELECT * FROM public."refOffers"
WHERE "refCoupon"=$1;`;

export const getPackageQuery = `SELECT "refPaId","refPackageName" FROM public."refPackage" WHERE "refBranchId" = $1;`;

export const getBatchQuery = `SELECT * FROM public."refMembers";`;

// export const insertNewOffers = `INSERT INTO public."refOffers"
// ("refOfferId","refMin","refOffer","refStartAt","refEndAt","refCoupon","refContent","refBranchId") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;
// `;

export const insertNewOffers = `INSERT INTO public."refOffers"
(
  "refOfferId",
  "refMin",
  "refOffer",
  "refStartAt",
  "refEndAt",
  "refCoupon",
  "refContent",
  "refBranchId",
  "refPackage",
  "refBatch"
) 
VALUES (
$1, 
$2, 
$3, 
$4, 
$5, 
$6,
$7, 
$8, 
$9::integer[], 
$10::integer[]
)
RETURNING *;
`;

export const editOffers = `UPDATE
  public."refOffers"
SET
  "refMin" = $2,
  "refOffer" = $3,
  "refStartAt" = $4,
  "refEndAt" = $5,
  "refContent" = $6,
  "refPackage" = $7::integer[],
  "refBatch" = $8::integer[]
WHERE
  "refOfId" = $1
RETURNING
  *;`;

export const deleteOffers = `DELETE FROM public."refOffers" WHERE "refOfId"=$1;`;

export const getPackageOptions = `SELECT
  rp."refPaId",rp."refPackageName"
FROM
  public."refPackage" rp
WHERE
  rp."refBranchId" = $1
  AND
  (rp."refDeleteAt" IS null OR rp."refDeleteAt" = 0)`;

export const getBatchOption = `SELECT * FROM public."refMembers" rm`;
