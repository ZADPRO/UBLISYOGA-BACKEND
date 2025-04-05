export const checkUser = `SELECT
  tv."refStId",tv."refStartTime",tv."refEndTime",u."refStFName",u."refStLName",uc."refCtMobile",uc."refCtEmail"
FROM
  public."refTrailVideo" tv
  LEFT JOIN public.users u ON CAST(tv."refStId" AS INTEGER) = u."refStId"
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = uc."refStId"
WHERE
  tv."refStId" = $1`;

export const newEntry = `INSERT INTO "public"."refTrailVideo" ("refStId", "refStartTime", "refEndTime")
VALUES
  ($1, TO_CHAR(TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'), 'DD/MM/YYYY, HH12:MI:SS AM'),
       TO_CHAR(TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM') + INTERVAL '2 hours', 'DD/MM/YYYY, HH12:MI:SS AM'))
RETURNING *;
`;

export const updateUrl = `update
  "public"."refVideoLink"
set
  "refVdLink" = $1
where
  "refVdId" = $2;`;

export const getVideoLink = `SELECT
  vl.*,
  vla."refVdLang"
FROM
  public."refVideoLink" vl
  INNER JOIN public."refVideoLang" vla ON CAST(vl."refVdLangId" AS INTEGER) = vla."refVdLaId"
  ORDER BY vla."refVdLaId"`;

export const getUser = `SELECT DISTINCT
  ON (u."refStId") u."refStId",
  u."refSCustId",
  u."refStFName",
  u."refStLName",
  uc."refCtWhatsapp",
  uc."refCtEmail",
  tv."refStartTime",
  tv."refEndTime",
  CASE
    WHEN tv."refEndTime" IS NULL THEN true
    WHEN tv."refEndTime" IS NOT NULL
    AND TO_TIMESTAMP(tv."refEndTime", 'DD/MM/YYYY, HH12:MI:SS PM') > TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS PM') THEN true
    ELSE false
  END AS status
FROM
  public."users" u
  LEFT JOIN public."refUserCommunication" uc ON CAST(u."refStId" AS INTEGER) = CAST(uc."refStId" AS INTEGER)
  LEFT JOIN public."refTrailVideo" tv ON CAST(u."refStId" AS INTEGER) = CAST(tv."refStId" AS INTEGER)
WHERE
  u."refStId" = $1;`;
