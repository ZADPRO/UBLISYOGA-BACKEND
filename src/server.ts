"use strict";

const Hapi = require("@hapi/hapi");
import logger from "./helper/logger";
import Router from "./routes";
import { startCronJobs } from "./batchprogram/daily-jobs";

import * as DotEnv from "dotenv";

const init = async () => {
  try {
    DotEnv.config();

    const server = Hapi.server({
      host: "0.0.0.0",
      port: 6201,
      routes: {
        cors: {
          origin: ["*"], // Allowed origins
          headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"], // Allowed headers
          exposedHeaders: ["WWW-Authenticate", "Server-Authorization"], // Exposed headers
          credentials: true, // Allow credentials (cookies/auth headers)
        },
        payload: {
          maxBytes: 5242880,
        },
      },
    });

    // const server = Hapi.server({
    //   host: process.env.HOST || "localhost",
    //   port: process.env.PORT || 6201,
    //   routes: {
    //     cors: {
    //       origin: ["*"],
    //       headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
    //       exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
    //       credentials: true,
    //     },
    //     security: true,
    //     payload: {
    //       maxBytes: 5242880,
    //     },
    //   },
    // });

    // REGISTER HAPI ROUTES
    await Router.loadRoutes(server);
    startCronJobs();
    await server.start((error: any) => {
      if (error) {
        logger.error(error);
        throw error;
      }
    });

    logger.info("server running --- from server.ts", process.env.PORT);
  } catch (error) {
    logger.error("Server not running...", error);
    console.log(" -> Line Number ----------------------------------- 64");
  }
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
