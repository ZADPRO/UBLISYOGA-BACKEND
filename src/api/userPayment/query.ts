export const initialDataOfPayment = `SELECT
  u."refStId",
  u."refSCustId",
  u."refStFName",
  u."refStLName",
  up."refClTo",
  rp."refPackageName",
  pt."refTime" AS "weekDaysTiming",
  pt1."refTime" AS "weekEndTiming",
  up."refClMode",
  rp."refFeesType",
  rp."refFees",
  rp."refPaId",
  rm."refTimeMembers"
FROM
  public.users u
  LEFT JOIN public."refUserPackage" up ON CAST (up."refStId" AS INTEGER) = u."refStId"
  LEFT JOIN public."refPackage" rp ON CAST(up."refPaId" AS INTEGER) = rp."refPaId"
  LEFT JOIN public."refPaTiming" pt ON CAST(up."refWeekDaysTiming" AS INTEGER) = pt."refTimeId"
  LEFT JOIN public."refPaTiming" pt1 ON CAST(up."refWeekTiming" AS INTEGER) = pt1."refTimeId"
  LEFT JOIN public."refMembers" rm ON CAST(up."refBatchId" AS INTEGER) = rm."refTimeMembersID"
WHERE
  u."refStId" = $1;
`;

export const otherPackage = `
SELECT
  rp.*,
  ARRAY_AGG(rm."refTimeMembers") AS refTimeMembersArray
FROM
  public."refPackage" rp
  INNER JOIN public."refMembers" rm ON rm."refTimeMembersID" = ANY (
    string_to_array(
      regexp_replace(rp."refMemberType", '[{}]', '', 'g'),
      ','
    )::INTEGER[]
  )
WHERE
  rp."refPaId" != $1
GROUP BY
  rp."refPaId";`;

export const getUserData = `SELECT 
u."refBranchId",
up."refPaId",
up."refBatchId"
FROM public.users u
LEFT JOIN public."refUserPackage" up ON CAST (u."refStId" AS INTEGER) = up."refStId"
WHERE u."refStId"=$1`;

// export const verifyCoupon = `SELECT
// ofn."refOfferName",
//     o.*,
//     CASE
//         WHEN CURRENT_DATE BETWEEN o."refStartAt" AND o."refEndAt" AND
//         ((o."refOfferId" IN (1,2) AND o."refMin"<=$2) OR (o."refOfferId"=3 AND o."refMin"<=$3) )
//         THEN true
//         ELSE false
//     END AS "isValid"
// FROM public."refOffers" o
// LEFT JOIN public."refOfName" ofn
// ON CAST (o."refOfferId" AS INTEGER) = ofn."refOfferId"
// WHERE o."refCoupon" = $1;`;
export const verifyCoupon = `SELECT
  ofn."refOfferName",
  o.*,
  CASE
    WHEN CURRENT_DATE BETWEEN o."refStartAt" AND o."refEndAt"
    AND (
      (
        o."refOfferId" IN (1, 2)
        AND o."refMin" <= $2
      )
      OR (
        o."refOfferId" = 3
        AND o."refMin" <= $3
      )
    )
    AND o."refBranchId" = $4
    AND $5 = ANY (
      string_to_array(
        regexp_replace(o."refPackage", '[{}]', '', 'g'),
        ','
      )::INTEGER[]
    )
    AND $6 = ANY (
      string_to_array(
        regexp_replace(o."refBatch", '[{}]', '', 'g'),
        ','
      )::INTEGER[]
    ) THEN true
    ELSE false
  END AS "isValid"
FROM
  public."refOffers" o
  LEFT JOIN public."refOfName" ofn ON CAST(o."refOfferId" AS INTEGER) = ofn."refOfferId"
WHERE
  o."refCoupon" = $1;`;

