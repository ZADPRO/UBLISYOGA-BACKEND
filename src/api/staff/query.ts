export const fetchClientData = `
SELECT DISTINCT ON (u."refSCustId")
    u."refStId",
    u."refSCustId",
    u."refStFName",
    u."refUtId",
    t."transTime",
    t."transTypeId",
    uc."refCtMobile",
    uc."refCtEmail",
    u."refStLName",
    us."resStatusId",
    us."refFollowUpId",
    us."refComments"
FROM
    "users" u
FULL JOIN
    public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
FULL JOIN
    public."refUserTxnHistory" t ON CAST(u."refStId" AS INTEGER) = t."refStId"
FULL JOIN
    public."refuserstatus" us ON CAST(u."refStId" AS INTEGER) = us."refStId"  -- Corrected here
WHERE
    u."refUtId" = $1
    AND t."transTypeId" = $2
ORDER BY
    u."refSCustId",
    t."transTime";
`;

export const fetchClientData1 = `
SELECT DISTINCT
  ON ("refSCustId") u."refStId",
  u."refStFName",
  u."refStLName",
  uc."refCtMobile",
  uc."refCtEmail",
  th."transTime",
  u."refUtId",
  u."refSCustId"
FROM
  public.users u
  LEFT JOIN public."refUserPackage" up ON CAST(u."refStId" AS INTEGER) = up."refStId"
  FULL JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  FULL JOIN public."refUserAddress" ad ON CAST(u."refStId" AS INTEGER) = ad."refStId"
  FULL JOIN public."refUserTxnHistory" th ON CAST(u."refStId" AS INTEGER) = th."refStId"
  LEFT JOIN public."refPayment" rp ON CAST(u."refStId" AS INTEGER) = rp."refStId"
WHERE
  u."refUtId" IN (2, 6)
  AND (
    (
    u."refUtId" = 2
    AND (
      u."refHealthIssue" IS false
      OR u."refHealthIssue" IS NULL
    )
      OR
      u."refUtId" =6
      )
  )
  AND rp."refStId" IS NULL
ORDER BY
  "refSCustId"
`;

export const fetchlabel = `
 SELECT *
  FROM public."users" u where u."refUtId" = 3
`;

export const updateUserType = `
WITH update_users AS (
  UPDATE public."users"
  SET 
    "refUtId" = $2
  WHERE "refStId" = $1
  RETURNING *
)
UPDATE public."refUserPackage"
SET 
  "refTherapy" = $3
WHERE "refStId" = $1
RETURNING *;
`;

export const rejectUser = `UPDATE public.users SET "refUtId"=$2 WHERE "refStId"=$1 RETURNING *`;

export const updateUserStatus = `
  INSERT INTO public."refuserstatus" (
    "refStId", 
    "resStatusId", 
    "refFollowUpId", 
    "refComments"
  ) VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

export const updateHistoryQuery = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy", "refActionBy"
  ) VALUES ($1, $2, $3, $4, $5,$6)
  RETURNING *;
`;

export const getStatusLabel = `
 SELECT *
  FROM public."refuserstatustype"; 
`;

export const getFollowUpLabel = `
 SELECT *
  FROM public."refuserfollowuptype"; 
`;

export const getDataForUserManagement = `
SELECT DISTINCT ON (u."refSCustId") 
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(u."refStDOB")) > 18 
        THEN 'Adult' 
        ELSE 'Kids' 
    END AS "userType",
    u.*,
    uc.*,
    ad.*,
    gh.*,
    u."refStId" AS "refStId"
FROM public.users u
LEFT JOIN public."refUserCommunication" uc
  ON u."refStId" = uc."refStId"
LEFT JOIN public."refUserAddress" ad
  ON u."refStId" = ad."refStId"
LEFT JOIN public."refGeneralHealth" gh
  ON u."refStId" = gh."refStId"
WHERE u."refUtId" IN (1, 2, 3, 5, 6)
ORDER BY u."refSCustId", u."refStId";`;

