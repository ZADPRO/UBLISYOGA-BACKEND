export const getBirthdayData = `SELECT *
FROM public.users u
JOIN public."refUserCommunication"  uc
ON CAST (u."refStId" AS INTEGER) = uc."refStId"
WHERE to_char("refStDOB", 'MM-DD') = to_char(CURRENT_DATE::TIMESTAMP, 'MM-DD');`;
export const getWeedingData = `SELECT *
FROM public.users u
JOIN public."refUserCommunication"  uc
ON CAST (u."refStId" AS INTEGER) = uc."refStId"
WHERE to_char("refWeddingDate", 'MM-DD') = to_char(CURRENT_DATE::TIMESTAMP, 'MM-DD');`;
// export const getGoogleMeetCode = `WITH base_query AS (
//   SELECT
//       subquery."refBranchId",
//       ARRAY_AGG(DISTINCT subquery.val ORDER BY subquery.val) AS mergedTimingIds,
//       (
//           SELECT ARRAY_AGG(
//               TRIM(SPLIT_PART(rpt."refTime", 'to', 2))
//               ORDER BY rpt."refTime"
//           )
//           FROM public."refPaTiming" rpt
//           WHERE rpt."refTimeId" = ANY(ARRAY_AGG(DISTINCT subquery.val ORDER BY subquery.val))
//             AND (rpt."refDeleteAt" IS NULL OR rpt."refDeleteAt" = 0)
//       ) AS refTimeArray,
//       COALESCE(
//           (
//               SELECT ARRAY_AGG(rm."refMeetingCode" ORDER BY rm."refMeetingCode")
//               FROM public."refMeetLink" rm
//               WHERE rm."refBranchId" = subquery."refBranchId"
//                 AND rm."refMeetLinkType" = 1
//                 AND (rm."refDelete" IS NULL OR rm."refDelete" = FALSE)
//                 AND rm."refMeetingCode" IS NOT NULL
//           ), '{}'
//       ) AS refMeetingCodes
//   FROM (
//       SELECT
//           rp."refBranchId",
//           unnest(
//               array_cat(
//                   COALESCE(rp."refWTimingId"::integer[], '{}'::integer[]),
//                   COALESCE(rp."refWeTimingId"::integer[], '{}'::integer[])
//               )
//           ) AS val
//       FROM public."refPackage" rp
//       WHERE rp."refSessionDays"::integer[] && (
//           SELECT ARRAY(
//               SELECT rsd."refSDId"
//               FROM public."refSessionDays" rsd
//               WHERE rsd."refDays" IN (
//                   'Weekend',
//                   TRIM(TO_CHAR(TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM'), 'Day'))
//               )
//           )::integer[]
//       )
//   ) AS subquery
//   GROUP BY subquery."refBranchId"
// ),
// time_ranges AS (
//   SELECT
//       MAX(CASE WHEN "refGooAttBatchTimeID" = 1 THEN "refGooAttBatchTimeRange" END) AS min_range,
//       MAX(CASE WHEN "refGooAttBatchTimeID" = 2 THEN "refGooAttBatchTimeRange" END) AS max_range
//   FROM public."refGooAttBatchTime"
// )
// SELECT
//   bq.*
// FROM base_query bq, time_ranges tr
// WHERE EXISTS (
//     SELECT 1
//     FROM unnest(bq.refTimeArray) AS time_str
//     WHERE
//         TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM')::TIME
//         BETWEEN (time_str::TIME + (tr.min_range || ' minutes')::INTERVAL)
//             AND (time_str::TIME + (tr.max_range || ' minutes')::INTERVAL)
// );`;
export const getGoogleMeetCode = `WITH base_query AS (
  SELECT 
      subquery."refBranchId", 
      ARRAY_AGG(DISTINCT subquery.val ORDER BY subquery.val) AS mergedTimingIds,
      (
          SELECT ARRAY_AGG(
              rpt."refTime" ORDER BY rpt."refTime"
          )
          FROM public."refPaTiming" rpt
          WHERE rpt."refTimeId" = ANY(ARRAY_AGG(DISTINCT subquery.val ORDER BY subquery.val))
            AND (rpt."refDeleteAt" IS NULL OR rpt."refDeleteAt" = 0)
      ) AS refTimeArray,
      COALESCE(
          (
              SELECT ARRAY_AGG(rm."refMeetingCode" ORDER BY rm."refMeetingCode") 
              FROM public."refMeetLink" rm
              WHERE rm."refBranchId" = subquery."refBranchId" 
                AND rm."refMeetLinkType" = 1
                AND (rm."refDelete" IS NULL OR rm."refDelete" = FALSE)
                AND rm."refMeetingCode" IS NOT NULL 
          ), '{}' 
      ) AS refMeetingCodes
  FROM (
      SELECT 
          rp."refBranchId", 
          unnest(
              array_cat(
                  COALESCE(rp."refWTimingId"::integer[], '{}'::integer[]), 
                  COALESCE(rp."refWeTimingId"::integer[], '{}'::integer[])
              )
          ) AS val
      FROM public."refPackage" rp
      WHERE rp."refSessionDays"::integer[] && (
          SELECT ARRAY(
              SELECT rsd."refSDId"
              FROM public."refSessionDays" rsd
              WHERE rsd."refDays" IN (
                  'Weekend',
                  TRIM(TO_CHAR(TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM'), 'Day'))
              )
          )::integer[]
      )
  ) AS subquery
  GROUP BY subquery."refBranchId"
),
time_ranges AS (
  SELECT 
      MAX(CASE WHEN "refGooAttBatchTimeID" = 1 THEN "refGooAttBatchTimeRange" END) AS min_range,
      MAX(CASE WHEN "refGooAttBatchTimeID" = 2 THEN "refGooAttBatchTimeRange" END) AS max_range
  FROM public."refGooAttBatchTime"
)
SELECT 
  bq.*,
  ( 
    SELECT time_range 
    FROM unnest(bq.refTimeArray) AS time_range
    WHERE 
        TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM')::TIME 
        BETWEEN (SPLIT_PART(time_range, 'to', 1)::TIME + (tr.min_range || ' minutes')::INTERVAL) 
            AND (SPLIT_PART(time_range, 'to', 2)::TIME + (tr.max_range || ' minutes')::INTERVAL)
    LIMIT 1
  ) AS "matchedTimeRange"
FROM base_query bq, time_ranges tr
WHERE EXISTS (
    SELECT 1 
    FROM unnest(bq.refTimeArray) AS time_range
    WHERE 
        TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM')::TIME 
        BETWEEN (SPLIT_PART(time_range, 'to', 1)::TIME + (tr.min_range || ' minutes')::INTERVAL) 
            AND (SPLIT_PART(time_range, 'to', 2)::TIME + (tr.max_range || ' minutes')::INTERVAL)
);`;