export const invoiceAuditData = `SELECT DISTINCT ON (rp."refOrderId", rp."refTransId")
  rp."refOrderId",
  rp."refTransId",
  CASE
    WHEN rp."refCustomClass" IS TRUE THEN 'Custom Class'
    ELSE rp."refPackage"
  END AS "refPackage",
  rp."refPayFrom",
  rp."refPayTo",
  rp."refPagExp",
  rp."refPayDate",
  pt."refPayTyName",
  CASE
    WHEN rp."refFeesType" = 1 THEN 'Online'
    ELSE 'Offline'
  END AS "refFeesType",
  rp."refFeesPaid"
FROM public."refPayment" rp
LEFT JOIN public."refPaymentType" pt 
  ON CAST(pt."refPayTyId" AS INTEGER) = rp."refPayTyId"
WHERE rp."refStId" = $1
AND rp."refPayStatus" IS TRUE
ORDER BY rp."refOrderId", rp."refTransId", rp."refPayDate" DESC`;

// export const downloadInvoice = `SELECT
//   u."refStId",
//   u."refSCustId",
//   (u."refStFName" || ' ' || u."refStLName") AS "refName",
//   uc."refCtMobile",
//   rp."refPayDate",
//   b."refBranchName",
//   rp."refOrderId",
//   rp."refTransId",
//   CASE
//   WHEN rp."refCustomClass" is true THEN 'Custom Class'
//   ELSE rp."refPackage"
//   END AS "refPackage",
//   (rp."refPayFrom" || ' to ' || rp."refPayTo") AS "refDuration",
//   rp."refPagFees",
//   ona."refOfferName",
//   ona."refOfferId",
//   ro."refOffer",
//   CASE
//     WHEN rp."refOffType" = 1 THEN (
//       rp."refPagFees" - ((rp."refPagFees" / 100) * ro."refOffer")
//     )::TEXT
//     WHEN rp."refFeesType" = 2 THEN (rp."refPagFees" - ro."refOffer")::TEXT
//     WHEN rp."refOffType" = 3 THEN (
//       rp."refPagFees"::TEXT || ' + ' || ro."refOffer"::TEXT || ' Month Free'
//     )
//     ELSE rp."refPagFees"::TEXT -- Explicitly cast ELSE to TEXT
//   END AS "sub_amount",
//   rp."refPagExp",
//   rp."refPaymentCharge",
//   rp."refFeesPaid"
// FROM
//   public."refPayment" rp
//   LEFT JOIN public.users u ON CAST(u."refStId" AS INTEGER) = rp."refStId"
//   LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
//   LEFT JOIN public.branch b ON CAST(b."refbranchId" AS INTEGER) = u."refBranchId"
//   LEFT JOIN public."refOffers" ro ON CAST(rp."refOffId" AS INTEGER) = ro."refOfId"
//   LEFT JOIN public."refOfName" ona ON CAST(ona."refOfferId" AS INTEGER) = ro."refOfferId"
// WHERE
//   rp."refOrderId" = $1;`;
export const downloadInvoice = `SELECT
  u."refStId",
  u."refSCustId",
  (u."refStFName" || ' ' || u."refStLName") AS "refName",
  uc."refCtMobile",
  rp."refPayDate",
  b."refBranchName",
  rp."refOrderId",
  rp."refTransId",
  CASE
  WHEN rp."refCustomClass" is true THEN 'Custom Class'
  ELSE rp."refPackage"
  END AS "refPackage",
  CASE
  WHEN rp."refPayFrom" is null THEN (rp."refTotalClassCount" || ' Class') ELSE (rp."refPayFrom" || ' to ' || rp."refPayTo")
  END AS "refDuration",
  rp."refPagFees",
  ona."refOfferName",
  ona."refOfferId",
  ro."refOffer",
  CASE
    WHEN rp."refOffType" = 1 THEN (
      rp."refPagFees" - ((rp."refPagFees" / 100) * ro."refOffer")
    )::TEXT
    WHEN rp."refFeesType" = 2 THEN (rp."refPagFees" - ro."refOffer")::TEXT
    WHEN rp."refOffType" = 3 THEN (
      rp."refPagFees"::TEXT || ' + ' || ro."refOffer"::TEXT || ' Month Free'
    )
    ELSE rp."refPagFees"::TEXT -- Explicitly cast ELSE to TEXT
  END AS "sub_amount",
  rp."refPagExp",
  rp."refPaymentCharge",
  rp."refFeesPaid"
FROM
  public."refPayment" rp
  LEFT JOIN public.users u ON CAST(u."refStId" AS INTEGER) = rp."refStId"
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public.branch b ON CAST(b."refbranchId" AS INTEGER) = u."refBranchId"
  LEFT JOIN public."refOffers" ro ON CAST(rp."refOffId" AS INTEGER) = ro."refOfId"
  LEFT JOIN public."refOfName" ona ON CAST(ona."refOfferId" AS INTEGER) = ro."refOfferId"
WHERE
  rp."refOrderId" = $1;`;