export const getSignUpCount = `  SELECT 
      SUM(count_today) AS "count_today",
      SUM(count_previous_day) AS "count_other_days"
  FROM (
      SELECT 
          u."refStId",
          COUNT(DISTINCT CASE 
              WHEN TO_TIMESTAMP(th."transTime", 'DD/MM/YYYY, HH:MI:SS PM')::date = TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS PM')::date 
              THEN th."refStId" 
              END) AS count_today,

          COUNT(DISTINCT CASE 
              WHEN TO_TIMESTAMP(th."transTime", 'DD/MM/YYYY, HH:MI:SS PM')::date <> TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS PM')::date 
              THEN th."refStId" 
              END) AS count_previous_day
      FROM public."refUserTxnHistory" th
      JOIN public.users u
      ON CAST(th."refStId" AS INTEGER) = u."refStId"
      WHERE u."refUtId" = 1 
        AND th."transTypeId" IN (1, 2)
      GROUP BY u."refStId"
  ) AS subquery;`;

export const getSignUpData = `SELECT DISTINCT
  ON (th."refStId") u."refStFName",u."refStLName",th."transTime"
FROM
  public.users u
  INNER JOIN public."refUserTxnHistory" th ON th."refStId" = u."refStId"
WHERE
  u."refUtId" = 1
  AND th."transTypeId" = 1
  AND DATE (th."transTime") = DATE (TO_TIMESTAMP($1, 'DD/MM/YYYY, HH12:MI:SS PM'))
  LIMIT 5;`;

export const getRegisterCount = `SELECT 
    COUNT(CASE 
        WHEN DATE(TO_TIMESTAMP(th."transTime", 'DD/MM/YYYY, HH12:MI:SS am')) = DATE(TO_TIMESTAMP($1, 'DD/MM/YYYY, HH12:MI:SS am')) 
        THEN 1 
        ELSE NULL 
    END) AS "count_today",
    COUNT(CASE 
        WHEN DATE(TO_TIMESTAMP(th."transTime", 'DD/MM/YYYY, HH12:MI:SS am')) < DATE(TO_TIMESTAMP($1, 'DD/MM/YYYY, HH12:MI:SS am')) 
        THEN 1 
        ELSE NULL 
    END) AS "count_other_days"
FROM 
    public."users" u
JOIN 
    public."refUserTxnHistory" th
ON 
    CAST(th."refStId" AS INTEGER) = u."refStId"
WHERE 
    u."refUtId" = 2 
    AND u."refHealthIssue" is true
    AND th."transTypeId" = 3;
`;

export const getUserStatusLabel = `SELECT * FROM public."refUserType"`;

export const getUserType = 'SELECT "refUtId" FROM  users WHERE "refStId"=$1;';

export const getStaffRestriction = `SELECT "columnName" FROM public."refRestrictions" WHERE "refUtId"=$1`;

// export const getUserCount = `WITH total_count AS (
//     SELECT COUNT(*) AS total
//     FROM public."users"
//     WHERE "refUtId" IN (1, 2, 3, 5, 6)
// )
// SELECT
//     rut."refUserType" AS user_type_label,
//     COUNT(u."refUtId") AS count,
//     ROUND(COUNT(u."refUtId")::DECIMAL / total.total * 100, 2) AS percentage
// FROM
//     public."users" u
// JOIN
//     public."refUserType" rut ON u."refUtId" = rut."refUtId"
// JOIN
//     total_count total ON true
// WHERE
//     u."refUtId" IN (1, 2, 3, 5, 6)
// GROUP BY
//     rut."refUserType", total.total;

