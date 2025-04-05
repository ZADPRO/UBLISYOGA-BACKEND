export const getCurrentStudentData = `SELECT
  u."refStId",
  u."refSCustId",
  u."refStFName",
  u."refStLName",
  u."refStSex",
  CASE 
        WHEN EXTRACT(YEAR FROM AGE(u."refStDOB")) > 18 
        THEN 'Adult' 
        ELSE 'Kids' 
    END AS "userType",
  uc."refCtMobile",
  uc."refCtEmail",
  ut."refUserType",
  rp."refPaId",
  rp."refPackageName",
  CASE
    WHEN up."refClMode" = 1 THEN 'Online'
    ELSE 'Offline'
  END AS "refClMode",
  rm."refTimeMembers",
  CASE
    WHEN up."refTherapy" = true THEN 'Yes'
    ELSE 'No'
  END AS "refTherapy",
  pt1."refTime" AS "WeekDaysTiming",
  pt2."refTime" AS "WeekEndTiming"
FROM
  public."users" u
  LEFT JOIN public."refUserPackage" up ON CAST(u."refStId" AS INTEGER) = up."refStId"
  LEFT JOIN public."refMembers" rm ON CAST (up."refBatchId" AS INTEGER) = rm."refTimeMembersID"
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public."refUserType" ut ON CAST(u."refUtId" AS INTEGER) = ut."refUtId"
  LEFT JOIN public."refPackage" rp ON CAST(up."refPaId" AS INTEGER) = rp."refPaId"
  LEFT JOIN public."refPaTiming" pt1 ON CAST(up."refWeekDaysTiming" AS INTEGER) = pt1."refTimeId"
  LEFT JOIN public."refPaTiming" pt2 ON CAST(up."refWeekTiming" AS INTEGER) = pt2."refTimeId"
WHERE
  u."refUtId" = 5
  AND u."refBranchId" = $1`;

export const addTherapyAttendCount = `UPDATE public."refUserPackage" 
SET "refThreapyAttend" = COALESCE("refThreapyAttend", 0) + 1 
WHERE "refStId" = $1;`;
export const updateHistoryQuery = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy", "refActionBy"
  ) VALUES ($1, $2, $3, $4, $5,$6)
  RETURNING *;