export const pastFessCount = `SELECT COUNT(*) FROM public."refPayment" WHERE "refStId"=$1`;

export const paymentCount = `SELECT
  COUNT(*)
FROM
  public."refPayment" rp
WHERE
  TO_CHAR(rp."refPayDate"::TIMESTAMP, 'DD/MM/YYYY') = TO_CHAR(TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM'), 'DD/MM/YYYY');`;

export const newPayment = `INSERT into
  public."refPayment" rp (
    rp."refStId",
    rp."refOrderId",
    rp."refTransId",
    rp."refPagId",
    rp."refPayFrom",
    rp."refPayTo",
    rp."refPagExp",
    rp."refOffId",
    rp."refOffType",
    rp."refFeesType",
    rp."refPagFees",
    rp."refFeesPaid",
    rp."refCollectedBy",
    rp."refPayDate",
    rp."refPayStatus"
  )
Values
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15);`;

export const getCustId = `SELECT "refSCustId" FROM public.users WHERE "refStId" = $1`;
export const getbranchId = `SELECT
  u."refBranchId",uc."refCtWhatsapp",uc."refCtEmail"
FROM
  public.users u
  LEFT JOIN public."refUserCommunication" uc ON CAST (u."refStId" AS INTEGER) = uc."refStId"
WHERE
  u."refStId" = $1`;

export const getStudentCount = `SELECT COUNT(*)
FROM public.users
WHERE "refSCustId" NOT LIKE '%S%' 
  AND "refSCustId" LIKE 'UY' || $1 || '%';`;

export const refUtId_userId_Update = `Update public.users SET "refUtId"=5,"refSCustId"=$2 WHERE "refStId"=$1;`;
export const refUtIdUpdate = `Update public.users SET "refUtId"=5 WHERE "refStId"=$1;`;
export const updateHistoryQuery = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy", "refActionBy"
  ) VALUES ($1, $2, $3, $4, $5,$6)
  RETURNING *;
`;

export const getUserDetailsPaymentPageQuery = `
SELECT 
u."refStId",
u."refSCustId",
u."refStFName",
rp."refPaId",
rp."refPackageName",
rp."refWTimingId",
rp."refWeTimingId",
rp."refFees",
rpt1."refTime" AS "weekDaysTiming",
rpt2."refTime" AS "weekEndTiming",
u."refBranchId",
rup."refBatchId",
rp."refFeesType",
rp."refClsDuration",
rp."refClsCount"
FROM 
public."users" u
LEFT JOIN "refUserPackage" as rup ON u."refStId" = rup."refStId"
LEFT JOIN public."refPackage" rp ON rp."refPaId" = rup."refPaId"::INTEGER
LEFT JOIN public."refPaTiming" rpt1 ON CAST (rpt1."refTimeId" AS INTEGER) = rup."refWeekDaysTiming"
LEFT JOIN public."refPaTiming" rpt2 ON CAST (rpt2."refTimeId" AS INTEGER) = rup."refWeekTiming"
WHERE u."refStId" = $1;
`;

export const getotherPackagePaymentPageQuery = `
SELECT 
rp.*,
  ARRAY_AGG(rm."refTimeMembers") AS refTimeMembersArray
  FROM
  public."refPackage" rp
  JOIN public."refMembers" rm ON CAST (rm."refTimeMembersID" AS INTEGER )= ANY (
    string_to_array(
      regexp_replace(rp."refMemberType", '[{}]', '', 'g'),
      ','
    )::INTEGER[]
  )
  WHERE  rp."refPaId" != $1 AND rp."refBranchId" = $2
