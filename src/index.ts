// NEED TO IMPLEMENT THE REDIS CONCEPT

// import * as DotEnv from "dotenv";
// import Server from "./server";
// import dbConnection from "./db";
// import bugsnag from "@bugsnag/js";

// DotEnv.config();

// let bugsnagClient: any;
// if (process.env.NODE_ENV === "production") {
//   bugsnagClient = bugsnag("0c012b9f3e17d94032a9b985cecf010a");
// } else if (process.env.NODE_ENV === "acceptance") {
//   bugsnagClient = bugsnag("edd351985225209e765a5dd39dbe6b7c");
// }

// dbConnection.connect((err: Error | undefined, client, release) => {
//   if (err) {
//     console.error("Error acquiring client", err.stack);
//     return;
//   }
//   console.log("Database connected successfully!");

//   release();

//   Server.start();
// });
