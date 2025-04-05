import { executeQuery, getClient } from "./db";
import { attendanceQuery, getAttendance } from "./attendanceDb";

const getTotalCount = `SELECT
  u."refSCustId",
  (
    string_to_array(
      TRIM(
        BOTH '{}'
        FROM
          rp."refTotalClassCount"
      ),
      ','
    )::int[]
  ) [
    EXTRACT(
      MONTH
      FROM
        TO_DATE($2, 'YYYY-MM-DD')
    ) - EXTRACT(
      MONTH
      FROM
        TO_DATE(rp."refPayFrom", 'YYYY-MM-DD')
    ) + 1
  ] AS "totalClassCount",
  COUNT(
    CASE 
      WHEN 
        EXTRACT(MONTH FROM TO_DATE(ga."refJoinDateTime", 'DD/MM/YYYY, HH:MI:SS AM')) = EXTRACT(MONTH FROM TO_DATE($2, 'YYYY-MM-DD'))
        AND EXTRACT(YEAR FROM TO_DATE(ga."refJoinDateTime", 'DD/MM/YYYY, HH:MI:SS AM')) = EXTRACT(YEAR FROM TO_DATE($2, 'YYYY-MM-DD'))
      THEN 1
      ELSE NULL
    END
  ) AS "onlineCount"
FROM
  public."refPayment" rp
  LEFT JOIN public."users" u ON CAST(u."refStId" AS INTEGER) = rp."refStId"
  LEFT JOIN public."refUserCommunication" uc ON CAST (u."refStId" AS INTEGER) = uc."refStId"
  LEFT JOIN public."refGoogleAttendance" ga ON CAST (uc."refCtEmail" AS TEXT) = ga."refUMailId"
WHERE
  EXTRACT(
    MONTH
    FROM
      TO_DATE(rp."refPayFrom", 'YYYY-MM-DD')
  ) <= EXTRACT(
    MONTH
    FROM
      TO_DATE($2, 'YYYY-MM-DD')
  )
  AND EXTRACT(
    MONTH
    FROM
      TO_DATE(rp."refPagExp", 'YYYY-MM-DD')
  ) >= EXTRACT(
    MONTH
    FROM
      TO_DATE($2, 'YYYY-MM-DD')
  )
  AND rp."refStId" = $1
GROUP BY u."refSCustId", rp."refTotalClassCount", rp."refPayFrom";`;

const getAttendCount = `WITH Punches AS (
  SELECT
    it.emp_code,
    punch_time AT TIME ZONE 'Asia/Kolkata' AS punch_time
  FROM
    public."iclock_transaction" it
  WHERE
    it.emp_code = $1
	  AND EXTRACT(MONTH FROM punch_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') = EXTRACT(MONTH FROM TO_DATE($2, 'YYYY-MM-DD'))
),
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

export const classCount = async (date: string, id: number) => {
  console.log("id", id);
  console.log("date line ------ 87", date);
  try {
    let count = {};
    const totalCount = await executeQuery(getTotalCount, [id, date]);
    console.log("totalCount", totalCount);

    if (totalCount.length > 0) {
      console.log(" -> Line Number ----------------------------------- 94");
      const attendCount = await attendanceQuery(getAttendCount, [
        totalCount[0].refSCustId,
        date,
      ]);
      count = {
        ...count,
        totalClassCount: parseInt(totalCount[0].totalClassCount || 0),
        classAttendCount: parseInt(attendCount[0].attendCount || 0),
        onlineCount: parseInt(totalCount[0].onlineCount || 0),
        reCount:
          parseInt(totalCount[0].totalClassCount) -
          (parseInt(attendCount[0].attendCount || 0) +
            parseInt(totalCount[0].onlineCount || 0)),
        totalAttendCount:
          parseInt(attendCount[0].attendCount || 0) +
          parseInt(totalCount[0].onlineCount || 0),
      };
    } else {
      console.log(" -> Line Number ----------------------------------- 113");
      count = {
        ...count,
        totalClassCount: 0,
        classAttendCount: 0,
        onlineCount: 0,
        totalAttendCount: 0,
        reCount: 0,
      };
      return count;
    }
    console.log("count line ---- 58", count);
    return count;
  } catch (error) {
    console.log(" -> Line Number ----------------------------------- 17");
    console.log("error", error);
  }
};