GROUP BY rp."refPaId"
`;

// export const getOffersQuery = `
//   SELECT
//   ro.*,
//   rn."refOfferName",
//   CASE
//     WHEN
//       $3 = ANY (
//         string_to_array(
//           regexp_replace(ro."refPackage", '[{}]', '', 'g'),
//           ','
//         )::INTEGER[]
//       )
//       AND
//       $4 = ANY (
//         string_to_array(
//           regexp_replace(ro."refBatch", '[{}]', '', 'g'),
//           ','
//         )::INTEGER[]
//       )
//       AND ro."refStartAt"::DATE <=TO_DATE($2, 'DD/MM/YYYY')
//     THEN true
//     ELSE false
//   END AS "canUse"
// FROM
//   public."refOffers" ro
//   JOIN public."refOfName" rn ON CAST(rn."refOfferId" AS INTEGER) = ro."refOfId"
// WHERE
//   ro."refBranchId" = $1
//   AND ro."refEndAt"::DATE >= TO_DATE($2, 'DD/MM/YYYY');
//   `;

export const getOffersQuery = `SELECT
  ro.*,
  rn."refOfferName",
  ARRAY_AGG(DISTINCT rm."refTimeMembers") AS "refTimeMembers",
  ARRAY_AGG(DISTINCT rp."refPackageName") AS "refPackageName",
  CASE
    WHEN $3 = ANY (
      string_to_array(
        regexp_replace(ro."refPackage", '[{}]', '', 'g'),
        ','
      )::INTEGER[]
    )
    AND $4 = ANY (
      string_to_array(
        regexp_replace(ro."refBatch", '[{}]', '', 'g'),
        ','
      )::INTEGER[]
    )
    AND ro."refStartAt"::DATE <= TO_DATE($2, 'DD/MM/YYYY')
    AND ro."refEndAt"::DATE >= TO_DATE($2, 'DD/MM/YYYY') THEN true
    ELSE false
  END AS "canUse"
FROM
  public."refOffers" ro
  JOIN public."refOfName" rn ON CAST(rn."refOfferId" AS INTEGER) = ro."refOfferId"
  JOIN public."refMembers" rm ON CAST(rm."refTimeMembersID" AS INTEGER) = ANY (
    string_to_array(
      regexp_replace(ro."refBatch", '[{}]', '', 'g'),
      ','
    )::INTEGER[]
  )
  JOIN public."refPackage" rp ON CAST(rp."refPaId" AS INTEGER) = ANY (
    string_to_array(
      regexp_replace(ro."refPackage", '[{}]', '', 'g'),
      ','
    )::INTEGER[]
  )
WHERE
  ro."refBranchId" = $1
  AND ro."refEndAt"::DATE >= TO_DATE($2, 'DD/MM/YYYY')
GROUP BY
  ro."refOfId",
  rn."refOfferName";`;