// `;
export const getUserCount = `WITH
  total_count AS (
    SELECT
      COUNT(*) AS total
    FROM
      public."users"
    WHERE
      "refUtId" IN (1, 2, 3, 5, 6)
    UNION ALL
    SELECT
      COUNT(*)
    FROM
      public."users" u
      JOIN public."refUserPackage" up ON CAST(up."refStId" AS INTEGER) = u."refStId"
    WHERE
      up."refThreapyCount" >= 1
      AND u."refUtId" = 5
      AND (
        up."refThreapyAttend" IS NULL
        OR up."refThreapyCount" > up."refThreapyAttend"
      )
  ),
  final_total AS (
    SELECT
      SUM(total) AS grand_total
    FROM
      total_count
  )
SELECT
  user_type_label,
  count,
  ROUND(
    count::DECIMAL / (
      SELECT
        grand_total
      FROM
        final_total
    ) * 100,
    2
  ) AS percentage
FROM
  (
    -- Counting Users by User Type
    SELECT
      rut."refUserType" AS user_type_label,
      COUNT(u."refUtId") AS count
    FROM
      public."users" u
      JOIN public."refUserType" rut ON u."refUtId" = rut."refUtId"
    WHERE
      u."refUtId" IN (1, 2, 3, 5, 6)
    GROUP BY
      rut."refUserType"
    UNION ALL
    -- Counting Users with Therapy Condition
    SELECT
      'Therapy' AS user_type_label,
      COUNT(*) AS count
    FROM
      public."users" u
      JOIN public."refUserPackage" up ON CAST(up."refStId" AS INTEGER) = u."refStId"
    WHERE
      up."refThreapyCount" >= 1
      AND u."refUtId" = 5
      AND (
        up."refThreapyAttend" IS NULL
        OR up."refThreapyCount" > up."refThreapyAttend"
      )
  ) AS counts;
`;

export const getStaffCount = `WITH total_count AS (
    SELECT COUNT(*) AS total
    FROM public."users"
    WHERE "refUtId" IN (4,8,10,11,12)
)
SELECT 
    rut."refUserType" AS user_type_label,
    COUNT(u."refUtId") AS count,
    ROUND(COUNT(u."refUtId")::DECIMAL / total.total * 100, 2) AS percentage
FROM 
    public."users" u
JOIN 
    public."refUserType" rut ON u."refUtId" = rut."refUtId"
JOIN 
    total_count total ON true
WHERE 
    u."refUtId" IN (4,8,10,11,12)
GROUP BY 
    rut."refUserType", total.total;`;

export const therapistUserData = `WITH user_data AS (
    SELECT DISTINCT ON (u."refSCustId") 
        u.*, th."transTime"
    FROM public.users u
    JOIN public."refUserTxnHistory" th
    ON CAST(u."refStId" AS INTEGER) = th."refStId"
    WHERE u."refUtId" = 2
)
SELECT 
    COUNT(CASE WHEN u."transTime"::date = CURRENT_DATE THEN 1 END) AS count_today,
    COUNT(CASE WHEN u."transTime"::date != CURRENT_DATE THEN 1 END) AS count_other_days
FROM user_data u;`;

export const registerData = `SELECT DISTINCT
  ON (th."refStId") u."refStFName",u."refStLName",th."transTime"
FROM
  public.users u
  INNER JOIN public."refUserTxnHistory" th ON th."refStId" = u."refStId"
WHERE
  u."refUtId" = $1
  AND th."transTypeId" = 3
  AND (
    u."refHealthIssue" = ANY ($3)
    OR ($3 && ARRAY[NULL]::BOOLEAN[])
  )
  AND DATE (th."transTime") = DATE (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS PM'))
  LIMIT 5;`;

export const getPaymentBendingData = `SELECT DISTINCT ON (th."refStId") 
  u."refStFName", 
  u."refStLName", 
  th."transTime"
FROM public.users u
INNER JOIN public."refUserTxnHistory" th 
ON th."refStId" = u."refStId"
WHERE 
  u."refUtId" = $1
  AND th."transTypeId" = ANY($4::INTEGER[])
  AND (
    u."refHealthIssue" = ANY ($3)
    OR ($3 && ARRAY[NULL]::BOOLEAN[]) -- Check if NULL is present in the array
  )
  AND DATE(th."transTime") = DATE(TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS PM'))
LIMIT 5;
`;