`;

export const studentMonthWiseReport1 = `SELECT DISTINCT
  ON (u."refStId") u."refStId",
  u."refSCustId",
  u."refStFName",
  u."refStLName",
  u."refBranchId",
  INITCAP(u."refStSex") AS "refStSex",
  CASE 
        WHEN EXTRACT(YEAR FROM AGE(u."refStDOB")) > 18 
        THEN 'Adult' 
        ELSE 'Kids' 
    END AS "userType",
  uc."refCtMobile",
  uc."refCtEmail",
  rpa."refPackageName",
  
  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Weekdays Timing Selected by the Student'
    THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE pt1."refTime"
  END AS "WeekDaysTiming",
  
  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Weekend Timing Selected By the Student'
    THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE pt2."refTime"
  END AS "WeekEndTiming",

  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Student Selected Batch'
    THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE rm."refTimeMembers"
  END AS "StudentBatch",

  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Student Class Mode'
    THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE rm."refTimeMembers"
  END AS "StudentClassMode",

  CASE
    WHEN up."refTherapy" = true THEN 'Yes'
    ELSE 'No'
  END AS "refTherapy",

  CASE 
    WHEN txn."transTypeId" = 40 
      AND EXTRACT(MONTH FROM TO_TIMESTAMP($1, 'YYYY-MM-DD')) = EXTRACT(MONTH FROM TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM'))
      AND txn."transData" IS NOT NULL 
      AND txn."transData" ~ '^\{.*\}$' 
      AND txn."transData"::jsonb ->> 'label' = 'Total Therapy Class Want to Attend' 
    THEN txn."transData"::jsonb -> 'data' ->> 'oldValue' 
    ELSE CAST(up."refThreapyCount" AS text)
  END AS "TotalThearpyClassCount",

  CASE 
    WHEN EXISTS (
        SELECT 1
        FROM public."refUserTxnHistory" txn_sub
        WHERE txn_sub."refStId" = u."refStId"
        AND txn_sub."transTypeId" = 39
        AND txn_sub."transData" = 'student complete one therapy session'
        AND EXTRACT(YEAR FROM TO_DATE($1, 'YYYY-MM-DD')) = EXTRACT(YEAR FROM TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM'))
        AND EXTRACT(MONTH FROM TO_DATE($1, 'YYYY-MM-DD')) < EXTRACT(MONTH FROM TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM'))
    ) 
    THEN (
        COALESCE(up."refThreapyAttend", 0) - (
            SELECT COUNT(*)
            FROM public."refUserTxnHistory" txn_sub
            WHERE txn_sub."refStId" = u."refStId"
            AND txn_sub."transTypeId" = 39
            AND txn_sub."transData" = 'student complete one therapy session'
            AND EXTRACT(YEAR FROM TO_DATE($1, 'YYYY-MM-DD')) = EXTRACT(YEAR FROM TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM'))
            AND EXTRACT(MONTH FROM TO_DATE($1, 'YYYY-MM-DD')) < EXTRACT(MONTH FROM TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM'))
        )
    )
    ELSE up."refThreapyAttend"
END AS "ThearpyAttend"

FROM
  public."refPayment" rp
  LEFT JOIN public.users u ON CAST(u."refStId" AS INTEGER) = rp."refStId"
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public."refPackage" rpa ON CAST(rp."refPagId" AS INTEGER) = rpa."refPaId"
  LEFT JOIN public."refUserPackage" up ON CAST(u."refStId" AS INTEGER) = up."refStId"
  LEFT JOIN public."refUserTxnHistory" txn ON CAST(u."refStId" AS INTEGER) = txn."refStId"
  LEFT JOIN public."refPaTiming" pt1 ON CAST(up."refWeekDaysTiming" AS INTEGER) = pt1."refTimeId"
  LEFT JOIN public."refPaTiming" pt2 ON CAST(up."refWeekTiming" AS INTEGER) = pt2."refTimeId"
  LEFT JOIN public."refMembers" rm ON CAST(up."refBatchId" AS INTEGER) = rm."refTimeMembersID"
WHERE
  EXTRACT(MONTH FROM TO_DATE(rp."refPayFrom", 'YYYY-MM-DD')) <= EXTRACT(MONTH FROM TO_DATE($1, 'YYYY-MM-DD'))
  AND EXTRACT(MONTH FROM TO_DATE(rp."refPagExp", 'YYYY-MM-DD')) >= EXTRACT(MONTH FROM TO_DATE($1, 'YYYY-MM-DD'))
  AND txn."transTypeId" IN (36, 40, 39)
  AND txn."transData" ~ '^\{.*\}$'
  AND (
    txn."transData"::jsonb ->> 'label' = 'Weekdays Timing Selected by the Student'
    OR txn."transData"::jsonb ->> 'label' = 'Weekend Timing Selected By the Student'
    OR txn."transData"::jsonb ->> 'label' = 'Student Selected Batch'
    OR txn."transData"::jsonb ->> 'label' = 'Student Class Mode'
    OR txn."transData"::jsonb ->> 'label' = 'Total Therapy Class Want to Attend'
    OR txn."transData" = 'student complete one therapy session'
  )
ORDER BY
  u."refStId",
  txn."transTime" ASC;`;

export const studentMonthWiseReport = `SELECT DISTINCT
  ON (u."refStId") u."refStId",
  u."refSCustId",
  u."refStFName",
  u."refStLName",
  u."refBranchId",
  INITCAP(u."refStSex") AS "refStSex",
  CASE
    WHEN EXTRACT(
      YEAR
      FROM
        AGE (u."refStDOB")
    ) > 18 THEN 'Adult'
    ELSE 'Kids'
  END AS "userType",
  CASE
    WHEN EXISTS (
      SELECT
        1
      FROM
        public."refUserTxnHistory" txn_sub
      WHERE
        txn_sub."refStId" = u."refStId"
        AND txn_sub."transTypeId" = 3
        AND EXTRACT(
          MONTH
          FROM
            TO_TIMESTAMP($1, 'YYYY-MM-DD')
        ) = EXTRACT(
          MONTH
          FROM
            TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
        )
    ) THEN 'New'
    ELSE 'Old'
  END AS "studentType",
  uc."refCtMobile",
  uc."refCtEmail",
  rpa."refPackageName",
  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Weekdays Timing Selected by the Student' THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE pt1."refTime"
  END AS "WeekDaysTiming",
  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Weekend Timing Selected By the Student' THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE pt2."refTime"
  END AS "WeekEndTiming",
  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Student Selected Batch' THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE rm."refTimeMembers"
  END AS "StudentBatch",
  CASE
    WHEN txn."transTypeId" = 36
    AND TO_TIMESTAMP(rp."refPayDate", 'DD/MM/YYYY, HH:MI:SS AM') <= TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Student Class Mode' THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE rm."refTimeMembers"
  END AS "StudentClassMode",
  CASE
    WHEN up."refTherapy" = true THEN 'Yes'
    ELSE 'No'
  END AS "refTherapy",
  CASE
    WHEN txn."transTypeId" = 40
    AND EXTRACT(
      MONTH
      FROM
        TO_TIMESTAMP($1, 'YYYY-MM-DD')
    ) = EXTRACT(
      MONTH
      FROM
        TO_TIMESTAMP(txn."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
    )
    AND txn."transData" IS NOT NULL
    AND txn."transData" ~ '^\{.*\}$'
    AND txn."transData"::jsonb ->> 'label' = 'Total Therapy Class Want to Attend' THEN txn."transData"::jsonb -> 'data' ->> 'oldValue'
    ELSE CAST(up."refThreapyCount" AS text)
  END AS "TotalThearpyClassCount",
  CASE
    WHEN EXISTS (
      SELECT
        1
      FROM
        public."refUserTxnHistory" txn_sub
      WHERE
        txn_sub."refStId" = u."refStId"
        AND txn_sub."transTypeId" = 39
        AND txn_sub."transData" = 'student complete one therapy session'
        AND EXTRACT(
          YEAR
          FROM
            TO_DATE($1, 'YYYY-MM-DD')
        ) = EXTRACT(
          YEAR
          FROM
            TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
        )
        AND EXTRACT(
          MONTH
          FROM
            TO_DATE($1, 'YYYY-MM-DD')
        ) < EXTRACT(
          MONTH
          FROM
            TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
        )
    ) THEN (
      COALESCE(up."refThreapyAttend", 0) - (
        SELECT
          COUNT(*)
        FROM
          public."refUserTxnHistory" txn_sub
        WHERE
          txn_sub."refStId" = u."refStId"
          AND txn_sub."transTypeId" = 39
          AND txn_sub."transData" = 'student complete one therapy session'
          AND EXTRACT(
            YEAR
            FROM
              TO_DATE($1, 'YYYY-MM-DD')
          ) = EXTRACT(
            YEAR
            FROM
              TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
          )
          AND EXTRACT(
            MONTH
            FROM
              TO_DATE($1, 'YYYY-MM-DD')
          ) < EXTRACT(
            MONTH
            FROM
              TO_TIMESTAMP(txn_sub."transTime", 'DD/MM/YYYY, HH:MI:SS AM')
          )
      )
    )
    ELSE up."refThreapyAttend"
  END AS "ThearpyAttend"
FROM
  public."refPayment" rp
  LEFT JOIN public.users u ON CAST(u."refStId" AS INTEGER) = rp."refStId"
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public."refPackage" rpa ON CAST(rp."refPagId" AS INTEGER) = rpa."refPaId"
  LEFT JOIN public."refUserPackage" up ON CAST(u."refStId" AS INTEGER) = up."refStId"
  LEFT JOIN public."refUserTxnHistory" txn ON CAST(u."refStId" AS INTEGER) = txn."refStId"
  LEFT JOIN public."refPaTiming" pt1 ON CAST(up."refWeekDaysTiming" AS INTEGER) = pt1."refTimeId"
  LEFT JOIN public."refPaTiming" pt2 ON CAST(up."refWeekTiming" AS INTEGER) = pt2."refTimeId"
  LEFT JOIN public."refMembers" rm ON CAST(up."refBatchId" AS INTEGER) = rm."refTimeMembersID"
WHERE
  EXTRACT(
    MONTH
    FROM
      TO_DATE(rp."refPayFrom", 'YYYY-MM-DD')
  ) <= EXTRACT(
    MONTH
    FROM
      TO_DATE($1, 'YYYY-MM-DD')
  )
  AND EXTRACT(
    MONTH
    FROM
      TO_DATE(rp."refPagExp", 'YYYY-MM-DD')
  ) >= EXTRACT(
    MONTH
    FROM
      TO_DATE($1, 'YYYY-MM-DD')
  )
  AND txn."transTypeId" IN (36, 40, 39)
  AND txn."transData" ~ '^\{.*\}$'
  AND (
    txn."transData"::jsonb ->> 'label' = 'Weekdays Timing Selected by the Student'
    OR txn."transData"::jsonb ->> 'label' = 'Weekend Timing Selected By the Student'
    OR txn."transData"::jsonb ->> 'label' = 'Student Selected Batch'
    OR txn."transData"::jsonb ->> 'label' = 'Student Class Mode'
    OR txn."transData"::jsonb ->> 'label' = 'Total Therapy Class Want to Attend'
    OR txn."transData" = 'student complete one therapy session'
  )
ORDER BY
  u."refStId",
  txn."transTime" ASC;`;

export const monthWiseCount = `WITH months AS (
    SELECT generate_series(1, 12) AS month_num
)
SELECT 
    TO_CHAR(make_date(EXTRACT(YEAR FROM TO_DATE($1, 'YYYY'))::INT, m.month_num, 1), 'Month') AS month_name,
    COUNT(rp."refPayFrom") AS record_count
FROM 
    months m
LEFT JOIN public."refPayment" rp 
    ON (
        EXTRACT(YEAR FROM TO_DATE(rp."refPayFrom", 'YYYY-MM-DD')) = EXTRACT(YEAR FROM TO_DATE($1, 'YYYY'))
        OR EXTRACT(YEAR FROM TO_DATE(rp."refPagExp", 'YYYY-MM-DD')) = EXTRACT(YEAR FROM TO_DATE($1, 'YYYY'))
    )
    AND (
        EXTRACT(MONTH FROM TO_DATE(rp."refPayFrom", 'YYYY-MM-DD')) = m.month_num
        OR EXTRACT(MONTH FROM TO_DATE(rp."refPagExp", 'YYYY-MM-DD')) = m.month_num
        OR (
            TO_DATE(rp."refPayFrom", 'YYYY-MM-DD') <= make_date(EXTRACT(YEAR FROM TO_DATE($1, 'YYYY'))::INT, m.month_num, 1)
            AND TO_DATE(rp."refPagExp", 'YYYY-MM-DD') >= make_date(EXTRACT(YEAR FROM TO_DATE($1, 'YYYY'))::INT, m.month_num, 1)
        )
    )
GROUP BY m.month_num
ORDER BY m.month_num;`;