export const getNextMonthWantPay = `SELECT
    u."refStId",
    u."refSCustId",
    u."refBranchId",
    (u."refStFName" || ' ' || u."refStLName") AS "refName",
    rp."refPackageName",
    rm."refTimeMembers",
    uc."refCtEmail",
    uc."refCtMobile",
    CASE
    WHEN COUNT(CASE WHEN rpa."refPayTyId" = 2 THEN 1 END) > 0
    THEN false
    ELSE true
    END AS "new_User",
    CASE 
        WHEN (CAST(rpay."refPagExp" AS DATE) + INTERVAL '1 month') >= TO_DATE($2, 'DD/MM/YYYY, HH:MI:SS AM') 
        THEN (CAST(rpay."refPagExp" AS DATE) + INTERVAL '1 month')::DATE
        ELSE TO_DATE(EXTRACT(MONTH FROM TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM')) || '/' || EXTRACT(YEAR FROM TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM')), 'MM/YYYY')
    END AS "nextMonth"
FROM
    public.users u
    LEFT JOIN public."refUserPackage" rup ON u."refStId" = rup."refStId"
    LEFT JOIN public."refPackage" rp ON rup."refPaId" = rp."refPaId"
    LEFT JOIN public."refMembers" rm ON rm."refTimeMembersID" = rup."refBatchId"
    LEFT JOIN public."refUserCommunication" uc ON CAST (u."refStId" AS INTEGER) = uc."refStId"
    LEFT JOIN public."refPayment" rpa ON CAST (u."refStId" AS INTEGER) = rpa."refStId"
    LEFT JOIN LATERAL (
        SELECT "refPagExp"
        FROM public."refPayment" rpay
        WHERE rpay."refStId" = u."refStId"
        ORDER BY rpay."refPayId" DESC
        LIMIT 1
    ) rpay ON TRUE
WHERE
    u."refStId" = $1
GROUP BY 
    u."refStId", u."refSCustId", u."refBranchId", u."refStFName", u."refStLName",
    rp."refPackageName", rm."refTimeMembers", uc."refCtEmail", rpay."refPagExp",uc."refCtMobile";`;

export const getOfflineAttendanceCount = `WITH Punches AS (
  SELECT
    it.emp_code,
    punch_time AT TIME ZONE 'Asia/Kolkata' AS punch_time
  FROM
    public."iclock_transaction" it
  WHERE
    it.emp_code = $1
AND DATE(punch_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') >= DATE($2)
        AND DATE(punch_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') < DATE($3)),
RankedPunches AS (
  SELECT
    emp_code,
    punch_time,
    LAG(punch_time) OVER (PARTITION BY emp_code ORDER BY punch_time) AS prev_punch_time
  FROM Punches
)
SELECT 
  COUNT(*) AS "attendCount" 
FROM RankedPunches
WHERE prev_punch_time IS NULL 
   OR EXTRACT(EPOCH FROM (punch_time - prev_punch_time)) >= 2400;`;

export const getOnlineCount = `SELECT
  COUNT(*) AS "attendCount"
FROM
  public."refGoogleAttendance" ga
WHERE
  ga."refUMailId" = $1
  AND TO_TIMESTAMP(ga."refJoinDateTime", 'DD/MM/YYYY, HH:MI:SS AM')::DATE >= $2::DATE
  AND TO_TIMESTAMP(ga."refJoinDateTime", 'DD/MM/YYYY, HH:MI:SS AM')::DATE < $3::DATE;`;

export const getUserPackageOnly = `SELECT
  rp."refPackageName",
  CASE
    WHEN rup."refClMode" = 1 
    THEN 'Online'
    ELSE 'Offline'
  END AS "Mode",
  b."refBranchName",
  rp."refFeesType",
  rp."refFees",
  rp."refClsDuration",
  rp."refClsCount",
  ARRAY_AGG(days ORDER BY days) AS "refDaysArray"
FROM
  public."refUserPackage" rup
  LEFT JOIN public."refPackage" rp ON CAST(rp."refPaId" AS INTEGER) = rup."refPaId"
  LEFT JOIN public.branch b ON CAST (b."refbranchId" AS INTEGER) = rp."refBranchId"
  LEFT JOIN public."refSessionDays" sd ON CAST (sd."refSDId" AS INTEGER) = ANY (
      string_to_array(
        regexp_replace(rp."refSessionDays", '[{}]', '', 'g'),
        ','
      )::INTEGER[]
    ),
  LATERAL UNNEST(
    CASE 
      WHEN sd."refDays" = 'All Days' THEN ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      WHEN sd."refDays" = 'Weekend' THEN ARRAY['Saturday', 'Sunday']
      WHEN sd."refDays" = 'Weekdays' THEN ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      ELSE ARRAY[sd."refDays"]
    END
  ) AS days
WHERE
  rup."refStId" = $1
GROUP BY 
  rp."refPackageName",
  rup."refClMode",
  b."refBranchName",
  rp."refFeesType",
  rp."refFees",
  rp."refClsDuration",
  rp."refClsCount";`;

