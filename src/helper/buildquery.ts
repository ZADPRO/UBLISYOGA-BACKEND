const buildUpdateQuery = (tableName: string, data: any, identifier: any) => {
  const columns = [];
  const values = [];
  let index = 1;

  // Iterate over the data object and build the query dynamically
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      columns.push(`"${key}" = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  // Add the condition (e.g., WHERE "refStId" = $index)
  const condition = `"${identifier.column}" = $${index}`;
  values.push(identifier.value); // Push the identifier value for the condition

  const updateQuery = `
      UPDATE public."${tableName}"
      SET ${columns.join(", ")}
      WHERE ${condition}
      RETURNING *;
    `;

  return { updateQuery, values };
};

const buildInsertQuery = (tableName: string, data: any) => {
  const columns = [];
  const placeholders = [];
  const values = [];
  let index = 1;

  // Iterate over the data object and build the query dynamically
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      columns.push(`"${key}"`);
      placeholders.push(`$${index}`);
      values.push(data[key]);
      index++;
    }
  }

  const insertQuery = `  
    INSERT INTO public."${tableName}" (${columns.join(", ")})  
    VALUES (${placeholders.join(", ")})  
    RETURNING *;  
  `;

  return { insertQuery, values };
};

type Change = {
  oldValue: any;
  newValue: any;
};

const getChanges = (
  updatedData: any,
  oldData: any
): { [key: string]: Change } => {
  // console.log("oldData line --------- 38", oldData);
  // console.log("updatedData line ---------- 39", updatedData);
  const changes: { [key: string]: Change } = {};
  for (const key in updatedData) {
    if (updatedData.hasOwnProperty(key)) {
      if (updatedData[key] !== oldData[key]) {
        changes[key] = {
          oldValue: oldData[key],
          newValue: updatedData[key],
        };
      }
    }
  }

  console.log("changes", changes);
  return changes;
};

const getSessionPackageChanges = (
  updatedData: any,
  oldData: any[]
): { [key: string]: Change } => {
  console.log("oldData line --------- 38", oldData);
  console.log("updatedData line ---------- 39", updatedData);

  const changes: { [key: string]: Change } = {};

  // Extract the first object from oldData array (assuming it has at least one entry)
  const oldDataObj = oldData[0] || {};

  for (const key in updatedData) {
    if (updatedData.hasOwnProperty(key)) {
      if (updatedData[key] !== oldDataObj[key]) {
        changes[key] = {
          oldValue: oldDataObj[key] ?? null, // Ensure oldValue is not undefined
          newValue: updatedData[key],
        };
      }
    }
  }

  console.log("changes", changes);
  return changes;
};

const getChanges1 = (
  updatedData: any[],
  oldData: any[]
): Array<{ [key: string]: { oldValue: any; newValue: any } }> => {
  const changes: Array<{ [key: string]: { oldValue: any; newValue: any } }> =
    [];

  updatedData.forEach((updatedRow) => {
    const matchingOldRow = oldData.find(
      (oldRow) =>
        updatedRow.refMedDocId && oldRow.refMedDocId === updatedRow.refMedDocId
    );

    if (matchingOldRow) {
      // Capture changes for matching rows
      const rowChanges: { [key: string]: { oldValue: any; newValue: any } } =
        {};

      for (const key in updatedRow) {
        if (updatedRow.hasOwnProperty(key)) {
          const updatedValue = updatedRow[key];
          const oldValue = matchingOldRow[key];

          if (updatedValue !== oldValue) {
            rowChanges[key] = {
              oldValue,
              newValue: updatedValue,
            };
          }
        }
      }

      if (Object.keys(rowChanges).length > 0) {
        changes.push(rowChanges);
      }
    } else {
      // Treat as new row (no match found in oldData)
      const rowChanges: { [key: string]: { oldValue: any; newValue: any } } =
        {};

      for (const key in updatedRow) {
        if (updatedRow.hasOwnProperty(key)) {
          rowChanges[key] = {
            oldValue: null, // New row has no oldValue
            newValue: updatedRow[key],
          };
        }
      }
      changes.push(rowChanges);
    }
  });

  return changes;
};

export {
  buildUpdateQuery,
  getChanges,
  buildInsertQuery,
  getChanges1,
  getSessionPackageChanges,
};