export const getRecentFormData = `SELECT
  *
FROM
  public.users u
  JOIN (
    SELECT DISTINCT
      ON (th."refStId") *
    FROM
      public."refUserTxnHistory" th
    WHERE
      th."transTime"::DATE = $2::DATE
    ORDER BY
      th."refStId",
      th."transTime" DESC
  ) th ON u."refStId" = th."refStId"::INTEGER
WHERE
  u."refUtId" = $1
  AND (
    u."refHealthIssue" = ANY ($3)
    OR ($3 && ARRAY[NULL]::BOOLEAN[]) -- Check if NULL is present in the array
  )
LIMIT
  5;
`;

// export const getUpDateNotification = `SELECT th."transId",th."transTypeId",th."transData",th."transTime",th."refStId",th."refUpdatedBy",u."refSCustId"
// FROM public."refUserTxnHistory" th
// LEFT JOIN public."refNotification" rn
// ON CAST(th."transId" AS INTEGER) = rn."transId"
// JOIN public."users" u
// ON CAST(th."refStId" AS INTEGER) = u."refStId"
// WHERE th."transTypeId" IN (9, 10, 11, 12, 13, 14, 15)
//   AND (rn."refRead" IS NULL OR rn."refRead" != true);`;

export const getUserData = `SELECT * FROM public."{{tableName}}" WHERE "refStId" = $1;`;

export const userTempData = `INSERT INTO public."refTempUserData" ("refStId","transTypeId","refChanges","refData","refTable","refTime","refTransId") VALUES ($1,$2,$3,$4,$5,$6,$7);`;

// export const updateHistoryQuery1 = `
//   INSERT INTO public."refUserTxnHistory" (
//     "transTypeId","transData","refStId", "transTime", "refUpdatedBy", "refActionBy"
//   ) VALUES ($1, $2, $3, $4, $5,$6)
//   RETURNING *;
// `;

export const getTempData = `SELECT * FROM public."refTempUserData" WHERE "refTeId"=$1`;

export const getPresentHealthLabel = `SELECT
  "refHealthId",
  "refHealth"
FROM
  public."refHealthIssues"
WHERE
  "refIsDeleted" is null
  OR "refIsDeleted" = 0`;

export const updateNotification = `INSERT INTO public."refNotification" ("transId", "refRead") VALUES ($1, $2);`;

export const getProfileData = `SELECT DISTINCT ua."refStId", * FROM public.users u
LEFT JOIN public."refEmployeeData" ed
ON CAST (u."refStId" AS INTEGER)=ed."refStId"
LEFT JOIN public."refUserCommunication" uc
ON CAST (u."refStId" AS INTEGER)=uc."refStId"
LEFT JOIN public."refUserAddress" ua
ON CAST (u."refStId" AS INTEGER) = ua."refStId"
WHERE u."refStId"=$1
`;

export const getCommunicationType = `
  SELECT "refCtId", INITCAP("refCtText") AS "refCtText"
FROM public."refCommType";
`;

export const updateStaffPan = `UPDATE public."refEmployeeData" SET "refPanPath"=$1 WHERE "refStId"=$2
RETURNING *;`;

export const updateStaffAadhar = `UPDATE public."refEmployeeData" SET "refAadharPath"=$1 WHERE "refStId"=$2
RETURNING *;`;

export const updateStaffCertification = `UPDATE public."refEmployeeData" SET "refCertificationPath"=$1 WHERE "refStId"=$2
RETURNING *;`;

export const getDocuments = `SELECT * FROM public."refEmployeeData" WHERE "refStId"=$1`;