export const getCustomPackage = `SELECT
  rcp."refCustomPaId",
  rcp."refBranchId",
  rcp."refFeesAmt"
FROM
  public."refCustomPackage" rcp
WHERE
  rcp."refBranchId" = $1`;

// export const getTherapyCount = `SELECT
//   (SUM(NULLIF(rp."refTotalClassCount", '')::INTEGER))::INTEGER AS "Payed_Count",
//   rup."refThreapyCount" AS "Totla_Therapy_Count",
//   CASE
//   WHEN
//   SUM(NULLIF(rp."refTotalClassCount", '')::INTEGER) < rup."refThreapyCount"
//   THEN
//   (rup."refThreapyCount" - SUM(NULLIF(rp."refTotalClassCount", '')::INTEGER))::INTEGER
//   ELSE
//   0
//   END AS "Pending_Count",
//   800 AS "Therapy_Fees"
// FROM
//   public."refPayment" rp
//   LEFT JOIN public."refUserPackage" rup ON CAST (rup."refStId" AS INTEGER) = rp."refStId"
// WHERE
//   rp."refStId" = $1
//   AND rp."refPayTyId" = 3
//   AND rup."refTherapy" is true
// GROUP BY
// rup."refThreapyCount"
//   `;
export const getTherapyCount = `SELECT 
  COALESCE(SUM(NULLIF(rp."refTotalClassCount", '')::INTEGER), 0) AS "Payed_Count",
  COALESCE(rup."refThreapyCount", 0) AS "Total_Therapy_Count",
  COALESCE(
    CASE 
      WHEN COALESCE(SUM(NULLIF(rp."refTotalClassCount", '')::INTEGER), 0) < rup."refThreapyCount"
      THEN GREATEST(rup."refThreapyCount" - COALESCE(SUM(NULLIF(rp."refTotalClassCount", '')::INTEGER), 0), 0)
      ELSE 0
    END, 0
  ) AS "Pending_Count",
  800 AS "Therapy_Fees"
FROM 
  public."refUserPackage" rup
  LEFT JOIN public."refPayment" rp 
    ON CAST(rup."refStId" AS INTEGER) = rp."refStId"
    AND rp."refPayTyId" = 3
WHERE 
  rup."refStId" = $1
  AND rup."refTherapy" IS TRUE
GROUP BY rup."refThreapyCount";
  `;

export const getOfferPointsValidation = `WITH "getCount" AS (
    SELECT 
        (EXTRACT(YEAR FROM AGE($1::DATE, rp."refPayTo"::DATE)) * 12 + 
        EXTRACT(MONTH FROM AGE($1::DATE, rp."refPayTo"::DATE))) AS "last_pay",
        rp."refPoints",
        (EXTRACT(YEAR FROM AGE($2, $1)) * 12 +
        EXTRACT(MONTH FROM AGE($2, $1))) AS "new_point"
    FROM 
        public."refPayment" rp
    WHERE 
        rp."refStId" = $3
        AND rp."refPayTyId" = 2
    ORDER BY 
        rp."refPayId" DESC
    LIMIT 1
)
SELECT
    CASE 
        WHEN gc."last_pay" > 2 THEN false 
        WHEN (gc."new_point" + gc."refPoints") >= 10 THEN true 
        ELSE false 
    END AS "use_Offer",
    CASE 
        WHEN gc."last_pay" > 2 THEN (0 + gc."new_point")  
        ELSE gc."new_point" + gc."refPoints"
    END AS "total_points",
    CASE 
        WHEN gc."last_pay" > 2 THEN (10 - gc."new_point")  
        ELSE 10 - (gc."new_point" + gc."refPoints")
    END AS "points_Need"
FROM 
    "getCount" gc;`;

