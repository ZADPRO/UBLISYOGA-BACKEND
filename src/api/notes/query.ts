export const addNewNotes = `INSERT INTO public."refNotes" (
    "refDescription",
    "refNotesCatId",
    "refNotesName",
    "refNotesPath",
    "refNotesType"
)
VALUES (
    $5,$2,$1,$4,$3
);`;