export const getTrailPaymentCount = `SELECT
  COUNT(
    CASE
      WHEN u."refUtId" = 2
      AND th."transTypeId" = 3 THEN 1
    END
  ) AS "trailCount",
  COUNT(
    CASE
      WHEN u."refUtId" = 6
      AND th."transTypeId" IN (6, 5) THEN 1
    END
  ) AS "paymentPending"
FROM
  public."users" u
  JOIN public."refUserTxnHistory" th ON CAST(th."refStId" AS INTEGER) = u."refStId"
  LEFT JOIN public."refPayment" rp ON CAST(u."refStId" AS INTEGER) = rp."refStId"
WHERE
  rp."refStId" IS NULL
  AND (
    (
    u."refUtId"= 6
    )
    OR
    (
    u."refUtId" = 2
    AND (
      u."refHealthIssue" is false
      OR u."refHealthIssue" is NULL
    )
      )
  ) `;

export const getFeesDetails = `SELECT 
  COUNT(CASE WHEN u."refUtId" = 5 AND th."transTypeId" = 4 THEN 1 END) AS "feesPaid",
  COUNT(CASE WHEN u."refUtId" = 6 AND th."transTypeId" = 8 THEN 1 END) AS "feesPending"
FROM 
  public."users" u
  JOIN public."refUserTxnHistory" th ON CAST(th."refStId" AS INTEGER) = u."refStId"
  LEFT JOIN public."refPayment" rp ON CAST(u."refStId" AS INTEGER) = rp."refStId"
WHERE 
  rp."refStId" IS NOT NULL;`;

export const getStudentChangesCount = `WITH
  ApproveCTE AS (
    SELECT
      COUNT(*) AS "ApproveCount"
    FROM
      public."refTempUserData" tu
      LEFT JOIN public."users" u ON CAST(tu."refStId" AS INTEGER) = u."refStId"
      LEFT JOIN public."refUserTxnHistory" th ON CAST(tu."refTransId" AS INTEGER) = th."transId"
    WHERE
      tu."refStatus" IS NULL
      AND th."transTypeId" = 37
  ),
  StudentReadCTE AS (
    SELECT
      COUNT(*) AS "Student_Read"
    FROM
      public."refNotification" rn
      LEFT JOIN public."refUserTxnHistory" th ON CAST(rn."transId" AS INTEGER) = th."transId"
      LEFT JOIN public."users" u ON CAST(th."refStId" AS INTEGER) = u."refStId"
    WHERE
      rn."refRead" IS NOT TRUE
      AND u."refUtId" IN (1, 2, 3, 5, 6)
      AND th."transTypeId" IN (11, 12, 13, 14, 15, 16, 17, 18)
  )
SELECT
  (
    SELECT
      "ApproveCount"
    FROM
      ApproveCTE
  ) AS "ApproveCount",
  (
    SELECT
      "Student_Read"
    FROM
      StudentReadCTE
  ) AS "Student_Read";`;

export const getEmployeeChangesCount = `WITH ApproveCTE AS (
    SELECT COUNT(*) AS "ApproveCount"
    FROM public."refTempUserData" tu
    LEFT JOIN public."users" u
    ON CAST(tu."refStId" AS INTEGER) = u."refStId"
    LEFT JOIN public."refUserTxnHistory" th
    ON CAST(tu."refTransId" AS INTEGER) = th."transId"
    WHERE tu."refStatus" IS NULL 
      AND u."refUtId" = ANY ($1::INTEGER[]) 
      AND th."transTypeId" = 37
),
StudentReadCTE AS (
    SELECT COUNT(*) AS "Student_Read"
    FROM public."refNotification" rn
    LEFT JOIN public."refUserTxnHistory" th
    ON CAST(rn."transId" AS INTEGER) = th."transId"
    LEFT JOIN public."users" u
    ON CAST(th."refStId" AS INTEGER) = u."refStId"
    WHERE rn."refRead" IS NOT TRUE 
      AND u."refUtId" = ANY ($1::INTEGER[]) 
      AND th."transTypeId" IN (11,12,13,14,15,16,17,18,20)
)
SELECT 
    (SELECT "ApproveCount" FROM ApproveCTE) AS "ApproveCount",
    (SELECT "Student_Read" FROM StudentReadCTE) AS "Employee_Read";`;

export const passToThreapist = `UPDATE public.users SET "refHealthIssue" = true WHERE "refStId"=$1`;