export const getPointsCount = `WITH "getCount" AS (
    SELECT 
        (EXTRACT(YEAR FROM AGE($1::DATE, rp."refPayTo"::DATE)) * 12 + 
        EXTRACT(MONTH FROM AGE($1::DATE, rp."refPayTo"::DATE))) AS "last_pay",
        rp."refPoints",
        (EXTRACT(YEAR FROM AGE($2, $1)) * 12 +
        EXTRACT(MONTH FROM AGE($2, $1)) + 1) AS "new_point"
    FROM 
        public."refPayment" rp
    WHERE 
        rp."refStId" = $3
        AND rp."refPayTyId" = 2
    ORDER BY 
        rp."refPayId" DESC
    LIMIT 1
)
SELECT 
    COALESCE(gc."last_pay", 0) AS "last_pay",
    COALESCE(gc."refPoints", 0) AS "refPoints",
    (EXTRACT(YEAR FROM AGE($2, $1)) * 12 +
     EXTRACT(MONTH FROM AGE($2, $1)) + 1) AS "new_point"
FROM 
    "getCount" gc
RIGHT JOIN LATERAL (SELECT 0 AS "last_pay", 0 AS "refPoints") AS default_values ON TRUE;`;

export const addNewPayment = `INSERT INTO
  public."refPayment" (
    "refStId", 
    "refOrderId",
    "refTransId",
    "refFeesType",
    "refFeesPaid",
    "refCollectedBy",
    "refPayDate",
    "refPayStatus",
    "refPaymentCharge",
    "refPackage",
    "refPayFrom",
    "refPayTo",
    "refPagExp",
    "refOffId",
    "refOffType",
    "refPagFees",
    "refTotalClassCount",
    "refPayTyId",
    "refCustomClass",
    "refClimedFreeCourse",
    "refPoints"
  )
VALUES
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::integer[],$18,$19,$20,$21)`;

export const addNewPaymentThreapy = `INSERT INTO
  public."refPayment" (
    "refStId", 
    "refOrderId",
    "refTransId",
    "refFeesType",
    "refFeesPaid",
    "refCollectedBy",
    "refPayDate",
    "refPayStatus",
    "refPaymentCharge",
    "refPackage",
    "refPayFrom",
    "refPayTo",
    "refPagExp",
    "refOffId",
    "refOffType",
    "refPagFees",
    "refTotalClassCount",
    "refPayTyId",
    "refCustomClass",
    "refClimedFreeCourse",
    "refPoints"
  )
VALUES
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`;

export const addCashDenom = `insert into
  "public"."refCashDenomination" (
    "refOrderId",
    "refTransId",
    "refCashType",
    "ref_500",
    "ref_200",
    "ref_100",
    "ref_50",
    "ref_20",
    "ref_10",
    "refCoin"
  )
values
  (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
  );`;

export const getGoogleMeetingData = `SELECT
  ml1."refGoogleMeetId" AS "Normal_Class_Id",
  ml2."refGoogleMeetId" AS "Custom_Class_Id",
  uc."refCtEmail"
FROM
  public.users u
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public."refUserPackage" up ON CAST(up."refStId" AS INTEGER) = u."refStId"
  LEFT JOIN public."refPackage" rp ON CAST(rp."refPaId" AS INTEGER) = up."refPaId"
  LEFT JOIN public."refMeetLink" ml1 ON CAST(ml1."refMeetingId" AS INTEGER) = rp."refMeetingId"
  LEFT JOIN public."refCustomPackage" cp ON CAST(cp."refBranchId" AS INTEGER) = u."refBranchId"
  LEFT JOIN public."refMeetLink" ml2 ON CAST(ml2."refMeetingId" AS INTEGER) = cp."refMeetingLinkId"
WHERE
  u."refStId" = $1`;
