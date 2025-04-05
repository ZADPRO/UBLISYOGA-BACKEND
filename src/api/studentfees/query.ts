export const getFeesStructure = `SELECT
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
    WHERE
      u."refUtId" = $1
  ) subquery
WHERE
  row_num = 1;`;