// export const insertAttendanceData = `INSERT INTO public."refGoogleAttendance" (
//     "refBranchId",
//     "refName",
//     "refUMailId",
//     "refJoinDateTime",
//     "refDuration",
//     "refMeetingCode",
//     "refMeetingId",
//     "refTotalTimeJoin",
//     "refTotalDuration",
//     "refAttendType"
// )
// SELECT
//     (data->>'branchId')::int AS "refBranchId",
//     (record->>'name')::text AS "refName",
//     (record->>'email')::text AS "refUMailId",
//     (record->>'joinedTime')::text AS "refJoinDateTime",
//     (record->>'duration')::int AS "refDuration",
//     (record->>'meetingCode')::text AS "refMeetingCode",
//     (record->>'meetingId')::text AS "refMeetingId",
//     (record->>'TotalCount')::int AS "refTotalTimeJoin",
//     (record->>'TotalDuration')::int AS "refTotalDuration",
//     (CASE
//         WHEN (record->>'joinType')::text ILIKE 'true' THEN TRUE
//         WHEN (record->>'joinType')::text ILIKE 'false' THEN FALSE
//         ELSE FALSE -- Default to FALSE if invalid value
//     END) AS "refAttendType"
// FROM jsonb_array_elements($1::jsonb->'attendanceData') AS data,
//      jsonb_array_elements(data->'attendanceData') AS record;
// `;
export const insertAttendanceData = `WITH updated AS (
    UPDATE public."refGoogleAttendance"
    SET 
        "refDuration" = new_data."refDuration",
        "refTotalTimeJoin" = new_data."refTotalTimeJoin",
        "refTotalDuration" = new_data."refTotalDuration",
        "refAttendType" = new_data."refAttendType"
    FROM (
        SELECT 
            (data->>'branchId')::int AS "refBranchId",
            (record->>'name')::text AS "refName",
            (record->>'email')::text AS "refUMailId",
            (record->>'joinedTime')::text AS "refJoinDateTime",
            (record->>'duration')::int AS "refDuration",
            (record->>'meetingCode')::text AS "refMeetingCode",
            (record->>'meetingId')::text AS "refMeetingId",
            (record->>'TotalCount')::int AS "refTotalTimeJoin",
            (record->>'TotalDuration')::int AS "refTotalDuration",
            (CASE 
                WHEN (record->>'joinType')::text ILIKE 'true' THEN TRUE
                WHEN (record->>'joinType')::text ILIKE 'false' THEN FALSE
                ELSE FALSE
            END) AS "refAttendType"
        FROM jsonb_array_elements($1::jsonb->'attendanceData') AS data,
            jsonb_array_elements(data->'attendanceData') AS record
    ) AS new_data
    WHERE 
        public."refGoogleAttendance"."refName" = new_data."refName"
        AND public."refGoogleAttendance"."refUMailId" = new_data."refUMailId"
        AND public."refGoogleAttendance"."refBranchId" = new_data."refBranchId"
        AND public."refGoogleAttendance"."refJoinDateTime" = new_data."refJoinDateTime"
        AND public."refGoogleAttendance"."refMeetingCode" = new_data."refMeetingCode"
        AND public."refGoogleAttendance"."refMeetingId" = new_data."refMeetingId"
    RETURNING public."refGoogleAttendance".*
)
INSERT INTO public."refGoogleAttendance" (
    "refBranchId", 
    "refName", 
    "refUMailId", 
    "refJoinDateTime", 
    "refDuration", 
    "refMeetingCode", 
    "refMeetingId", 
    "refTotalTimeJoin", 
    "refTotalDuration", 
    "refAttendType"
)
SELECT 
    (data->>'branchId')::int AS "refBranchId",
    (record->>'name')::text AS "refName",
    (record->>'email')::text AS "refUMailId",
    (record->>'joinedTime')::text AS "refJoinDateTime",
    (record->>'duration')::int AS "refDuration",
    (record->>'meetingCode')::text AS "refMeetingCode",
    (record->>'meetingId')::text AS "refMeetingId",
    (record->>'TotalCount')::int AS "refTotalTimeJoin",
    (record->>'TotalDuration')::int AS "refTotalDuration",
    (CASE 
        WHEN (record->>'joinType')::text ILIKE 'true' THEN TRUE
        WHEN (record->>'joinType')::text ILIKE 'false' THEN FALSE
        ELSE FALSE
    END) AS "refAttendType"
FROM jsonb_array_elements($1::jsonb->'attendanceData') AS data,
    jsonb_array_elements(data->'attendanceData') AS record
WHERE NOT EXISTS (
    SELECT 1 FROM updated
);
`;
